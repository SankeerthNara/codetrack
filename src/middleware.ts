import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.match(/https:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  request.cookies.set(`sb-${getProjectRef()}-auth-token`, token);
}

// Use service role key to check email_verified — bypasses RLS for reliable reads
async function isEmailVerified(userId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return false;

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await adminSupabase
    .from('user_profiles')
    .select('email_verified')
    .eq('id', userId)
    .single();

  return profile?.email_verified === true;
}

export async function middleware(request: NextRequest) {
  injectTokenFromHeader(request);
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith('/sign-up-login-screen');
  const isVerifyEmailPage = pathname.startsWith('/verify-email');
  const isPublicPath =
    isAuthPage ||
    isVerifyEmailPage ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/');

  // Redirect unauthenticated users to login (except public pages)
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-up-login-screen';
    return NextResponse.redirect(url);
  }

  // Block unverified users from accessing the dashboard
  if (user && !isPublicPath) {
    const verified = await isEmailVerified(user.id);
    if (!verified) {
      const url = request.nextUrl.clone();
      url.pathname = '/verify-email';
      url.searchParams.set('email', user.email ?? '');
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated + verified users away from login page
  if (user && isAuthPage) {
    const verified = await isEmailVerified(user.id);
    if (verified) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    // Unverified user on auth page — let them stay
  }

  // Redirect verified users away from verify-email page
  if (user && isVerifyEmailPage) {
    const verified = await isEmailVerified(user.id);
    if (verified) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

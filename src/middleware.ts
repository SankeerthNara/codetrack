import { createServerClient } from '@supabase/ssr';
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

export async function middleware(request: NextRequest) {
  injectTokenFromHeader(request);
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
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
    pathname.startsWith('/auth/');

  // Redirect unauthenticated users to login (except public pages)
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-up-login-screen';
    return NextResponse.redirect(url);
  }

  // Block unverified users from accessing the dashboard
  if (user && !isPublicPath) {
    // Check email_verified from user_profiles (our authoritative source)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email_verified')
      .eq('id', user.id)
      .single();

    const isVerified = profile?.email_verified === true;

    if (!isVerified) {
      const url = request.nextUrl.clone();
      url.pathname = '/verify-email';
      url.searchParams.set('email', user.email ?? '');
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated + verified users away from login page
  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email_verified')
      .eq('id', user.id)
      .single();

    const isVerified = profile?.email_verified === true;
    if (isVerified) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    // Unverified user on auth page — let them stay
  }

  // Redirect verified users away from verify-email page
  if (user && isVerifyEmailPage) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email_verified')
      .eq('id', user.id)
      .single();

    if (profile?.email_verified === true) {
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

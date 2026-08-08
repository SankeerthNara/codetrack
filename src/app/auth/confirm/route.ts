import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as string | null;
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data?.user) {
      // Mark email as verified in user_profiles
      await supabase.from('user_profiles').update({ email_verified: true }).eq('id', data.user.id);

      // For password recovery, redirect to reset page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // For email confirmation, redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Invalid or expired token — redirect to sign-in with error
  return NextResponse.redirect(`${origin}/sign-up-login-screen?error=invalid_token`);
}

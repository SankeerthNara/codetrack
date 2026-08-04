import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Use service role key — bypasses RLS entirely for a reliable read
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: profile, error } = await adminSupabase
      .from('user_profiles')
      .select('email_verified')
      .eq('id', userId)
      .single();

    if (error) {
      // Row not found — treat as unverified
      return NextResponse.json({ email_verified: false });
    }

    return NextResponse.json({ email_verified: profile?.email_verified === true });
  } catch (error: any) {
    console.error('check-verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

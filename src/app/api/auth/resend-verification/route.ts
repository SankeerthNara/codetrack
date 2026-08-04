import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = 'sankeerthnara@gmail.com';
const SENDER_NAME = 'CodeTrack';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codetrack7219.builtwithrocket.new';

    if (!serviceRoleKey || !brevoApiKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl!, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Generate a new signup confirmation link for the existing user
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/confirm`,
      },
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('generateLink error:', linkError);
      return NextResponse.json(
        { error: 'Could not generate verification link. Please try signing up again.' },
        { status: 400 }
      );
    }

    const tokenHash = linkData.properties.hashed_token;
    const confirmationUrl = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=signup`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #0f0f0f; color: #e5e5e5; border-radius: 16px; border: 1px solid #262626;">
        <div style="margin-bottom: 32px;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Verify your email</h1>
          <p style="color: #a3a3a3; font-size: 15px; margin: 0;">Here is your new verification link for CodeTrack.</p>
        </div>
        <p style="color: #d4d4d4; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
          Click the button below to confirm your email address. This link expires in <strong style="color: #ffffff;">24 hours</strong>.
        </p>
        <a href="${confirmationUrl}" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; letter-spacing: 0.01em;">
          Confirm your email →
        </a>
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #262626;">
          <p style="color: #737373; font-size: 13px; margin: 0 0 8px 0;">If the button does not work, copy and paste this link:</p>
          <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin: 0;">${confirmationUrl}</p>
        </div>
        <p style="color: #525252; font-size: 12px; margin-top: 24px;">If you did not create a CodeTrack account, you can safely ignore this email.</p>
      </div>
    `;

    const brevoResponse = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email }],
        subject: 'Verify your CodeTrack email',
        htmlContent,
      }),
    });

    const brevoResult = await brevoResponse.json();

    if (!brevoResponse.ok) {
      console.error('Brevo error:', brevoResult);
      return NextResponse.json(
        { error: brevoResult?.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

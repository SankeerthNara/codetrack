import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = 'sankeerthnara@gmail.com';
const SENDER_NAME = 'CodeTrack';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codetrack7219.builtwithrocket.new';

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY not set' },
        { status: 500 }
      );
    }

    if (!brevoApiKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration: BREVO_API_KEY not set' },
        { status: 500 }
      );
    }

    // Use admin client with service role key
    const adminSupabase = createClient(supabaseUrl!, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Step 1: Create the user via admin API (bypasses email sending by Supabase)
    const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName },
      email_confirm: false, // Do NOT auto-confirm — we handle verification ourselves
    });

    if (createError) {
      // If user already exists, try to resend verification
      if (
        createError.message?.toLowerCase().includes('already registered') ||
        createError.message?.toLowerCase().includes('already been registered') ||
        createError.message?.toLowerCase().includes('user already exists')
      ) {
        return NextResponse.json(
          {
            error:
              'An account with this email already exists. Please sign in or reset your password.',
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const userId = createData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Step 2: Generate a signup confirmation link using admin API
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: `${siteUrl}/auth/confirm`,
      },
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('generateLink error:', linkError);
      return NextResponse.json({ error: 'Failed to generate verification link' }, { status: 500 });
    }

    const tokenHash = linkData.properties.hashed_token;
    const confirmationUrl = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=signup`;

    // Step 3: Send the verification email via Brevo
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #0f0f0f; color: #e5e5e5; border-radius: 16px; border: 1px solid #262626;">
        <div style="margin-bottom: 32px;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Verify your email</h1>
          <p style="color: #a3a3a3; font-size: 15px; margin: 0;">Welcome to CodeTrack, ${fullName}!</p>
        </div>
        <p style="color: #d4d4d4; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
          Click the button below to confirm your email address and activate your account. This link expires in <strong style="color: #ffffff;">24 hours</strong>.
        </p>
        <a href="${confirmationUrl}" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; letter-spacing: 0.01em;">
          Confirm your email →
        </a>
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #262626;">
          <p style="color: #737373; font-size: 13px; margin: 0 0 8px 0;">If the button doesn't work, copy and paste this link:</p>
          <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin: 0;">${confirmationUrl}</p>
        </div>
        <p style="color: #525252; font-size: 12px; margin-top: 24px;">If you didn't create a CodeTrack account, you can safely ignore this email.</p>
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
        to: [{ email, name: fullName }],
        subject: 'Confirm your CodeTrack account',
        htmlContent,
      }),
    });

    const brevoText = await brevoResponse.text();
    const brevoResult = brevoText ? JSON.parse(brevoText) : {};

    if (!brevoResponse.ok) {
      console.error('Brevo error:', brevoResult);
      // User was created but email failed — still return success so user can resend
      return NextResponse.json({
        success: true,
        emailSent: false,
        emailError: brevoResult?.message || 'Email delivery failed',
      });
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error: any) {
    console.error('Signup API error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = 'sankeerthnara@gmail.com';
const SENDER_NAME = 'Progress Tracker';

export async function POST(req: NextRequest) {
  try {
    const { email, type, confirmationUrl } = await req.json();

    if (!email || !confirmationUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return NextResponse.json({ error: 'BREVO_API_KEY not configured' }, { status: 500 });
    }

    const isRecovery = type === 'recovery';

    const subject = isRecovery ? 'Reset your password' : 'Confirm your email address';

    const htmlContent = isRecovery
      ? `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0f0f; color: #e5e5e5; border-radius: 12px;">
          <h2 style="color: #ffffff; margin-bottom: 8px;">Reset your password</h2>
          <p style="color: #a3a3a3; margin-bottom: 24px;">Click the button below to reset your password for your CodeTrack account.</p>
          <a href="${confirmationUrl}" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">Reset password</a>
          <p style="color: #737373; font-size: 13px; margin-top: 24px;">If you didn't request a password reset, you can safely ignore this email.</p>
          <p style="color: #525252; font-size: 12px; margin-top: 8px;">This link expires in 1 hour.</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0f0f; color: #e5e5e5; border-radius: 12px;">
          <h2 style="color: #ffffff; margin-bottom: 8px;">Verify your email</h2>
          <p style="color: #a3a3a3; margin-bottom: 24px;">Click the button below to confirm your email address and activate your CodeTrack account.</p>
          <a href="${confirmationUrl}" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">Confirm your email</a>
          <p style="color: #737373; font-size: 13px; margin-top: 24px;">If you didn't create an account, you can safely ignore this email.</p>
          <p style="color: #525252; font-size: 12px; margin-top: 8px;">This link expires in 1 hour.</p>
        </div>
      `;

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [{ email }],
        subject,
        htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const errMsg = result?.message || result?.error || 'Failed to send email via Brevo';
      console.error('Brevo API error:', result);
      return NextResponse.json({ error: errMsg }, { status: response.status });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

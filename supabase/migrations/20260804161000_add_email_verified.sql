-- Add email_verified column to user_profiles for custom email verification tracking
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- Update existing confirmed users (those who already have email_confirmed_at set in auth.users)
-- We set email_verified = true for users who already confirmed their email
UPDATE public.user_profiles up
SET email_verified = true
WHERE EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = up.id
  AND au.email_confirmed_at IS NOT NULL
);

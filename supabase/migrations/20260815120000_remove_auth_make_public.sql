-- CodeTrack: Remove authentication entirely
-- The app no longer has a login/signup flow. platform_connections becomes a
-- single-tenant, publicly readable/writable table (no user_id scoping).

-- 1. Drop the old per-user RLS policies
DROP POLICY IF EXISTS "users_manage_own_platform_connections" ON public.platform_connections;
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;

-- 2. Drop user_id's FK + unique constraint, then the column itself —
--    there's no more concept of "which user" a connection belongs to.
ALTER TABLE public.platform_connections
  DROP CONSTRAINT IF EXISTS platform_connections_user_id_fkey;

ALTER TABLE public.platform_connections
  DROP CONSTRAINT IF EXISTS platform_connections_user_id_platform_key;

ALTER TABLE public.platform_connections
  DROP COLUMN IF EXISTS user_id;

-- One row per platform now (was one per user+platform)
ALTER TABLE public.platform_connections
  ADD CONSTRAINT platform_connections_platform_key UNIQUE (platform);

-- 3. Open RLS to full public access (anon = no session, authenticated = has one).
--    RLS stays ON (not disabled) — this policy is what actually grants access,
--    and it's easy to tighten later if needed.
CREATE POLICY "public_full_access_platform_connections"
  ON public.platform_connections
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. user_profiles / auth.users are no longer used by the app at all.
--    Leave the table in place (harmless), but nothing should write to it anymore —
--    it's simply not referenced by any app code after this migration.

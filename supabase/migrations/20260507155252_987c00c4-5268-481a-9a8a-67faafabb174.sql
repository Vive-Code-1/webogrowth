
-- Allow anon read of logo_url only (so login/signup pages can render brand)
DROP POLICY IF EXISTS "Anon can read public branding" ON public.app_settings;
CREATE POLICY "Anon can read public branding"
ON public.app_settings
FOR SELECT
TO anon
USING (key = 'logo_url');


-- 1) Helper: do two users share at least one project (team member, or client of project)
CREATE OR REPLACE FUNCTION public.users_share_project(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- both team members on same project
    SELECT 1
    FROM public.project_members pm1
    JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = _a AND pm2.user_id = _b
  ) OR EXISTS (
    -- _a is client, _b is team member on same project
    SELECT 1 FROM public.projects p
    JOIN public.project_members pm ON pm.project_id = p.id
    WHERE p.client_id = _a AND pm.user_id = _b
  ) OR EXISTS (
    -- _b is client, _a is team member on same project
    SELECT 1 FROM public.projects p
    JOIN public.project_members pm ON pm.project_id = p.id
    WHERE p.client_id = _b AND pm.user_id = _a
  ) OR EXISTS (
    -- both clients of same project (rare) or same client
    SELECT 1 FROM public.projects p1
    JOIN public.projects p2 ON p1.client_id = p2.client_id
    WHERE p1.client_id = _a AND p2.client_id = _b
  );
$$;

-- 2) Replace overly-permissive profiles SELECT policy
DROP POLICY IF EXISTS "Anyone authenticated can read profiles" ON public.profiles;

CREATE POLICY "Users read own and related profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'team'::app_role)  -- team can see other team/clients for assignment UIs
  OR public.users_share_project(auth.uid(), id)
);

-- 3) Restrict app_settings reads: only admins, except the public logo_url key
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.app_settings;

CREATE POLICY "Admins read all settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can read public branding"
ON public.app_settings
FOR SELECT
TO authenticated
USING (key = 'logo_url');

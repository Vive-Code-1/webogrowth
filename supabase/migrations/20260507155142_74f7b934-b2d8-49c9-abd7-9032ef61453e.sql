
-- 1) Harden handle_new_user (idempotent insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- never block signup
  RETURN NEW;
END;
$$;

-- Ensure trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Backfill missing profiles for existing auth users
INSERT INTO public.profiles (id, full_name, email)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'full_name', u.email),
       u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3) Tighten profiles SELECT — team only sees self, admins, and shared-project users
DROP POLICY IF EXISTS "Users read own and related profiles" ON public.profiles;
CREATE POLICY "Users read own and related profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.users_share_project(auth.uid(), id)
);

-- 4) CRM tables: restrict to admin + team only

-- LEADS
DROP POLICY IF EXISTS "Auth users read leads" ON public.leads;
DROP POLICY IF EXISTS "Auth users update leads" ON public.leads;
DROP POLICY IF EXISTS "Auth users insert leads" ON public.leads;
CREATE POLICY "Staff read leads" ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff insert leads" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff update leads" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));

-- DEALS
DROP POLICY IF EXISTS "Auth users read deals" ON public.deals;
DROP POLICY IF EXISTS "Auth users update deals" ON public.deals;
DROP POLICY IF EXISTS "Auth users insert deals" ON public.deals;
CREATE POLICY "Staff read deals" ON public.deals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff insert deals" ON public.deals FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff update deals" ON public.deals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));

-- EMAIL_LOGS
DROP POLICY IF EXISTS "Auth users read email_logs" ON public.email_logs;
DROP POLICY IF EXISTS "Auth users insert email_logs" ON public.email_logs;
CREATE POLICY "Staff read email_logs" ON public.email_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff insert email_logs" ON public.email_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));

-- INTERACTIONS
DROP POLICY IF EXISTS "Auth users read interactions" ON public.interactions;
DROP POLICY IF EXISTS "Auth users update interactions" ON public.interactions;
DROP POLICY IF EXISTS "Auth users insert interactions" ON public.interactions;
CREATE POLICY "Staff read interactions" ON public.interactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff insert interactions" ON public.interactions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff update interactions" ON public.interactions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));

-- LEAD_NOTES
DROP POLICY IF EXISTS "Auth users read lead_notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Auth users update lead_notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Auth users insert lead_notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Auth users delete own lead_notes" ON public.lead_notes;
CREATE POLICY "Staff read lead_notes" ON public.lead_notes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff insert lead_notes" ON public.lead_notes FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team')) AND auth.uid() IS NOT NULL);
CREATE POLICY "Staff update own lead_notes" ON public.lead_notes FOR UPDATE TO authenticated
  USING ((public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team')) AND created_by = auth.uid())
  WITH CHECK ((public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team')) AND created_by = auth.uid());
CREATE POLICY "Staff delete own lead_notes" ON public.lead_notes FOR DELETE TO authenticated
  USING ((public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team')) AND created_by = auth.uid());

-- LEAD_TAGS
DROP POLICY IF EXISTS "Auth users read lead_tags" ON public.lead_tags;
DROP POLICY IF EXISTS "Auth users insert lead_tags" ON public.lead_tags;
DROP POLICY IF EXISTS "Auth users delete lead_tags" ON public.lead_tags;
CREATE POLICY "Staff read lead_tags" ON public.lead_tags FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff insert lead_tags" ON public.lead_tags FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff delete lead_tags" ON public.lead_tags FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));

-- TEMPLATES
DROP POLICY IF EXISTS "Auth users read templates" ON public.templates;
DROP POLICY IF EXISTS "Auth users update templates" ON public.templates;
DROP POLICY IF EXISTS "Auth users insert templates" ON public.templates;
CREATE POLICY "Staff read templates" ON public.templates FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff insert templates" ON public.templates FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team'));
CREATE POLICY "Staff update own templates" ON public.templates FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'team') AND created_by = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'team') AND created_by = auth.uid()));

-- ACTIVITY_FEED
DROP POLICY IF EXISTS "Auth users read activity_feed" ON public.activity_feed;
DROP POLICY IF EXISTS "Auth users insert activity_feed" ON public.activity_feed;
CREATE POLICY "Staff read activity_feed" ON public.activity_feed FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'team') OR user_id = auth.uid());
CREATE POLICY "Staff insert activity_feed" ON public.activity_feed FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5) comment-attachments storage: owner-scoped delete/update
-- Files are uploaded with prefix `${user_id}/...`
CREATE POLICY "Owners delete comment-attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'comment-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners update comment-attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'comment-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

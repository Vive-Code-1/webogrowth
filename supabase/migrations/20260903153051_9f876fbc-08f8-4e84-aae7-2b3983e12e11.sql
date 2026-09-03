REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_assign_admin_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.users_share_project(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_project_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

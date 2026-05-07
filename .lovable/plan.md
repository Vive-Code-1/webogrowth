# Invite, Pending Users, Security, and Login Redesign Plan

## What I found

- The Team/Client invite UI is calling the `invite-user` Edge Function, but the function currently returns non-2xx errors without enough useful feedback in the UI.
- The invite dialog reads the session token but does not explicitly pass it to the Edge Function call, so I will make the auth handoff explicit and reliable.
- Self-signups depend on the `on_auth_user_created` trigger creating a `profiles` row with no role. Pending Users then displays profiles that do not have a row in `user_roles`. The trigger exists, but I will harden it and add backfill/repair logic for any auth users that may be missing profiles.
- The security scan still reports several database RLS issues in CRM-related tables (`activity_feed`, `leads`, `email_logs`, `interactions`, `templates`, `deals`, `lead_notes`, `lead_tags`) plus overly broad team profile access.
- The login page currently uses a fallback `W` mark instead of the uploaded company logo and is very plain.

## Changes I will implement

### 1. Fix Team/Client invitation flow

Files:
- `supabase/functions/invite-user/index.ts`
- `src/components/InviteUserDialog.tsx`

Planned fixes:
- Explicitly pass the logged-in admin access token when invoking `invite-user`.
- Improve Edge Function auth validation and admin-role checking.
- Validate request body fields: email, full name, and role.
- Support inviting both `team` and `client` roles from the same dialog.
- Use safer role insertion with conflict handling so duplicate role inserts do not crash the invite flow.
- Return clear errors such as:
  - not logged in
  - only admins can invite users
  - user already has this role
  - Supabase email/rate-limit issue
- Improve Bengali/English toast messages so the actual problem is visible instead of only “Edge Function returned a non-2xx status code”.
- Invalidate/refetch Team, Clients, and Pending Users queries after a successful invite so the UI updates immediately.

### 2. Fix Pending Users for new signups

Database migration:
- Recreate/harden `public.handle_new_user()` so every new signup reliably creates a profile.
- Keep invited users assigned to their selected role, while public self-signups remain role-less until admin approval.
- Add a repair/backfill step for existing auth users that do not have a profile row yet, so they can appear in Pending Users.
- Keep roles in the separate `user_roles` table, as required for security.

Frontend:
- Improve `usePendingUsers` error handling so admin sees a useful error if the query fails.
- Refetch pending count in the sidebar after approval/rejection.
- Make approve/reject toasts show the backend error message when something fails.

### 3. Fix security scan issues without breaking the app

Database migration:
- Restrict CRM/private tables to admin/team roles only, preventing client users from reading or modifying all CRM data:
  - `leads`
  - `deals`
  - `email_logs`
  - `interactions`
  - `lead_notes`
  - `lead_tags`
  - `templates`
  - `activity_feed`
- Replace `USING (true)` / `WITH CHECK (true)` policies on sensitive tables with role-scoped policies.
- Restrict team profile reads so team members only see themselves and users related through shared projects, instead of all client emails.
- Add safer storage policies for `comment-attachments`, especially owner-scoped update/delete where possible.
- Re-run the security scan after changes and mark fixed findings that are resolved.

Note: “Leaked Password Protection Disabled” is a Supabase Auth setting that usually must be enabled in the Supabase dashboard, not code. I will leave a clear note if it remains.

### 4. Redesign login page with your logo

Files:
- `src/pages/Login.tsx`
- likely reuse `src/hooks/useAppSettings.ts`

Planned design:
- Use the uploaded/company logo from `app_settings.logo_url` instead of the fallback `W`.
- Create a more polished dark branded layout:
  - responsive two-column desktop layout
  - centered clean card on mobile
  - subtle green glow using `#C9F368`
  - improved form spacing, labels, and button states
  - branded heading/subtitle
- Keep signup and forgot-password links working.
- Make the design responsive for mobile and desktop.

### 5. Validation after implementation

After the plan is approved and I implement:
- Check Edge Function logs for invite errors.
- Test the invite function directly with the current logged-in admin session where possible.
- Check database policies and trigger definitions.
- Run the security scan again.
- Inspect the login page and invite dialogs in desktop and mobile responsive views.
- Check for browser console/network errors.

## Files expected to change

- `supabase/functions/invite-user/index.ts`
- new Supabase migration under `supabase/migrations/`
- `src/components/InviteUserDialog.tsx`
- `src/hooks/usePendingUsers.ts`
- `src/pages/PendingUsers.tsx` if needed for better error display
- `src/pages/Login.tsx`
- possibly `src/hooks/useAppSettings.ts` only if login needs public logo loading improvements
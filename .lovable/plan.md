

# Admin Invite System — Remove Public Role Selection

## Problem
Currently, anyone signing up can choose their own role (admin/team/client), which is a security issue. Roles should only be assigned by admins via invitation.

## Changes

### 1. Signup Page — Remove Role Selection
- Remove the role dropdown from `Signup.tsx`
- Remove the `user_roles` insert after signup — new users get NO role until invited
- Users who sign up directly will see a "pending" state (no access to anything)

### 2. New "Invite User" Dialog — Admin Panel
Create `InviteUserDialog.tsx` accessible from Team and Clients pages:
- Email input + role selector (Admin / Team / Client)
- Uses `supabase.auth.admin.inviteUserByEmail()` — but this requires service role key, so we need an **edge function** (`invite-user`) that:
  - Validates the caller is an admin (check `user_roles`)
  - Calls Supabase Admin API to invite user by email
  - Inserts the role into `user_roles` for the invited user
- Invited user receives email, clicks link, sets password, and gets the pre-assigned role

### 3. Edge Function: `invite-user`
```text
POST /invite-user
Body: { email, role, full_name? }
Auth: Bearer token (verified as admin)
Logic:
  1. Verify caller has admin role
  2. Call supabase.auth.admin.inviteUserByEmail(email)
  3. Insert into user_roles (user_id from invite response, role)
  4. Return success
```

### 4. RLS Policy Update
- Add INSERT policy on `user_roles` for the service role (edge function uses service role key, so no RLS issue)
- The existing "Admins can manage roles" ALL policy already covers admin access

### 5. UI Updates
- **Team page**: Add "Invite Team Member" button → opens InviteUserDialog with role pre-set to "team"
- **Clients page**: Add "Invite Client" button → opens InviteUserDialog with role pre-set to "client"  
- **Dashboard**: Add "Invite User" quick action
- Add a "Pending Access" page for users who signed up but have no role assigned

### 6. Handle Users Without Roles
- Update `AuthGuard` or add a check: if user is logged in but has no role, show a "Your account is pending approval" message instead of the app

### Files to Create
- `supabase/functions/invite-user/index.ts` — edge function
- `src/components/InviteUserDialog.tsx` — invite dialog component

### Files to Modify
- `src/pages/Signup.tsx` — remove role selection and role insert
- `src/pages/Team.tsx` — add invite button
- `src/pages/Clients.tsx` — add invite button
- `src/components/AuthGuard.tsx` — handle no-role users
- `src/hooks/useAuth.tsx` — handle null role state gracefully


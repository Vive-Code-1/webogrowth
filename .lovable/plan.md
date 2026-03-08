

# Admin Approval System for New Signups

## Current State
- Users can sign up freely and get a profile via `handle_new_user` trigger
- Without a role in `user_roles`, they see "Access Pending" screen (AuthGuard already handles this)
- Admin has no way to see pending users or assign roles from the UI

## Plan

### 1. New Page: `src/pages/PendingUsers.tsx`
- Admin-only page showing users who have profiles but NO entry in `user_roles`
- Query: join `profiles` LEFT JOIN `user_roles` → filter where role is NULL
- Each card shows: name, email, signup date
- Admin can select a role (admin/team/client) and click "Approve"
- Approve inserts into `user_roles` table
- Option to reject/delete the user (remove from profiles)

### 2. Add Route & Sidebar Nav
- Add `/pending-users` route in `App.tsx` (inside AppLayout)
- Add nav item in `AppSidebar.tsx` with a "Users" or "Pending" label, admin-only
- Show a badge count of pending users

### 3. Hook: `src/hooks/usePendingUsers.ts`
- Fetches profiles that don't have a matching `user_roles` entry
- Uses Supabase query: fetch all profiles, fetch all user_roles, filter client-side (since we can't do LEFT JOIN anti-pattern easily with Supabase JS client)
- Mutation to insert role into `user_roles`

### 4. Database: RLS Policy
- `user_roles` INSERT policy for admins already exists (`Admins can manage roles` - ALL command)
- No migration needed — existing RLS covers admin inserting roles

### Files
- **New**: `src/pages/PendingUsers.tsx`
- **New**: `src/hooks/usePendingUsers.ts`  
- **Edit**: `src/App.tsx` — add route
- **Edit**: `src/components/AppSidebar.tsx` — add nav item with pending count


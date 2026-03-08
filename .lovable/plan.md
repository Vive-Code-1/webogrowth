

# Fix: Login Spinner Stuck — Race Condition in Auth Provider

## Problem
The user (`aabeg01@gmail.com`) has admin role in the database but login gets stuck spinning. The root cause is a race condition: both `onAuthStateChange` and `getSession().then()` run simultaneously, each calling `fetchRole()` and setting `loading` state independently. They can interfere with each other, leaving `loading=true` indefinitely or `role=null`.

## Fix

### `src/hooks/useAuth.tsx`
Remove the duplicate `getSession()` call entirely. Supabase's `onAuthStateChange` already fires an `INITIAL_SESSION` event on setup which handles the initial session. This eliminates the race condition.

```text
Before:
  onAuthStateChange → async fetchRole
  getSession().then → async fetchRole   ← RACE CONDITION

After:
  onAuthStateChange (INITIAL_SESSION) → async fetchRole   ← Single flow
```

Also add `setTimeout` wrapper around `fetchRole` inside `onAuthStateChange` to avoid Supabase's warning about calling Supabase methods inside the callback synchronously — use `setTimeout(() => { ... }, 0)` pattern to defer the database call.

### Files Modified
- `src/hooks/useAuth.tsx` — remove `getSession` block, rely solely on `onAuthStateChange`


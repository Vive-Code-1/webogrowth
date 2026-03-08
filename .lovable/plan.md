

# Fix: Login Stuck Issue — Race Condition in AuthProvider

## Root Cause
When `onAuthStateChange` fires after login:
1. Session is set immediately
2. `fetchRole()` is called with `await` (takes time)
3. But `loading` was already set to `false` by the initial `getSession()` call
4. During the role fetch, AuthGuard sees: session=exists, role=null, loading=false → shows "Access Pending" instead of waiting

## Fix

### `src/hooks/useAuth.tsx`
- In `onAuthStateChange` callback: set `setLoading(true)` BEFORE awaiting `fetchRole()` so AuthGuard shows the spinner while role loads

### `src/pages/Login.tsx`  
- Add a check: if user is already logged in (session exists), redirect to "/" automatically — prevents stuck state on re-visits

## Files Modified
- `src/hooks/useAuth.tsx` — add `setLoading(true)` at start of auth state change handler
- `src/pages/Login.tsx` — add redirect if already authenticated


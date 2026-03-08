

# Assign Admin Role to aabeg01@gmail.com

## What
Insert a single row into `user_roles` table to give admin role to the existing user.

## How
Run a SQL insert via database migration:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('4c8ccfae-a090-45f1-980e-5102efae61e9', 'admin');
```

This will immediately grant admin access — the user can log in and see the full admin dashboard, manage projects, invite other users, etc.


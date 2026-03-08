

# Enhanced "New Project" Dialog + Test Data

## Overview
Add comprehensive project creation fields and create dummy test data to verify everything works.

## 1. Database Migration
Add new columns to `projects` table:
- `budget` (numeric, nullable) — project budget amount
- `currency` (text, default 'BDT') — currency code
- `priority` (text, default 'medium') — project priority (low/medium/high/urgent)
- `category` (text, nullable) — project category/type (e.g. Web Design, App Development, Branding)
- `notes` (text, nullable) — internal notes for the team

Create a new `project_priority` enum: `low`, `medium`, `high`, `urgent`

## 2. Insert Dummy Data
Create 3 dummy team members and 2 dummy clients via Supabase auth + profiles + user_roles, then create a sample project with all fields populated.

Since we can't create auth users via SQL, we'll insert directly into `profiles` and `user_roles` tables so they appear in dropdowns. (They won't be able to login, but will show up as selectable team/client options.)

```sql
-- 3 team member profiles + roles
-- 2 client profiles + roles
```

## 3. Enhanced CreateProjectDialog
Update the dialog to include:
- **Project Name** (existing)
- **Description** (existing)
- **Category** — Select dropdown (Web Design, App Development, Branding, Marketing, SEO, Other)
- **Priority** — Select dropdown (Low, Medium, High, Urgent)
- **Budget** — Number input with currency selector (BDT/USD)
- **Start Date & Deadline** (existing)
- **Status** — Select dropdown (Not Started, In Progress, etc.)
- **Client** (existing)
- **Team Members** (existing, multi-select with checkboxes)
- **Internal Notes** — Textarea for admin notes

The dialog will be scrollable with `ScrollArea` since it has more fields now.

## 4. Update useCreateProject Hook
Pass new fields (`budget`, `currency`, `priority`, `category`, `notes`) to the insert mutation.

## 5. Update Projects List Card
Show budget, priority badge, and category on the project cards.

## Files Modified
- **Migration SQL** — add columns to `projects` table + insert dummy data
- `src/components/CreateProjectDialog.tsx` — enhanced form
- `src/hooks/useProjects.ts` — pass new fields in create mutation
- `src/pages/Projects.tsx` — show new fields on cards
- `src/pages/ProjectDetail.tsx` — show budget/priority/category in sidebar


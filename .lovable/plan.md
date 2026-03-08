

# Phase 2 & 3: Admin Features + Task Engine

## Current State
All pages use hardcoded mock data. Auth and DB schema with RLS are in place. No CRUD operations, no real data fetching, no task modals, no drag-and-drop.

## What Will Be Built

### Phase 2: Admin Features (Real Data + CRUD)

**A. React Query hooks layer** (`src/hooks/`)
- `useProjects` — fetch projects with members, client info, task counts
- `useTasks` — fetch tasks with assignee profiles
- `useTeamMembers` — fetch profiles with `team` role + task stats
- `useClients` — fetch profiles with `client` role + project associations
- `useComments` — fetch/add comments for a task
- All hooks use `@tanstack/react-query` for caching/mutations

**B. Dashboard** — Replace mock data with real queries (project count, task stats, completion rate)

**C. Project Management**
- Create Project dialog: name, description, start/deadline dates
- Client assignment dropdown (users with `client` role)
- Team member multi-select (users with `team` role)
- Inserts into `projects` + `project_members` tables

**D. Team & Client pages** — Real data from profiles + user_roles join

**E. Role-based routing**
- Add `/portal` and `/my-tasks` routes
- Client Portal: simplified project view, only `visible_to_client` tasks
- My Tasks: team member's assigned tasks across projects

### Phase 3: Task Engine

**A. 6-Column Kanban Board** (in ProjectDetail)
- Columns: Backlog, To Do, In Progress, Internal Review, Client Review, Completed
- Drag-and-drop using HTML5 drag events (no extra dependency)
- Updates `stage` column via Supabase mutation

**B. Task Creation/Edit Modal** (Sheet component)
- Title, description, assignee dropdown, due date, priority select
- Visibility toggle ("Visible to Client" switch)
- Comments section with real-time-ish thread
- Create and update mutations

**C. Task List View** (Tasks page)
- Table with real data, filterable by project/status/priority/assignee
- Click row to open task modal

**D. TaskStatusBadge update** — Support new 6 task stages

### Database Changes Needed
- **Migration**: Add `INSERT` policy on `profiles` table for the `handle_new_user` trigger (currently profiles can't be inserted, but the trigger runs as SECURITY DEFINER so it should work). Also need to add task INSERT policy for team members on their assigned projects.
- Add RLS policy: Team members can INSERT tasks on projects they belong to
- Add RLS policy: Team members can INSERT comments

### New Files
```text
src/hooks/useProjects.ts
src/hooks/useTasks.ts  
src/hooks/useTeamMembers.ts
src/hooks/useClients.ts
src/hooks/useComments.ts
src/components/CreateProjectDialog.tsx
src/components/TaskModal.tsx
src/components/KanbanBoard.tsx
src/components/TaskFilters.tsx
src/pages/MyTasks.tsx
src/pages/ClientPortal.tsx
```

### Modified Files
```text
src/App.tsx              — add /my-tasks, /portal routes
src/pages/Dashboard.tsx  — real Supabase queries
src/pages/Projects.tsx   — real data + create button
src/pages/ProjectDetail.tsx — 6-col kanban + drag-drop + task modal
src/pages/Tasks.tsx      — real data + filters + task modal
src/pages/Team.tsx       — real data
src/pages/Clients.tsx    — real data
src/components/TaskStatusBadge.tsx — support 6 stages
src/components/AppSidebar.tsx — ensure /my-tasks, /portal routes
```

### Implementation Order
1. DB migration (team task insert + comment insert policies)
2. React Query hooks for all data
3. Update TaskStatusBadge for 6 stages
4. Dashboard with real data
5. CreateProjectDialog + Projects page
6. ProjectDetail with KanbanBoard (drag-drop) + TaskModal
7. Tasks page with filters
8. Team & Clients pages with real data
9. MyTasks + ClientPortal pages
10. Wire up routes


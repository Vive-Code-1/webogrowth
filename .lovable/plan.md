

# Full-Stack Agency PM System with RBAC

This is a large undertaking that transforms the current mock-data frontend into a full-stack application with authentication, role-based access, and distinct portals. I recommend breaking this into phases. Here is the complete plan for **Phase 1** (foundation) and an outline for subsequent phases.

---

## Phase 1: Backend Foundation & Authentication

### 1. Connect Lovable Cloud (Supabase)
Set up the backend with the following database schema:

```text
┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│  auth.users   │───▶│   profiles     │───▶│  user_roles   │
│  (built-in)   │    │  name, avatar  │    │  user_id, role│
└──────────────┘    └───────────────┘    │  (admin/team/ │
                                          │   client)     │
                                          └───────────────┘

┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│   projects    │───▶│ project_members│◀──│   profiles    │
│  name, desc,  │    │  project_id,   │    └──────────────┘
│  deadline,    │    │  user_id, role │
│  status,      │    └───────────────┘
│  client_id    │
└──────┬───────┘
       │
       ▼
┌──────────────┐    ┌───────────────┐
│    tasks      │───▶│  comments      │
│  title, desc, │    │  task_id,      │
│  status, pri, │    │  user_id,      │
│  assignee_id, │    │  content,      │
│  project_id,  │    │  created_at    │
│  due_date,    │    └───────────────┘
│  visible_to_  │
│  client,      │
│  stage        │
└──────────────┘
```

**Task stages enum:** `backlog`, `todo`, `in_progress`, `internal_review`, `client_review`, `completed`

**User roles enum:** `admin`, `team`, `client`

### 2. Authentication Pages
- **Login page** (`/login`) — email/password
- **Signup page** (`/signup`) — with role selection (admin creates accounts, but initial setup needs a first admin)
- Auto-create profile on signup via DB trigger
- Role stored in `user_roles` table (security definer function for RLS checks)

### 3. Role-Based Routing & Layout
- **Auth guard** component wrapping protected routes
- After login, redirect based on role:
  - `admin` → `/` (Global Dashboard)
  - `team` → `/my-tasks`
  - `client` → `/portal`
- Sidebar dynamically shows only role-appropriate nav items

### 4. RLS Policies
- **Projects:** Admins see all. Team members see only projects they're assigned to. Clients see only projects where they're the client.
- **Tasks:** Same project-scoped access. Clients only see tasks where `visible_to_client = true`.
- **Comments:** Scoped to task access.

---

## Phase 2: Admin Features

### A. Global Dashboard (existing, connect to real data)
- Stats from DB queries (active projects, tasks due, team workload)
- Quick action buttons: "New Project", "Invite Client", "Add Team Member"

### B. Project Management
- **Create Project form** (dialog): name, description, start date, deadline
- **Client assignment** dropdown (from users with `client` role)
- **Team assignment** multi-select (from users with `team` role)

### C. Team & Client Management
- Invite users by email (Supabase auth invite)
- Assign roles on invite

---

## Phase 3: Task Engine

### A. Enhanced Kanban Board
- 6 columns: Backlog → To Do → In Progress → Internal Review → Client Review → Completed
- Drag & drop between columns
- Task cards show assignee, priority, due date, client visibility icon

### B. Task Modal/Sheet
- Full task details: title, description, assignee, due date, priority
- **Visibility toggle**: "Visible to Client" switch
- **Comments section**: threaded chat-like UI
- Subtask support

### C. List View
- Table with sorting/filtering by status, assignee, priority, project

---

## Phase 4: Client Portal

### A. Client Dashboard (`/portal`)
- Welcome message, list of their active projects
- Simplified progress view (timeline/progress bar)

### B. Client Project View
- Only sees tasks marked `visible_to_client`
- Can leave comments on tasks in `client_review` stage
- Approve/request revision buttons

---

## Implementation Approach

Given the scope, I recommend implementing in order:
1. **Phase 1** first — sets the foundation everything else depends on
2. **Phase 2** next — admin can manage data
3. **Phase 3** — task engine with real CRUD
4. **Phase 4** — client portal

Each phase is a separate conversation/set of prompts. Shall I begin with Phase 1 (Lovable Cloud setup, auth, RBAC, and role-based routing)?


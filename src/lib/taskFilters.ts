export interface FilterableTask {
  title: string;
  description?: string | null;
  project_name?: string;
  stage: string;
  priority: string;
  assignee_id: string | null;
  due_date: string | null;
  assignee?: { full_name: string | null; email?: string | null } | null;
}

export interface TaskFilters {
  search: string;
  stage: string; // "all" or a stage
  priority: string; // "all" or a priority
  assignee: string; // "all" | "unassigned" | user id
  overdueOnly: boolean;
}

/** Local YYYY-MM-DD for "today". */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** A task is overdue when its due date is before today and it is not completed. */
export function isOverdue(task: Pick<FilterableTask, "due_date" | "stage">, today: string = todayISO()): boolean {
  if (!task.due_date || task.stage === "completed") return false;
  return task.due_date.slice(0, 10) < today;
}

export function filterTasks<T extends FilterableTask>(tasks: T[], f: TaskFilters, today: string = todayISO()): T[] {
  const q = f.search.trim().toLowerCase();
  return tasks.filter((t) => {
    if (f.stage !== "all" && t.stage !== f.stage) return false;
    if (f.priority !== "all" && t.priority !== f.priority) return false;
    if (f.assignee === "unassigned" && t.assignee_id) return false;
    if (f.assignee !== "all" && f.assignee !== "unassigned" && t.assignee_id !== f.assignee) return false;
    if (f.overdueOnly && !isOverdue(t, today)) return false;
    if (q) {
      const hay = [t.title, t.description, t.project_name, t.assignee?.full_name].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function tasksToCsv(tasks: FilterableTask[]): string {
  const header = ["Title", "Project", "Stage", "Priority", "Assignee", "Due Date"];
  const rows = tasks.map((t) => [t.title, t.project_name ?? "", t.stage, t.priority, t.assignee?.full_name ?? "Unassigned", t.due_date ?? ""]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

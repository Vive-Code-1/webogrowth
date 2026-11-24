import { describe, expect, it } from "vitest";
import { filterTasks, isOverdue, tasksToCsv, type TaskFilters } from "./taskFilters";

const base = { description: null, project_name: "Site", priority: "medium", assignee: null };
const tasks = [
  { ...base, title: "Design homepage", stage: "todo", assignee_id: "u1", due_date: "2026-11-20", assignee: { full_name: "Rafi" } },
  { ...base, title: "Write copy", stage: "completed", assignee_id: null, due_date: "2026-11-01", priority: "high" },
  { ...base, title: "SEO audit", stage: "in_progress", assignee_id: "u2", due_date: "2026-12-30" },
];
const all: TaskFilters = { search: "", stage: "all", priority: "all", assignee: "all", overdueOnly: false };
const TODAY = "2026-11-24";

describe("task filters", () => {
  it("overdue means past due and not completed", () => {
    expect(isOverdue(tasks[0], TODAY)).toBe(true);
    expect(isOverdue(tasks[1], TODAY)).toBe(false);
    expect(isOverdue(tasks[2], TODAY)).toBe(false);
  });
  it("overdue-only filter keeps only overdue tasks", () => {
    expect(filterTasks(tasks, { ...all, overdueOnly: true }, TODAY).map((t) => t.title)).toEqual(["Design homepage"]);
  });
  it("search matches title or assignee name, case-insensitive", () => {
    expect(filterTasks(tasks, { ...all, search: "seo" }, TODAY).map((t) => t.title)).toEqual(["SEO audit"]);
    expect(filterTasks(tasks, { ...all, search: "rafi" }, TODAY).map((t) => t.title)).toEqual(["Design homepage"]);
  });
  it("assignee filter supports a member and unassigned", () => {
    expect(filterTasks(tasks, { ...all, assignee: "u2" }, TODAY).map((t) => t.title)).toEqual(["SEO audit"]);
    expect(filterTasks(tasks, { ...all, assignee: "unassigned" }, TODAY).map((t) => t.title)).toEqual(["Write copy"]);
  });
  it("CSV escapes commas and quotes", () => {
    const csv = tasksToCsv([{ ...tasks[0], title: 'Fix "nav", footer' }]);
    expect(csv.split("\n")[1]).toBe('"Fix ""nav"", footer",Site,todo,medium,Rafi,2026-11-20');
  });
});

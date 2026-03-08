import { useState } from "react";
import { useAllTasks, type TaskWithAssignee } from "@/hooks/useTasks";
import { TaskStageBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskModal } from "@/components/TaskModal";
import { Eye } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TaskStage = Database["public"]["Enums"]["task_stage"];
type TaskPriority = Database["public"]["Enums"]["task_priority"];

const stages: TaskStage[] = ["backlog", "todo", "in_progress", "internal_review", "client_review", "completed"];
const priorities: TaskPriority[] = ["low", "medium", "high"];

export default function Tasks() {
  const { data: tasks, isLoading } = useAllTasks();
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filtered = (tasks || []).filter((t) => {
    if (filterStage !== "all" && t.stage !== filterStage) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">{filtered.length} tasks</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-36 sm:w-40">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}><TaskStageBadge stage={s} /></SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map((p) => (
              <SelectItem key={p} value={p}><PriorityBadge priority={p} /></SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/30">
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3">Title</th>
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3 hidden md:table-cell">Project</th>
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3">Stage</th>
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3 hidden sm:table-cell">Priority</th>
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3 hidden lg:table-cell">Assignee</th>
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3 hidden lg:table-cell">Due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-sm text-muted-foreground font-body py-12">No tasks found</td></tr>
            )}
            {filtered.map((task) => (
              <tr
                key={task.id}
                className="border-b hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => { setSelectedTask(task); setModalOpen(true); }}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-body font-medium text-foreground">{task.title}</span>
                    {task.visible_to_client && <Eye className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <span className="text-xs text-muted-foreground font-body">{task.project_name}</span>
                </td>
                <td className="p-3"><TaskStageBadge stage={task.stage} /></td>
                <td className="p-3 hidden sm:table-cell"><PriorityBadge priority={task.priority} /></td>
                <td className="p-3 hidden lg:table-cell">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-body">
                          {getInitials(task.assignee.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-body text-muted-foreground">{task.assignee.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground font-body">Unassigned</span>
                  )}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground font-body">{task.due_date || "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <TaskModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          task={selectedTask}
          projectId={selectedTask.project_id}
        />
      )}
    </div>
  );
}

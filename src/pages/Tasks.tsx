import { useState } from "react";
import { useAllTasks, type TaskWithAssignee } from "@/hooks/useTasks";
import { TaskStageBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TaskModal } from "@/components/TaskModal";
import { Eye, Plus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
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
          <SelectTrigger className="w-32 sm:w-32">
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

      {/* Desktop table */}
      <div className="rounded-lg border bg-card overflow-hidden hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/30">
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3">Title</th>
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3">Project</th>
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3">Stage</th>
              <th className="text-left text-xs font-heading font-semibold text-foreground p-3">Priority</th>
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
                <td className="p-3">
                  <span className="text-xs text-muted-foreground font-body">{task.project_name}</span>
                </td>
                <td className="p-3"><TaskStageBadge stage={task.stage} /></td>
                <td className="p-3"><PriorityBadge priority={task.priority} /></td>
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

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground font-body text-center py-12">No tasks found</p>
        )}
        {filtered.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border bg-card p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => { setSelectedTask(task); setModalOpen(true); }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-body font-medium text-foreground truncate">{task.title}</span>
                {task.visible_to_client && <Eye className="h-3 w-3 text-primary shrink-0" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-body mb-2">{task.project_name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <TaskStageBadge stage={task.stage} />
              <PriorityBadge priority={task.priority} />
              {task.due_date && <span className="text-xs text-muted-foreground font-body ml-auto">{task.due_date}</span>}
            </div>
          </div>
        ))}
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

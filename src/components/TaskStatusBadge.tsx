import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type TaskStage = Database["public"]["Enums"]["task_stage"];
type TaskPriority = Database["public"]["Enums"]["task_priority"];

const stageConfig: Record<TaskStage, { label: string; className: string }> = {
  backlog: { label: "Backlog", className: "bg-muted text-muted-foreground" },
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-info/15 text-info" },
  internal_review: { label: "Internal Review", className: "bg-warning/15 text-warning" },
  client_review: { label: "Client Review", className: "bg-primary/15 text-primary" },
  completed: { label: "Completed", className: "bg-success/15 text-success" },
};

const priorityConfig: Record<TaskPriority, { className: string }> = {
  low: { className: "bg-muted text-muted-foreground" },
  medium: { className: "bg-warning/15 text-warning" },
  high: { className: "bg-destructive/15 text-destructive" },
};

export function TaskStageBadge({ stage }: { stage: TaskStage }) {
  const config = stageConfig[stage];
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-body font-medium", config.className)}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority];
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-body font-medium capitalize", config.className)}>
      {priority}
    </span>
  );
}

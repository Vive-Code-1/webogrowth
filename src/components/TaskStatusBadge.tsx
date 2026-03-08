import { cn } from "@/lib/utils";

const statusConfig = {
  "todo": { label: "To Do", className: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "bg-info/15 text-info" },
  "review": { label: "Review", className: "bg-warning/15 text-warning" },
  "done": { label: "Done", className: "bg-success/15 text-success" },
};

const priorityConfig = {
  low: { className: "bg-muted text-muted-foreground" },
  medium: { className: "bg-warning/15 text-warning" },
  high: { className: "bg-destructive/15 text-destructive" },
};

export function TaskStatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-body font-medium", config.className)}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: keyof typeof priorityConfig }) {
  const config = priorityConfig[priority];
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-body font-medium capitalize", config.className)}>
      {priority}
    </span>
  );
}

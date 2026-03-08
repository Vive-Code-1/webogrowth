import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { TaskStageBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import { useUpdateTaskStage, type TaskWithAssignee } from "@/hooks/useTasks";
import type { Database } from "@/integrations/supabase/types";

type TaskStage = Database["public"]["Enums"]["task_stage"];

const columns: { key: TaskStage; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "internal_review", label: "Internal Review" },
  { key: "client_review", label: "Client Review" },
  { key: "completed", label: "Completed" },
];

interface KanbanBoardProps {
  tasks: TaskWithAssignee[];
  onTaskClick: (task: TaskWithAssignee) => void;
  onNewTask: (stage: TaskStage) => void;
}

export function KanbanBoard({ tasks, onTaskClick, onNewTask }: KanbanBoardProps) {
  const updateStage = useUpdateTaskStage();
  const [dragOverCol, setDragOverCol] = useState<TaskStage | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: TaskStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(stage);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = (e: React.DragEvent, stage: TaskStage) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.stage !== stage) {
      updateStage.mutate({ id: taskId, stage });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.stage === col.key);
        const isDragOver = dragOverCol === col.key;

        return (
          <div
            key={col.key}
            className={`rounded-lg border bg-card p-3 min-h-[200px] transition-colors ${
              isDragOver ? "border-primary/50 bg-primary/5" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-xs text-foreground">{col.label}</h3>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground font-body bg-secondary rounded-full px-2 py-0.5">
                  {colTasks.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onNewTask(col.key)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onTaskClick(task)}
                  className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer space-y-2"
                >
                  <p className="text-xs font-body font-medium text-foreground">{task.title}</p>
                  {task.description && (
                    <p className="text-[10px] text-muted-foreground font-body line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <PriorityBadge priority={task.priority} />
                    <div className="flex items-center gap-1">
                      {task.visible_to_client && <Eye className="h-3 w-3 text-primary" />}
                      {task.assignee && (
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-body">
                            {getInitials(task.assignee.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <p className="text-[10px] text-muted-foreground font-body text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

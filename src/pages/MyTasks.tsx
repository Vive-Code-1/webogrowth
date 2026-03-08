import { useState } from "react";
import { useMyTasks, type TaskWithAssignee } from "@/hooks/useTasks";
import { TaskStageBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import { TaskModal } from "@/components/TaskModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";

export default function MyTasks() {
  const { data: tasks, isLoading } = useMyTasks();
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Tasks</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">{tasks?.length || 0} tasks assigned to you</p>
      </div>

      <div className="space-y-3">
        {tasks?.length === 0 && (
          <p className="text-sm text-muted-foreground font-body text-center py-12">No tasks assigned to you yet.</p>
        )}
        {tasks?.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border bg-card p-4 card-hover cursor-pointer animate-fade-in"
            onClick={() => { setSelectedTask(task); setModalOpen(true); }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-body font-medium text-foreground text-sm truncate">{task.title}</span>
                {task.visible_to_client && <Eye className="h-3 w-3 text-primary shrink-0" />}
              </div>
              <span className="text-xs text-muted-foreground font-body shrink-0">{task.project_name}</span>
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground font-body mb-2 line-clamp-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2">
              <TaskStageBadge stage={task.stage} />
              <PriorityBadge priority={task.priority} />
              {task.due_date && <span className="text-xs text-muted-foreground font-body ml-auto">Due {task.due_date}</span>}
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

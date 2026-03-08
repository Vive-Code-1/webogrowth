import { useProjects } from "@/hooks/useProjects";
import { useAllTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { TaskStageBadge } from "@/components/TaskStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, CheckSquare } from "lucide-react";

export default function ClientPortal() {
  const { user } = useAuth();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: tasks, isLoading: loadingTasks } = useAllTasks();

  // Client only sees their own projects (RLS handles this)
  const myProjects = projects || [];
  // Client only sees visible tasks (RLS handles this)
  const myTasks = tasks || [];

  if (loadingProjects || loadingTasks) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Client Portal</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Welcome, {user?.user_metadata?.full_name || "Client"}! Here's your project status.
        </p>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myProjects.length === 0 && (
          <p className="text-sm text-muted-foreground font-body col-span-full text-center py-12">
            No projects assigned to you yet.
          </p>
        )}
        {myProjects.map((project) => {
          const projectTasks = myTasks.filter((t) => t.project_id === project.id);
          const completedCount = projectTasks.filter((t) => t.stage === "completed").length;
          const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

          return (
            <div key={project.id} className="rounded-lg border bg-card p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <FolderKanban className="h-4 w-4 text-primary" />
                <h2 className="font-heading font-semibold text-foreground">{project.name}</h2>
              </div>
              {project.description && (
                <p className="text-xs text-muted-foreground font-body mb-3">{project.description}</p>
              )}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-[10px] text-muted-foreground font-body">{completedCount}/{projectTasks.length} visible tasks completed</p>
              </div>

              {project.deadline && (
                <p className="text-xs text-muted-foreground font-body mb-3">Deadline: {project.deadline}</p>
              )}

              {/* Task list */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                  <CheckSquare className="h-3 w-3" /> Tasks
                </div>
                {projectTasks.length === 0 && (
                  <p className="text-[10px] text-muted-foreground font-body">No visible tasks</p>
                )}
                {projectTasks.map((task) => (
                  <div key={task.id} className="p-2 rounded-lg bg-secondary/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-body font-medium text-foreground">{task.title}</span>
                      <TaskStageBadge stage={task.stage} />
                    </div>
                    {task.description && (
                      <p className="text-[10px] text-muted-foreground font-body mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

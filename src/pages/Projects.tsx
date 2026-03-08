import { useProjects } from "@/hooks/useProjects";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
  on_hold: "On Hold",
};

export default function Projects() {
  const { data: projects, isLoading } = useProjects();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">{projects?.length || 0} projects total</p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects?.length === 0 && (
          <p className="text-sm text-muted-foreground font-body col-span-full text-center py-12">
            No projects yet. Create your first project!
          </p>
        )}
        {projects?.map((project) => {
          const progress = project.task_counts.total > 0
            ? Math.round((project.task_counts.completed / project.task_counts.total) * 100)
            : 0;

          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-lg border bg-card p-5 card-hover animate-fade-in block"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-semibold text-foreground">{project.name}</h3>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {statusLabels[project.status] || project.status}
                </Badge>
              </div>
              {project.description && (
                <p className="text-xs text-muted-foreground font-body mb-3 line-clamp-2">{project.description}</p>
              )}
              {project.client && (
                <p className="text-xs text-primary font-body mb-3">
                  Client: {project.client.full_name || project.client.email}
                </p>
              )}
              {project.deadline && (
                <p className="text-xs text-muted-foreground font-body mb-3">Due {project.deadline}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 4).map((m) => (
                    <Avatar key={m.id} className="h-6 w-6 border-2 border-card">
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-body">
                        {getInitials(m.profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-4">
                  <Progress value={progress} className="h-1.5" />
                  <span className="text-xs text-muted-foreground font-body w-8">{progress}%</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-body mt-2">
                {project.task_counts.completed}/{project.task_counts.total} tasks done
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { projects } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { TaskStatusBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import { ArrowLeft, Calendar, Mail } from "lucide-react";
import type { Task } from "@/lib/mock-data";

const columns: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground font-body">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/projects" className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground font-body mt-0.5">{project.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Project Info */}
        <div className="rounded-lg border bg-card p-5 space-y-4 animate-fade-in">
          <h3 className="font-heading font-semibold text-foreground text-sm">Client</h3>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/20 text-primary font-body text-sm">{project.client.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-body font-medium text-foreground text-sm">{project.client.name}</p>
              <p className="text-xs text-muted-foreground font-body">{project.client.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
            <Mail className="h-3 w-3" /> {project.client.email}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
            <Calendar className="h-3 w-3" /> Deadline: {project.deadline}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-body">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          <h3 className="font-heading font-semibold text-foreground text-sm pt-2">Team</h3>
          <div className="space-y-2">
            {project.teamMembers.map(m => (
              <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-body">{m.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-body font-medium text-foreground">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map(col => {
            const colTasks = project.tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="rounded-lg border bg-card p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-sm text-foreground">{col.label}</h3>
                  <span className="text-xs text-muted-foreground font-body bg-secondary rounded-full px-2 py-0.5">{colTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {colTasks.map(task => (
                    <div key={task.id} className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors space-y-2">
                      <p className="text-sm font-body font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground font-body line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={task.priority} />
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-body">{task.assignee.avatar}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground font-body text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

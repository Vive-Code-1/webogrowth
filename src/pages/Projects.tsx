import { projects } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Calendar, Users } from "lucide-react";

const statusStyles = {
  active: "bg-success/15 text-success",
  completed: "bg-primary/15 text-primary",
  "on-hold": "bg-warning/15 text-warning",
};

export default function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Manage all your client projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map(project => (
          <Link key={project.id} to={`/projects/${project.id}`} className="block">
            <div className="rounded-lg border bg-card p-5 card-hover animate-fade-in h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <Badge className={cn("font-body text-xs capitalize border-0", statusStyles[project.status])}>
                  {project.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {project.deadline}
                </span>
              </div>

              <h3 className="font-heading font-semibold text-foreground mb-1">{project.name}</h3>
              <p className="text-xs text-muted-foreground font-body mb-4 line-clamp-2">{project.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-body">{project.client.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-body font-medium text-foreground">{project.client.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{project.client.company}</p>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
                  <span>{project.tasks.length} tasks</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 4).map(m => (
                      <Avatar key={m.id} className="h-6 w-6 border-2 border-card">
                        <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-body">{m.avatar}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-body flex items-center gap-1">
                    <Users className="h-3 w-3" /> {project.teamMembers.length} members
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useProjects } from "@/hooks/useProjects";
import { useAllTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { TaskStageBadge } from "@/components/TaskStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  CalendarDays,
  CircleCheckBig,
  LayoutList,
  ChevronDown,
} from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ClientTaskComments } from "@/components/ClientTaskComments";

const statusLabel: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  review: "Under Review",
  completed: "Completed",
  on_hold: "On Hold",
};

const statusColor: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-info/15 text-info",
  review: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  on_hold: "bg-destructive/15 text-destructive",
};

// Map internal_review to a client-friendly label
const clientStageLabel: Record<string, string> = {
  backlog: "Queued",
  todo: "Planned",
  in_progress: "In Progress",
  internal_review: "Under Review",
  client_review: "Awaiting Your Review",
  completed: "Completed",
};

export default function ClientPortal() {
  const { user } = useAuth();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: tasks, isLoading: loadingTasks } = useAllTasks();

  const myProjects = projects || [];
  const myTasks = tasks || [];

  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.stage === "completed").length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeProjects = myProjects.filter((p) => p.status !== "completed").length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loadingProjects || loadingTasks) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-sm font-body text-muted-foreground">{greeting()}</p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-1">
            {user?.user_metadata?.full_name || "Welcome Back"}
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2 max-w-md">
            Here's an overview of your projects and their progress. Everything you need is right here.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card hover:border-primary/30 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{activeProjects}</p>
              <p className="text-xs text-muted-foreground font-body">Active Projects</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:border-primary/30 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <CircleCheckBig className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{completedTasks}/{totalTasks}</p>
              <p className="text-xs text-muted-foreground font-body">Tasks Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:border-primary/30 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{overallProgress}%</p>
              <p className="text-xs text-muted-foreground font-body">Overall Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects */}
      {myProjects.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-16 text-center">
            <FolderKanban className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-body">No projects assigned yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {myProjects.map((project) => {
            const projectTasks = myTasks.filter((t) => t.project_id === project.id);
            const doneCount = projectTasks.filter((t) => t.stage === "completed").length;
            const progress = projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

            const daysLeft = project.deadline
              ? differenceInDays(parseISO(project.deadline), new Date())
              : null;

            return (
              <Card key={project.id} className="border-border bg-card overflow-hidden hover:border-primary/20 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderKanban className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-heading">{project.name}</CardTitle>
                        {project.description && (
                          <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-1">{project.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] font-body ${statusColor[project.status] || ""}`}>
                        {statusLabel[project.status] || project.status}
                      </Badge>
                      {daysLeft !== null && (
                        <Badge variant="outline" className={`text-[10px] font-body gap-1 ${daysLeft < 0 ? "text-destructive border-destructive/30" : daysLeft <= 7 ? "text-warning border-warning/30" : "text-muted-foreground"}`}>
                          <Clock className="h-3 w-3" />
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-body">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-[10px] text-muted-foreground font-body">{doneCount} of {projectTasks.length} tasks completed</p>
                  </div>

                  {project.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Deadline: {format(parseISO(project.deadline), "MMM d, yyyy")}
                    </div>
                  )}

                  {/* Tasks */}
                  {projectTasks.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                        <LayoutList className="h-3.5 w-3.5" />
                        Tasks
                      </div>
                      <div className="space-y-1.5">
                        {projectTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CheckSquare className={`h-3.5 w-3.5 shrink-0 ${task.stage === "completed" ? "text-success" : "text-muted-foreground"}`} />
                              <div className="min-w-0">
                                <span className={`text-xs font-body font-medium block truncate ${task.stage === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                  {task.title}
                                </span>
                                {task.due_date && (
                                  <span className="text-[10px] text-muted-foreground font-body">
                                    Due: {format(parseISO(task.due_date), "MMM d")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-body shrink-0">
                              {clientStageLabel[task.stage] || task.stage}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

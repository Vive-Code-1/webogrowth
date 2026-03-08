import { FolderKanban, CheckSquare, Users, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useProjects } from "@/hooks/useProjects";
import { useAllTasks } from "@/hooks/useTasks";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TaskStageBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: tasks, isLoading: loadingTasks } = useAllTasks();
  const { data: teamMembers } = useTeamMembers();

  const activeProjects = projects?.filter((p) => p.status === "in_progress") || [];
  const allTasks = tasks || [];
  const completedTasks = allTasks.filter((t) => t.stage === "completed");
  const activeTasks = allTasks.filter((t) => t.stage !== "completed");
  const completionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loadingProjects || loadingTasks) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Welcome back! Here's your project overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Projects" value={activeProjects.length} subtitle={`${projects?.length || 0} total`} icon={FolderKanban} />
        <StatCard title="Total Tasks" value={allTasks.length} subtitle={`${completedTasks.length} completed`} icon={CheckSquare} />
        <StatCard title="Team Members" value={teamMembers?.length || 0} subtitle="All active" icon={Users} />
        <StatCard title="Completion Rate" value={`${completionRate}%`} subtitle="Overall" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 rounded-lg border bg-card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">Active Projects</h2>
            <Link to="/projects" className="text-xs text-primary hover:underline font-body">View All</Link>
          </div>
          <div className="space-y-4">
            {activeProjects.length === 0 && (
              <p className="text-sm text-muted-foreground font-body">No active projects yet.</p>
            )}
            {activeProjects.slice(0, 5).map((project) => {
              const progress = project.task_counts.total > 0
                ? Math.round((project.task_counts.completed / project.task_counts.total) * 100)
                : 0;
              return (
                <Link key={project.id} to={`/projects/${project.id}`} className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-medium text-foreground text-sm">{project.name}</h3>
                    {project.deadline && <span className="text-xs text-muted-foreground font-body">Due {project.deadline}</span>}
                  </div>
                  {project.client && (
                    <p className="text-xs text-muted-foreground font-body mb-3">{project.client.full_name || project.client.email}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((m) => (
                        <Avatar key={m.id} className="h-6 w-6 border-2 border-card">
                          <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-body">
                            {getInitials(m.profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-body border-2 border-card">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-[200px] ml-4">
                      <Progress value={progress} className="h-1.5" />
                      <span className="text-xs text-muted-foreground font-body w-8">{progress}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="rounded-lg border bg-card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-primary hover:underline font-body">View All</Link>
          </div>
          <div className="space-y-3">
            {activeTasks.length === 0 && (
              <p className="text-sm text-muted-foreground font-body">No active tasks.</p>
            )}
            {activeTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="p-3 rounded-lg bg-secondary/50 space-y-2">
                <span className="text-sm font-body font-medium text-foreground">{task.title}</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TaskStageBadge stage={task.stage} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  {task.assignee && (
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-body">
                        {getInitials(task.assignee.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { FolderKanban, CheckSquare, Users, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { projects, tasks, teamMembers } from "@/lib/mock-data";
import { TaskStatusBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const activeTasks = tasks.filter(t => t.status !== "done");
  const completedTasks = tasks.filter(t => t.status === "done");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Welcome back! Here's your project overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Projects" value={projects.filter(p => p.status === "active").length} subtitle="2 due this month" icon={FolderKanban} trend="+2" />
        <StatCard title="Total Tasks" value={tasks.length} subtitle={`${completedTasks.length} completed`} icon={CheckSquare} trend="+5" />
        <StatCard title="Team Members" value={teamMembers.length} subtitle="All active" icon={Users} />
        <StatCard title="Completion Rate" value="72%" subtitle="This month" icon={TrendingUp} trend="+8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 rounded-lg border bg-card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">Active Projects</h2>
            <Link to="/projects" className="text-xs text-primary hover:underline font-body">View All</Link>
          </div>
          <div className="space-y-4">
            {projects.filter(p => p.status === "active").map(project => (
              <div key={project.id} className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-medium text-foreground text-sm">{project.name}</h3>
                  <span className="text-xs text-muted-foreground font-body">Due {project.deadline}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground font-body">{project.client.company}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 3).map(m => (
                      <Avatar key={m.id} className="h-6 w-6 border-2 border-card">
                        <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-body">{m.avatar}</AvatarFallback>
                      </Avatar>
                    ))}
                    {project.teamMembers.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-body border-2 border-card">
                        +{project.teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-[200px] ml-4">
                    <Progress value={project.progress} className="h-1.5" />
                    <span className="text-xs text-muted-foreground font-body w-8">{project.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="rounded-lg border bg-card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-primary hover:underline font-body">View All</Link>
          </div>
          <div className="space-y-3">
            {activeTasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-3 rounded-lg bg-secondary/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body font-medium text-foreground">{task.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TaskStatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-body">{task.assignee.avatar}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

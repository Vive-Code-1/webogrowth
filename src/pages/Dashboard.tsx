import {
  FolderKanban, CheckSquare, Users, TrendingUp, DollarSign,
  Zap, Activity, BarChart3, Clock, ArrowUpRight
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useProjects } from "@/hooks/useProjects";
import { useAllTasks } from "@/hooks/useTasks";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TaskStageBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { useMemo, useState } from "react";
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, isWithinInterval, parseISO,
  format, eachDayOfInterval, isSameDay
} from "date-fns";

const STAGE_COLORS = [
  "hsl(var(--muted-foreground))",     // backlog
  "hsl(var(--primary))",              // todo
  "hsl(220, 80%, 55%)",              // in_progress
  "hsl(45, 90%, 50%)",               // internal_review
  "hsl(280, 70%, 55%)",              // client_review
  "hsl(150, 70%, 45%)",              // completed
];

const STAGE_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  internal_review: "Internal Review",
  client_review: "Client Review",
  completed: "Completed",
};

export default function Dashboard() {
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: tasks, isLoading: loadingTasks } = useAllTasks();
  const { data: teamMembers } = useTeamMembers();

  const [currency, setCurrency] = useState<"USD" | "BDT">("USD");
  const { data: bdtRate = 110 } = useExchangeRate();
  const BDT_RATE = bdtRate;
  const now = new Date();

  const activeProjects = projects?.filter((p) => p.status === "in_progress") || [];
  const allTasks = tasks || [];
  const completedTasks = allTasks.filter((t) => t.stage === "completed");
  const activeTasks = allTasks.filter((t) => t.stage !== "completed");
  const completionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  // Revenue calculations
  const revenueData = useMemo(() => {
    if (!projects) return { week: 0, month: 0, year: 0, monthlyChart: [], weeklyChart: [] };

    const weekInterval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    const monthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
    const yearInterval = { start: startOfYear(now), end: endOfYear(now) };

    let week = 0, month = 0, year = 0;
    projects.forEach((p) => {
      const budget = p.budget || 0;
      const date = parseISO(p.created_at);
      if (isWithinInterval(date, weekInterval)) week += budget;
      if (isWithinInterval(date, monthInterval)) month += budget;
      if (isWithinInterval(date, yearInterval)) year += budget;
    });

    // This month chart - each day of current month
    const monthDays = eachDayOfInterval(monthInterval);
    const thisMonthChart = monthDays.map((d) => {
      const total = projects
        .filter((p) => isSameDay(parseISO(p.created_at), d))
        .reduce((sum, p) => sum + (p.budget || 0), 0);
      return { name: format(d, "d"), revenue: total };
    });

    // Weekly chart - days of current week
    const weekDays = eachDayOfInterval(weekInterval);
    const weeklyChart = weekDays.map((d) => {
      const total = projects
        .filter((p) => isSameDay(parseISO(p.created_at), d))
        .reduce((sum, p) => sum + (p.budget || 0), 0);
      return { name: format(d, "EEE"), revenue: total };
    });

    return { week, month, year, thisMonthChart, weeklyChart };
  }, [projects]);

  // Task stage distribution
  const taskDistribution = useMemo(() => {
    const stages = ["backlog", "todo", "in_progress", "internal_review", "client_review", "completed"];
    return stages.map((stage, i) => ({
      name: STAGE_LABELS[stage],
      value: allTasks.filter((t) => t.stage === stage).length,
      color: STAGE_COLORS[i],
    })).filter(d => d.value > 0);
  }, [allTasks]);

  // Priority distribution
  const priorityData = useMemo(() => {
    if (!projects) return [];
    const priorities = ["low", "medium", "high"];
    return priorities.map((p) => ({
      name: p.charAt(0).toUpperCase() + p.slice(1),
      count: projects.filter((proj) => proj.priority === p).length,
    }));
  }, [projects]);

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  };

  const pieChartConfig = taskDistribution.reduce((acc, item, i) => {
    acc[item.name] = { label: item.name, color: STAGE_COLORS[i] };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const convertAmount = (val: number) => currency === "BDT" ? val * BDT_RATE : val;
  const currencySymbol = currency === "BDT" ? "৳" : "$";

  const formatCurrency = (val: number) => {
    const converted = convertAmount(val);
    if (converted >= 1000) return `${currencySymbol}${(converted / 1000).toFixed(1)}k`;
    return `${currencySymbol}${Math.round(converted)}`;
  };

  const chartData = useMemo(() => ({
    thisMonthChart: revenueData.thisMonthChart?.map(d => ({ ...d, revenue: convertAmount(d.revenue) })) || [],
    weeklyChart: revenueData.weeklyChart?.map(d => ({ ...d, revenue: convertAmount(d.revenue) })) || [],
  }), [revenueData, currency]);

  if (loadingProjects || loadingTasks) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Welcome back! Here's your project overview.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          {currency === "BDT" && (
            <span className="text-[11px] text-muted-foreground font-body">1 USD = ৳{BDT_RATE.toFixed(1)}</span>
          )}
          <div className="flex items-center gap-2 bg-secondary/60 rounded-full p-0.5">
            {(["USD", "BDT"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1 text-xs font-body font-medium rounded-full transition-all ${
                  currency === c
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "USD" ? "$ USD" : "৳ BDT"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-body bg-secondary/50 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            {format(now, "MMM d, yyyy")}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(revenueData.month)}
          subtitle={`${currencySymbol}${Math.round(convertAmount(revenueData.year)).toLocaleString()} this year`}
          icon={DollarSign}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          trend={revenueData.month > 0 ? "Active" : undefined}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          subtitle={`${projects?.length || 0} total projects`}
          icon={Zap}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-500"
        />
        <StatCard
          title="Total Tasks"
          value={allTasks.length}
          subtitle={`${completedTasks.length} completed`}
          icon={Activity}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          trend={`${completionRate}%`}
        />
        <StatCard
          title="Team Members"
          value={teamMembers?.length || 0}
          subtitle="All active members"
          icon={Users}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
        />
      </div>

      {/* Revenue Chart + Task Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 animate-fade-in">
          <div className="mb-1">
              <h2 className="font-heading text-lg font-semibold text-foreground">Revenue Overview</h2>
              <p className="text-xs text-muted-foreground font-body mt-0.5">Budget from projects by time period</p>
          </div>
          <Tabs defaultValue="monthly" className="mt-3">
            <TabsList className="h-8">
              <TabsTrigger value="weekly" className="text-xs px-3 h-7">This Week</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3 h-7">This Month</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="mt-4">
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <AreaChart data={chartData.thisMonthChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="font-body" />
                   <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${currencySymbol}${v}`} />
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="weekly" className="mt-4">
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={chartData.weeklyChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${currencySymbol}${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </div>

        {/* Task Distribution Donut */}
        <div className="rounded-xl border bg-card p-5 animate-fade-in">
          <h2 className="font-heading text-lg font-semibold text-foreground">Task Distribution</h2>
          <p className="text-xs text-muted-foreground font-body mt-0.5 mb-3">Tasks by current stage</p>
          {taskDistribution.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-10">No tasks yet.</p>
          ) : (
            <>
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {taskDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {taskDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-body">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Priority Overview + Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">Active Projects</h2>
              <p className="text-xs text-muted-foreground font-body mt-0.5">{activeProjects.length} projects in progress</p>
            </div>
            <Link to="/projects" className="text-xs text-primary hover:underline font-body flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeProjects.length === 0 && (
              <p className="text-sm text-muted-foreground font-body text-center py-6">No active projects yet.</p>
            )}
            {activeProjects.slice(0, 4).map((project) => {
              const progress = project.task_counts.total > 0
                ? Math.round((project.task_counts.completed / project.task_counts.total) * 100)
                : 0;
              return (
                <Link key={project.id} to={`/projects/${project.id}`} className="block p-4 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-all duration-200 group/card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-medium text-foreground text-sm">{project.name}</h3>
                        {project.client && (
                          <p className="text-[11px] text-muted-foreground font-body">{project.client.full_name || project.client.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {project.budget && (
                        <span className="text-xs font-semibold text-foreground font-body">${project.budget.toLocaleString()}</span>
                      )}
                      {project.deadline && (
                        <p className="text-[11px] text-muted-foreground font-body">Due {project.deadline}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
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

        {/* Recent Tasks + Priority */}
        <div className="space-y-6">
          {/* Priority Overview */}
          <div className="rounded-xl border bg-card p-5 animate-fade-in">
            <h2 className="font-heading text-lg font-semibold text-foreground">Project Priority</h2>
            <p className="text-xs text-muted-foreground font-body mt-0.5 mb-4">Distribution by priority level</p>
            <div className="space-y-3">
              {priorityData.map((item) => {
                const total = projects?.length || 1;
                const pct = Math.round((item.count / total) * 100);
                const color = item.name === "High" ? "bg-red-500" : item.name === "Medium" ? "bg-orange-400" : "bg-green-500";
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-body">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold text-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="rounded-xl border bg-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-semibold text-foreground">Recent Tasks</h2>
              <Link to="/tasks" className="text-xs text-primary hover:underline font-body flex items-center gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {activeTasks.length === 0 && (
                <p className="text-sm text-muted-foreground font-body text-center py-4">No active tasks.</p>
              )}
              {activeTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors space-y-2">
                  <span className="text-sm font-body font-medium text-foreground leading-tight block">{task.title}</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
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
    </div>
  );
}

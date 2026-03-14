import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProject } from "@/hooks/useProjects";
import { useProjectTasks, type TaskWithAssignee } from "@/hooks/useTasks";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskModal } from "@/components/TaskModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, Tag, AlertTriangle, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type TaskStage = Database["public"]["Enums"]["task_stage"];

const priorityStyles: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/20 text-primary",
  high: "bg-destructive/20 text-destructive",
  urgent: "bg-destructive text-destructive-foreground",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { data: project, isLoading } = useProject(id);
  const { data: tasks } = useProjectTasks(id);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(null);
  const [newTaskStage, setNewTaskStage] = useState<TaskStage>("backlog");

  const handleTaskClick = (task: TaskWithAssignee) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleNewTask = (stage: TaskStage) => {
    setSelectedTask(null);
    setNewTaskStage(stage);
    setTaskModalOpen(true);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-96" /></div>;
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground font-body">Project not found</p>
      </div>
    );
  }

  const progress = project.task_counts.total > 0
    ? Math.round((project.task_counts.completed / project.task_counts.total) * 100)
    : 0;

  const teamMembers = project.members
    .filter((m) => m.role === "team")
    .map((m) => ({ id: m.user_id, full_name: m.profile?.full_name || null, email: m.profile?.email || null }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/projects" className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{project.name}</h1>
          {project.description && <p className="text-sm text-muted-foreground font-body mt-0.5">{project.description}</p>}
        </div>
      </div>

      {/* Project Info Card */}
      <div className="rounded-lg border bg-card p-5 animate-fade-in">
        <div className="flex flex-wrap gap-x-6 gap-y-4 items-start">
          {/* Category & Priority */}
          <div className="flex flex-wrap gap-1.5">
            {project.category && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Tag className="h-3 w-3" /> {project.category}
              </Badge>
            )}
            {project.priority && (
              <Badge className={`text-xs border-0 gap-1 ${priorityStyles[project.priority] || ""}`}>
                <AlertTriangle className="h-3 w-3" />
                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
              </Badge>
            )}
          </div>

          {/* Budget */}
          {project.budget && (
            <div className="flex items-center gap-2 text-sm font-body">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">
                {project.currency || "BDT"} {Number(project.budget).toLocaleString()}
              </span>
            </div>
          )}

          {/* Client */}
          {project.client && (
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/20 text-primary font-body text-[10px]">
                  {getInitials(project.client.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-body font-medium text-foreground">{project.client.full_name || "Unnamed"}</p>
                <p className="text-[10px] text-muted-foreground font-body">{project.client.email}</p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-wrap gap-3">
            {project.start_date && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                <Calendar className="h-3 w-3" /> Start: {project.start_date}
              </div>
            )}
            {project.deadline && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                <Calendar className="h-3 w-3" /> Deadline: {project.deadline}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="min-w-[140px] space-y-1">
            <div className="flex justify-between text-xs font-body">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Notes */}
          {project.notes && (
            <div className="min-w-[160px] max-w-xs">
              <h3 className="font-heading font-semibold text-foreground text-xs flex items-center gap-1">
                <FileText className="h-3 w-3" /> Notes
              </h3>
              <p className="text-[11px] text-muted-foreground font-body mt-0.5 whitespace-pre-wrap line-clamp-2">{project.notes}</p>
            </div>
          )}

          {/* Team */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-heading font-semibold text-foreground mr-1">Team:</span>
            {project.members.filter((m) => m.role === "team").length > 0 ? (
              <div className="flex -space-x-1.5">
                {project.members.filter((m) => m.role === "team").map((m) => (
                  <Avatar key={m.id} className="h-6 w-6 border-2 border-card">
                    <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-body">
                      {getInitials(m.profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground font-body">No members</span>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board - Full Width */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <KanbanBoard tasks={tasks || []} onTaskClick={handleTaskClick} onNewTask={handleNewTask} />
      </div>

      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={selectedTask}
        projectId={project.id}
        teamMembers={teamMembers}
      />
    </div>
  );
}

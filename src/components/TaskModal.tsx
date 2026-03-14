import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";
import { useCreateTask, useUpdateTask, type TaskWithAssignee } from "@/hooks/useTasks";
import { useComments, useAddComment } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { TaskStageBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import type { Database } from "@/integrations/supabase/types";

type TaskStage = Database["public"]["Enums"]["task_stage"];
type TaskPriority = Database["public"]["Enums"]["task_priority"];

const stages: TaskStage[] = ["backlog", "todo", "in_progress", "internal_review", "client_review", "completed"];
const priorities: TaskPriority[] = ["low", "medium", "high"];

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithAssignee | null;
  projectId: string;
  teamMembers?: { id: string; full_name: string | null; email: string | null }[];
  projects?: { id: string; name: string }[];
}

export function TaskModal({ open, onOpenChange, task, projectId, teamMembers, projects }: TaskModalProps) {
  const isEditing = !!task;
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [stage, setStage] = useState<TaskStage>(task?.stage || "backlog");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "medium");
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || "");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [visibleToClient, setVisibleToClient] = useState(task?.visible_to_client || false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [commentText, setCommentText] = useState("");

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: comments } = useComments(task?.id);
  const addComment = useAddComment();
  const { user } = useAuth();

  // Reset form when task changes
  const handleOpenChange = (open: boolean) => {
    if (open && task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStage(task.stage);
      setPriority(task.priority);
      setAssigneeId(task.assignee_id || "");
      setDueDate(task.due_date || "");
      setVisibleToClient(task.visible_to_client);
    } else if (open && !task) {
      setTitle("");
      setDescription("");
      setStage("backlog");
      setPriority("medium");
      setAssigneeId("");
      setDueDate("");
      setVisibleToClient(false);
      setSelectedProjectId(projectId || "");
    }
    onOpenChange(open);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      if (isEditing) {
        await updateTask.mutateAsync({
          id: task.id,
          title,
          description: description || null,
          stage,
          priority,
          assignee_id: assigneeId || null,
          due_date: dueDate || null,
          visible_to_client: visibleToClient,
        });
        toast({ title: "Task updated" });
      } else {
        await createTask.mutateAsync({
          title,
          description: description || null,
          project_id: projectId,
          stage,
          priority,
          assignee_id: assigneeId || null,
          due_date: dueDate || null,
          visible_to_client: visibleToClient,
        });
        toast({ title: "Task created" });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !task?.id) return;
    try {
      await addComment.mutateAsync({ task_id: task.id, content: commentText });
      setCommentText("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading">{isEditing ? "Edit Task" : "New Task"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Stage</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as TaskStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s} value={s}>
                      <TaskStageBadge stage={s} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      <PriorityBadge priority={p} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  {teamMembers?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name || m.email || "Unnamed"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={visibleToClient} onCheckedChange={setVisibleToClient} />
            <Label className="font-body text-sm">Visible to Client</Label>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={createTask.isPending || updateTask.isPending}>
            {createTask.isPending || updateTask.isPending ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
          </Button>

          {/* Comments section - only for existing tasks */}
          {isEditing && (
            <>
              <Separator />
              <div>
                <h3 className="font-heading font-semibold text-sm mb-3">Comments</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                  {comments?.length === 0 && (
                    <p className="text-xs text-muted-foreground font-body">No comments yet</p>
                  )}
                  {comments?.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-body">
                          {getInitials(c.user?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-body font-medium text-foreground">{c.user?.full_name || "User"}</span>
                          <span className="text-[10px] text-muted-foreground font-body">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-body text-muted-foreground mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    className="text-sm"
                  />
                  <Button size="icon" variant="ghost" onClick={handleAddComment} disabled={addComment.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

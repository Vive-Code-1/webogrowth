import { tasks, projects } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskStatusBadge, PriorityBadge } from "@/components/TaskStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

export default function Tasks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">All tasks across projects</p>
      </div>

      <div className="rounded-lg border bg-card animate-fade-in overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-heading text-xs">Task</TableHead>
              <TableHead className="font-heading text-xs">Project</TableHead>
              <TableHead className="font-heading text-xs">Assignee</TableHead>
              <TableHead className="font-heading text-xs">Status</TableHead>
              <TableHead className="font-heading text-xs">Priority</TableHead>
              <TableHead className="font-heading text-xs">Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
                <TableRow key={task.id} className="hover:bg-secondary/50">
                  <TableCell>
                    <div>
                      <p className="font-body font-medium text-foreground text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground font-body line-clamp-1">{task.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-body">{project?.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-body">{task.assignee.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-body text-foreground">{task.assignee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><TaskStatusBadge status={task.status} /></TableCell>
                  <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {task.dueDate}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

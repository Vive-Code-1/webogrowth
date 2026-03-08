import { teamMembers } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, CheckCircle, Clock } from "lucide-react";

export default function Team() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Team Members</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Manage your agency team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teamMembers.map(member => (
          <div key={member.id} className="rounded-lg border bg-card p-5 card-hover animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/20 text-primary font-heading font-semibold">{member.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-heading font-semibold text-foreground">{member.name}</h3>
                <p className="text-xs text-primary font-body">{member.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-4">
              <Mail className="h-3 w-3" /> {member.email}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="flex items-center justify-center gap-1 text-success mb-1">
                  <CheckCircle className="h-3 w-3" />
                </div>
                <p className="font-heading font-bold text-foreground">{member.tasksCompleted}</p>
                <p className="text-[10px] text-muted-foreground font-body">Completed</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="flex items-center justify-center gap-1 text-info mb-1">
                  <Clock className="h-3 w-3" />
                </div>
                <p className="font-heading font-bold text-foreground">{member.tasksInProgress}</p>
                <p className="text-[10px] text-muted-foreground font-body">In Progress</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

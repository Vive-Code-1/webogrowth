import { useState } from "react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, CheckCircle, Clock, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { InviteUserDialog } from "@/components/InviteUserDialog";
import { useAuth } from "@/hooks/useAuth";

export default function Team() {
  const { data: members, isLoading } = useTeamMembers();
  const { role } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Team Members</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">{members?.length || 0} team members</p>
        </div>
        {role === "admin" && (
          <Button onClick={() => setInviteOpen(true)} className="font-body gap-2">
            <UserPlus className="h-4 w-4" /> Invite Team Member
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {members?.length === 0 && (
          <p className="text-sm text-muted-foreground font-body col-span-full text-center py-12">
            No team members yet. Invite team members using the button above.
          </p>
        )}
        {members?.map((member) => (
          <div key={member.id} className="rounded-lg border bg-card p-5 card-hover animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/20 text-primary font-heading font-semibold">
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-heading font-semibold text-foreground">{member.full_name || "Unnamed"}</h3>
                <p className="text-xs text-primary font-body">Team Member</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-4">
              <Mail className="h-3 w-3" /> {member.email || "No email"}
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

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} defaultRole="team" />
    </div>
  );
}

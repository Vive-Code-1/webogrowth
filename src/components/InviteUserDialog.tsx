import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole?: "admin" | "team" | "client";
}

export function InviteUserDialog({ open, onOpenChange, defaultRole = "team" }: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string>(defaultRole);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      toast({ title: "Not authenticated", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { email, role, full_name: fullName || undefined },
    });

    setLoading(false);

    if (error || data?.error) {
      toast({
        title: "Invite failed",
        description: data?.error || error?.message || "Unknown error",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Invitation sent!", description: `${email} has been invited as ${role}.` });
    setEmail("");
    setFullName("");
    setRole(defaultRole);
    onOpenChange(false);
  };

  const roleLabel = defaultRole === "team" ? "Team Member" : defaultRole === "client" ? "Client" : "User";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Invite {roleLabel}</DialogTitle>
          <DialogDescription className="font-body">
            Send an email invitation. They'll receive a link to set up their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name" className="font-body text-sm">Full Name</Label>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="font-body text-sm">Email *</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="team">Team Member</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-body">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="font-body">
              {loading ? "Sending…" : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

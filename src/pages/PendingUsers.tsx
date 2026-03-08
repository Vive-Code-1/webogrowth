import { useState } from "react";
import { usePendingUsers } from "@/hooks/usePendingUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Clock } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function PendingUsers() {
  const { pendingUsers, isLoading, approveUser } = usePendingUsers();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, AppRole>>({});
  const { toast } = useToast();

  const handleApprove = async (userId: string) => {
    const role = selectedRoles[userId];
    if (!role) {
      toast({ title: "Role সিলেক্ট করুন", variant: "destructive" });
      return;
    }
    try {
      await approveUser.mutateAsync({ userId, role });
      toast({ title: "ইউজার এপ্রুভ হয়েছে ✅" });
    } catch {
      toast({ title: "এপ্রুভ করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Pending Users</h1>
        <p className="text-muted-foreground mt-1">নতুন সাইনআপ করা ইউজারদের রোল দিয়ে এপ্রুভ করুন</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <UserCheck className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">কোনো পেন্ডিং ইউজার নেই</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendingUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <span className="truncate">{user.full_name || "No Name"}</span>
                  <Badge variant="outline" className="shrink-0 ml-2">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Signed up: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Select
                  value={selectedRoles[user.id] || ""}
                  onValueChange={(v) =>
                    setSelectedRoles((prev) => ({ ...prev, [user.id]: v as AppRole }))
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Role select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => handleApprove(user.id)}
                  disabled={approveUser.isPending}
                >
                  Approve
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

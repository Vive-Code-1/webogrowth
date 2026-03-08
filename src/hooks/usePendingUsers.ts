import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface PendingUser {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

export function usePendingUsers() {
  const queryClient = useQueryClient();

  const { data: pendingUsers = [], isLoading } = useQuery({
    queryKey: ["pending-users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at"),
        supabase.from("user_roles").select("user_id"),
      ]);

      const roleUserIds = new Set((roles ?? []).map((r) => r.user_id));
      return (profiles ?? []).filter((p) => !roleUserIds.has(p.id)) as PendingUser[];
    },
  });

  const approveUser = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
    },
  });

  return { pendingUsers, isLoading, approveUser };
}

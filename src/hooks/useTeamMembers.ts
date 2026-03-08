import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  tasksCompleted: number;
  tasksInProgress: number;
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async (): Promise<TeamMember[]> => {
      // Get all users with 'team' role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "team");

      if (error) throw error;

      const members = await Promise.all(
        (roles || []).map(async (r) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", r.user_id)
            .single();

          const { count: completed } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("assignee_id", r.user_id)
            .eq("stage", "completed");

          const { count: inProgress } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("assignee_id", r.user_id)
            .eq("stage", "in_progress");

          return {
            id: profile?.id || r.user_id,
            full_name: profile?.full_name || null,
            email: profile?.email || null,
            avatar_url: profile?.avatar_url || null,
            tasksCompleted: completed || 0,
            tasksInProgress: inProgress || 0,
          };
        })
      );

      return members;
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommentWithUser {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  task_id: string;
  user: { full_name: string | null; email: string | null; avatar_url: string | null } | null;
}

export function useComments(taskId: string | undefined) {
  return useQuery({
    queryKey: ["comments", taskId],
    enabled: !!taskId,
    queryFn: async (): Promise<CommentWithUser[]> => {
      if (!taskId) return [];

      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const comments = await Promise.all(
        (data || []).map(async (c) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, avatar_url")
            .eq("id", c.user_id)
            .single();
          return { ...c, user: profile };
        })
      );

      return comments;
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task_id, content }: { task_id: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("comments").insert({
        task_id,
        content,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["comments", vars.task_id] }),
  });
}

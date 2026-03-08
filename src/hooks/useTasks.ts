import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskStage = Database["public"]["Enums"]["task_stage"];
type TaskPriority = Database["public"]["Enums"]["task_priority"];

export interface TaskWithAssignee extends Task {
  assignee: { id: string; full_name: string | null; email: string | null; avatar_url: string | null } | null;
  project_name?: string;
}

export function useProjectTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: ["tasks", "project", projectId],
    enabled: !!projectId,
    queryFn: async (): Promise<TaskWithAssignee[]> => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tasks = await Promise.all(
        (data || []).map(async (task) => {
          let assignee = null;
          if (task.assignee_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, full_name, email, avatar_url")
              .eq("id", task.assignee_id)
              .single();
            assignee = profile;
          }
          return { ...task, assignee };
        })
      );

      return tasks;
    },
  });
}

export function useAllTasks() {
  return useQuery({
    queryKey: ["tasks", "all"],
    queryFn: async (): Promise<TaskWithAssignee[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tasks = await Promise.all(
        (data || []).map(async (task) => {
          let assignee = null;
          if (task.assignee_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, full_name, email, avatar_url")
              .eq("id", task.assignee_id)
              .single();
            assignee = profile;
          }

          const { data: project } = await supabase
            .from("projects")
            .select("name")
            .eq("id", task.project_id)
            .single();

          return { ...task, assignee, project_name: project?.name };
        })
      );

      return tasks;
    },
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: ["tasks", "my"],
    queryFn: async (): Promise<TaskWithAssignee[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assignee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tasks = await Promise.all(
        (data || []).map(async (task) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", user.id)
            .single();

          const { data: project } = await supabase
            .from("projects")
            .select("name")
            .eq("id", task.project_id)
            .single();

          return { ...task, assignee: profile, project_name: project?.name };
        })
      );

      return tasks;
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TaskInsert, "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...input, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<Task>) => {
      const { id, ...updates } = input;
      const { error } = await supabase.from("tasks").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateTaskStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: TaskStage }) => {
      const { error } = await supabase.from("tasks").update({ stage }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export type { TaskStage, TaskPriority };

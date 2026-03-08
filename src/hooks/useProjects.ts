import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

export interface ProjectWithDetails extends Project {
  members: { id: string; user_id: string; role: string; profile: { id: string; full_name: string | null; email: string | null; avatar_url: string | null } }[];
  client: { id: string; full_name: string | null; email: string | null; avatar_url: string | null } | null;
  task_counts: { total: number; completed: number };
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<ProjectWithDetails[]> => {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const enriched = await Promise.all(
        (projects || []).map(async (project) => {
          // Fetch members with profiles
          const { data: members } = await supabase
            .from("project_members")
            .select("id, user_id, role")
            .eq("project_id", project.id);

          const memberProfiles = await Promise.all(
            (members || []).map(async (m) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("id, full_name, email, avatar_url")
                .eq("id", m.user_id)
                .single();
              return { ...m, profile: profile! };
            })
          );

          // Fetch client profile
          let client = null;
          if (project.client_id) {
            const { data } = await supabase
              .from("profiles")
              .select("id, full_name, email, avatar_url")
              .eq("id", project.client_id)
              .single();
            client = data;
          }

          // Fetch task counts
          const { count: total } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          const { count: completed } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id)
            .eq("stage", "completed");

          return {
            ...project,
            members: memberProfiles,
            client,
            task_counts: { total: total || 0, completed: completed || 0 },
          };
        })
      );

      return enriched;
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["projects", id],
    enabled: !!id,
    queryFn: async (): Promise<ProjectWithDetails | null> => {
      if (!id) return null;

      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const { data: members } = await supabase
        .from("project_members")
        .select("id, user_id, role")
        .eq("project_id", project.id);

      const memberProfiles = await Promise.all(
        (members || []).map(async (m) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", m.user_id)
            .single();
          return { ...m, profile: profile! };
        })
      );

      let client = null;
      if (project.client_id) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", project.client_id)
          .single();
        client = data;
      }

      const { count: total } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id);

      const { count: completed } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id)
        .eq("stage", "completed");

      return {
        ...project,
        members: memberProfiles,
        client,
        task_counts: { total: total || 0, completed: completed || 0 },
      };
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      start_date?: string;
      deadline?: string;
      client_id?: string;
      team_member_ids?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          name: input.name,
          description: input.description || null,
          start_date: input.start_date || null,
          deadline: input.deadline || null,
          client_id: input.client_id || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add team members
      if (input.team_member_ids?.length) {
        const { error: memberError } = await supabase
          .from("project_members")
          .insert(
            input.team_member_ids.map((uid) => ({
              project_id: project.id,
              user_id: uid,
              role: "team" as const,
            }))
          );
        if (memberError) throw memberError;
      }

      // Add client as project member too
      if (input.client_id) {
        await supabase.from("project_members").insert({
          project_id: project.id,
          user_id: input.client_id,
          role: "client" as const,
        });
      }

      return project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<ProjectInsert>) => {
      const { id, ...updates } = input;
      const { error } = await supabase.from("projects").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClientProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  projects: { id: string; name: string; status: string }[];
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<ClientProfile[]> => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "client");

      if (error) throw error;

      const clients = await Promise.all(
        (roles || []).map(async (r) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", r.user_id)
            .single();

          const { data: projects } = await supabase
            .from("projects")
            .select("id, name, status")
            .eq("client_id", r.user_id);

          return {
            id: profile?.id || r.user_id,
            full_name: profile?.full_name || null,
            email: profile?.email || null,
            avatar_url: profile?.avatar_url || null,
            projects: projects || [],
          };
        })
      );

      return clients;
    },
  });
}

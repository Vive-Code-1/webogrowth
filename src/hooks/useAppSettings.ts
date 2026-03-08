import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function useAppSettings() {
  const queryClient = useQueryClient();

  const { data: logoUrl, isLoading } = useQuery({
    queryKey: ["app-settings", "logo_url"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings" as any)
        .select("value")
        .eq("key", "logo_url")
        .single();
      return (data as any)?.value as string | null;
    },
  });

  const fullLogoUrl = logoUrl
    ? `${SUPABASE_URL}/storage/v1/object/public/branding/${logoUrl}`
    : null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["app-settings", "logo_url"] });
  };

  return { logoUrl: fullLogoUrl, rawLogoPath: logoUrl, isLoading, invalidate };
}

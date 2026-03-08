import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AppLayout() {
  const { user, role } = useAuth();
  const isMobile = useIsMobile();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const initials = (profile?.full_name || user?.user_metadata?.full_name || "")
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const avatarUrl = profile?.avatar_url
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null;

  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {!isMobile && <AppSidebar />}
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b px-4">
              <div className="flex items-center gap-3">
                {!isMobile && <SidebarTrigger />}
                {isMobile && (
                  <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center font-heading font-bold text-primary-foreground text-xs">
                    W
                  </div>
                )}
                <span className="text-sm text-muted-foreground font-body">
                  {isMobile ? "WeboGrowth" : "Project Management"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {role && !isMobile && (
                  <span className="text-xs font-body text-muted-foreground capitalize bg-secondary px-2 py-1 rounded">
                    {role}
                  </span>
                )}
                <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                </button>
                <Link to="/profile">
                  <Avatar className="h-8 w-8">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile" />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-body font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </header>
            <main className={`flex-1 overflow-auto p-4 md:p-6 ${isMobile ? "pb-24" : ""}`}>
              <Outlet />
            </main>
          </div>
          {isMobile && <MobileBottomNav />}
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

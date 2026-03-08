import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";

export function AppLayout() {
  const { user, role } = useAuth();
  const initials = user?.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground font-body">Project Management</span>
              </div>
              <div className="flex items-center gap-3">
                {role && (
                  <span className="text-xs font-body text-muted-foreground capitalize bg-secondary px-2 py-1 rounded">
                    {role}
                  </span>
                )}
                <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                </button>
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-body font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

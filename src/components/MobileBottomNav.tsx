import { LayoutDashboard, FolderKanban, CheckSquare, User, Building2, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navByRole = {
  admin: [
    { title: "Home", url: "/", icon: LayoutDashboard },
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "Tasks", url: "/tasks", icon: CheckSquare },
    { title: "Team", url: "/team", icon: Users },
    { title: "Clients", url: "/clients", icon: Building2 },
    { title: "Profile", url: "/profile", icon: User },
  ],
  team: [
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "My Tasks", url: "/my-tasks", icon: CheckSquare },
    { title: "Tasks", url: "/tasks", icon: CheckSquare },
    { title: "Profile", url: "/profile", icon: User },
  ],
  client: [
    { title: "Portal", url: "/portal", icon: FolderKanban },
    { title: "Profile", url: "/profile", icon: User },
  ],
};

export function MobileBottomNav() {
  const { role } = useAuth();
  const location = useLocation();
  const items = navByRole[role || "team"] || navByRole.team;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-3 mb-3">
        <nav className="flex items-center justify-around rounded-full bg-card/80 backdrop-blur-xl border border-border/50 px-2 py-2 shadow-lg">
          {items.map((item) => {
            const isActive = item.url === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.url);
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className="flex flex-col items-center gap-0.5 relative"
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-full transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-body transition-colors",
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

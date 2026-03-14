import { LayoutDashboard, FolderKanban, Users, CheckSquare, Building2, LogOut, UserPlus } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePendingUsers } from "@/hooks/usePendingUsers";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const allNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin"] },
  { title: "Projects", url: "/projects", icon: FolderKanban, roles: ["admin", "team"] },
  { title: "Tasks", url: "/tasks", icon: CheckSquare, roles: ["admin", "team"] },
  { title: "My Tasks", url: "/my-tasks", icon: CheckSquare, roles: ["team"] },
  { title: "Team", url: "/team", icon: Users, roles: ["admin"] },
  { title: "Clients", url: "/clients", icon: Building2, roles: ["admin"] },
  { title: "Pending Users", url: "/pending-users", icon: UserPlus, roles: ["admin"] },
  { title: "Portal", url: "/portal", icon: FolderKanban, roles: ["client"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role, signOut } = useAuth();
  const { pendingUsers } = usePendingUsers();
  const { logoUrl } = useAppSettings();
  const pendingCount = role === "admin" ? pendingUsers.length : 0;

  const navItems = allNavItems.filter(
    (item) => !role || item.roles.includes(role)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <div className={`p-4 flex justify-center ${collapsed ? "px-2" : ""}`}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className={`${collapsed ? "h-8 w-8" : "h-10 w-10"} rounded-lg object-contain shrink-0`} />
          ) : (
            <div className={`${collapsed ? "h-8 w-8 text-sm" : "h-10 w-10 text-base"} rounded-lg bg-primary flex items-center justify-center font-heading font-bold text-primary-foreground shrink-0`}>
              W
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-body text-xs uppercase tracking-wider">
            {!collapsed && "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-secondary"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {item.url === "/pending-users" && pendingCount > 0 && !collapsed && (
                        <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center">
                          {pendingCount}
                        </Badge>
                      )}
                      {item.url === "/pending-users" && pendingCount > 0 && collapsed && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut} className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span className="font-body text-sm">Sign out</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

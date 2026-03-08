import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { RoleGuard } from "@/components/RoleGuard";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Tasks from "@/pages/Tasks";
import Team from "@/pages/Team";
import Clients from "@/pages/Clients";
import MyTasks from "@/pages/MyTasks";
import ClientPortal from "@/pages/ClientPortal";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import PendingUsers from "@/pages/PendingUsers";
import Profile from "@/pages/Profile";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<RoleGuard allowedRoles={["admin"]}><Dashboard /></RoleGuard>} />
              <Route path="/projects" element={<RoleGuard allowedRoles={["admin", "team"]}><Projects /></RoleGuard>} />
              <Route path="/projects/:id" element={<RoleGuard allowedRoles={["admin", "team"]}><ProjectDetail /></RoleGuard>} />
              <Route path="/tasks" element={<RoleGuard allowedRoles={["admin", "team"]}><Tasks /></RoleGuard>} />
              <Route path="/team" element={<RoleGuard allowedRoles={["admin"]}><Team /></RoleGuard>} />
              <Route path="/clients" element={<RoleGuard allowedRoles={["admin"]}><Clients /></RoleGuard>} />
              <Route path="/my-tasks" element={<RoleGuard allowedRoles={["admin", "team"]}><MyTasks /></RoleGuard>} />
              <Route path="/portal" element={<RoleGuard allowedRoles={["client"]}><ClientPortal /></RoleGuard>} />
              <Route path="/pending-users" element={<RoleGuard allowedRoles={["admin"]}><PendingUsers /></RoleGuard>} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

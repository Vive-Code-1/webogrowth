import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";

type AppRole = "admin" | "team" | "client";

interface RoleGuardProps {
  allowedRoles: AppRole[];
  children: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ allowedRoles, children, redirectTo }: RoleGuardProps) {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role || !allowedRoles.includes(role)) {
    const fallback = redirectTo || (role === "client" ? "/portal" : role === "team" ? "/projects" : "/");
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

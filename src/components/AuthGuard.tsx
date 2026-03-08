import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, role, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Access Pending</h1>
          <p className="text-sm text-muted-foreground font-body">
            Your account has been created but an admin hasn't assigned you a role yet. 
            Please contact your administrator to get access.
          </p>
          <Button variant="outline" onClick={signOut} className="font-body">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

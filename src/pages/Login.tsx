import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Sparkles, ShieldCheck, Users } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const { logoUrl } = useAppSettings();

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
    else navigate("/");
  };

  const Logo = () =>
    logoUrl ? (
      <img src={logoUrl} alt="Company Logo" className="h-14 w-auto max-w-[180px] object-contain" />
    ) : (
      <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center font-heading font-bold text-primary-foreground text-2xl">
        W
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-background grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden flex-col justify-between p-10 border-r border-border">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px circle at 20% 20%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(500px circle at 80% 70%, hsl(var(--primary) / 0.10), transparent 60%)",
          }}
        />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative space-y-6 max-w-md">
          <h2 className="font-heading text-4xl font-bold leading-tight text-foreground">
            Run your agency<br />
            <span className="text-primary">like a pro.</span>
          </h2>
          <p className="font-body text-muted-foreground text-base">
            Manage projects, assign tasks to your team, and give clients a clean portal — all in one place.
          </p>
          <ul className="space-y-3 pt-2">
            {[
              { icon: ShieldCheck, text: "Role-based access for admins, team & clients" },
              { icon: Users, text: "Invite teammates and clients in seconds" },
              { icon: Sparkles, text: "Beautiful Kanban, comments & activity tracking" },
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-body text-foreground/80">
                <span className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <f.icon className="h-4 w-4 text-primary" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} WeboGrowth. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex justify-center">
            <Logo />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="font-heading text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground font-body">
              Sign in to continue to your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="font-body h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-body text-sm">Password</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary font-body">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="font-body h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full font-body h-11 text-sm font-semibold shadow-[0_0_30px_-10px_hsl(var(--primary)/0.6)]"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-body">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center font-heading font-bold text-primary-foreground text-xl mx-auto">
            W
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground font-body">
            {sent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-body">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="font-body"
              />
            </div>
            <Button type="submit" className="w-full font-body" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="text-center">
          <Link to="/login" className="text-sm text-primary hover:underline font-body inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

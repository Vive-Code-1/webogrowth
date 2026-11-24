import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-xl border bg-card p-8 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/15 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="font-heading text-xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground font-body">
            This page hit an unexpected problem. Your data is safe — reload to continue.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reload
            </Button>
            <Button variant="outline" onClick={() => { window.location.href = "/"; }}>Go home</Button>
          </div>
        </div>
      </div>
    );
  }
}

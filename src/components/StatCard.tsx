import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5 card-hover animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-body">{title}</span>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="font-heading text-2xl font-bold text-foreground">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {trend && <span className="text-xs text-primary font-body font-medium">{trend}</span>}
        <span className="text-xs text-muted-foreground font-body">{subtitle}</span>
      </div>
    </div>
  );
}

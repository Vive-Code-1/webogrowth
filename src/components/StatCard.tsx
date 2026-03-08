import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 card-hover animate-fade-in relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-body">{title}</span>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${iconBg || 'bg-primary/10'}`}>
            <Icon className={`h-5 w-5 ${iconColor || 'text-primary'}`} />
          </div>
        </div>
        <div className="font-heading text-2xl font-bold text-foreground tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1.5">
          {trend && (
            <span className="text-xs text-primary font-body font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
          <span className="text-xs text-muted-foreground font-body">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}

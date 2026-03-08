import { clients, projects } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";

export default function Clients() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Manage client relationships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.map(client => {
          const clientProjects = projects.filter(p => p.client.id === client.id);
          return (
            <div key={client.id} className="rounded-lg border bg-card p-5 card-hover animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/20 text-primary font-heading font-semibold">{client.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{client.name}</h3>
                  <p className="text-xs text-primary font-body">{client.company}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-4">
                <Mail className="h-3 w-3" /> {client.email}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-body mb-2">
                  <FolderKanban className="h-3 w-3" /> {clientProjects.length} Project{clientProjects.length !== 1 ? "s" : ""}
                </div>
                {clientProjects.map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`} className="block p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <p className="text-xs font-body font-medium text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-body capitalize">{p.status}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

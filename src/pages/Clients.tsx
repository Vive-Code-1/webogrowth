import { useClients } from "@/hooks/useClients";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Clients() {
  const { data: clients, isLoading } = useClients();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">{clients?.length || 0} clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients?.length === 0 && (
          <p className="text-sm text-muted-foreground font-body col-span-full text-center py-12">
            No clients yet. Clients can sign up with the "Client" role.
          </p>
        )}
        {clients?.map((client) => (
          <div key={client.id} className="rounded-lg border bg-card p-5 card-hover animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/20 text-primary font-heading font-semibold">
                  {getInitials(client.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-heading font-semibold text-foreground">{client.full_name || "Unnamed"}</h3>
                <p className="text-xs text-primary font-body">Client</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-4">
              <Mail className="h-3 w-3" /> {client.email || "No email"}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-body mb-2">
                <FolderKanban className="h-3 w-3" /> {client.projects.length} Project{client.projects.length !== 1 ? "s" : ""}
              </div>
              {client.projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="block p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <p className="text-xs font-body font-medium text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground font-body capitalize">{p.status.replace("_", " ")}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useCreateProject } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Web Design",
  "App Development",
  "Branding",
  "Marketing",
  "SEO",
  "Graphics Design",
  "Video Editing",
  "Content Writing",
  "Other",
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-muted text-muted-foreground" },
  { value: "medium", label: "Medium", color: "bg-primary/20 text-primary" },
  { value: "high", label: "High", color: "bg-destructive/20 text-destructive" },
  { value: "urgent", label: "Urgent", color: "bg-destructive text-destructive-foreground" },
];

const STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

const CURRENCIES = ["BDT", "USD", "EUR", "GBP", "INR"];

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("not_started");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [clientId, setClientId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const createProject = useCreateProject();
  const { data: teamMembers } = useTeamMembers();
  const { data: clients } = useClients();

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setPriority("medium");
    setStatus("not_started");
    setBudget("");
    setCurrency("BDT");
    setStartDate("");
    setDeadline("");
    setClientId("");
    setSelectedTeam([]);
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createProject.mutateAsync({
        name,
        description,
        category: category || undefined,
        priority,
        status: status as any,
        budget: budget ? parseFloat(budget) : undefined,
        currency,
        start_date: startDate || undefined,
        deadline: deadline || undefined,
        client_id: clientId || undefined,
        team_member_ids: selectedTeam,
        notes: notes || undefined,
      });
      toast({ title: "Project created", description: `"${name}" has been created.` });
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleTeamMember = (id: string) => {
    setSelectedTeam((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedTeamNames = teamMembers?.filter((m) => selectedTeam.includes(m.id)) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-heading">Create Project</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4 pb-2">
            {/* Project Name */}
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website Redesign" required />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief project description..." rows={2} />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label>Initial Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div>
              <Label>Budget</Label>
              <div className="flex gap-2">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start">Start Date</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
            </div>

            {/* Client */}
            <div>
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || c.email || "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Members */}
            <div>
              <Label>Team Members</Label>
              {selectedTeamNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                  {selectedTeamNames.map((m) => (
                    <Badge key={m.id} variant="secondary" className="gap-1 text-xs">
                      {m.full_name || m.email || "Unnamed"}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTeamMember(m.id)} />
                    </Badge>
                  ))}
                </div>
              )}
              <div className="space-y-2 max-h-32 overflow-y-auto rounded-lg border p-2">
                {teamMembers?.length === 0 && (
                  <p className="text-xs text-muted-foreground font-body">No team members found</p>
                )}
                {teamMembers?.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 cursor-pointer text-sm font-body">
                    <Checkbox
                      checked={selectedTeam.includes(m.id)}
                      onCheckedChange={() => toggleTeamMember(m.id)}
                    />
                    {m.full_name || m.email || "Unnamed"}
                  </label>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes for the team (not visible to client)..."
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  tasksCompleted: number;
  tasksInProgress: number;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  avatar: string;
  email: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee: TeamMember;
  dueDate: string;
  projectId: string;
};

export type Project = {
  id: string;
  name: string;
  client: Client;
  status: "active" | "completed" | "on-hold";
  progress: number;
  tasks: Task[];
  teamMembers: TeamMember[];
  deadline: string;
  description: string;
};

export const teamMembers: TeamMember[] = [
  { id: "1", name: "Alex Rivera", role: "Lead Designer", avatar: "AR", email: "alex@webogrowth.com", tasksCompleted: 24, tasksInProgress: 3 },
  { id: "2", name: "Sarah Chen", role: "Frontend Developer", avatar: "SC", email: "sarah@webogrowth.com", tasksCompleted: 31, tasksInProgress: 5 },
  { id: "3", name: "Marcus Johnson", role: "Backend Developer", avatar: "MJ", email: "marcus@webogrowth.com", tasksCompleted: 18, tasksInProgress: 2 },
  { id: "4", name: "Priya Patel", role: "Project Manager", avatar: "PP", email: "priya@webogrowth.com", tasksCompleted: 42, tasksInProgress: 4 },
  { id: "5", name: "David Kim", role: "UI/UX Designer", avatar: "DK", email: "david@webogrowth.com", tasksCompleted: 15, tasksInProgress: 6 },
  { id: "6", name: "Emma Wilson", role: "SEO Specialist", avatar: "EW", email: "emma@webogrowth.com", tasksCompleted: 28, tasksInProgress: 1 },
];

export const clients: Client[] = [
  { id: "c1", name: "John Mitchell", company: "TechVentures Inc.", avatar: "JM", email: "john@techventures.com" },
  { id: "c2", name: "Lisa Park", company: "GreenLeaf Co.", avatar: "LP", email: "lisa@greenleaf.co" },
  { id: "c3", name: "Robert Taylor", company: "FinanceHub", avatar: "RT", email: "robert@financehub.com" },
  { id: "c4", name: "Maria Garcia", company: "StyleBrand", avatar: "MG", email: "maria@stylebrand.com" },
];

export const tasks: Task[] = [
  { id: "t1", title: "Homepage wireframe design", description: "Create wireframes for the new homepage layout", status: "done", priority: "high", assignee: teamMembers[0], dueDate: "2026-03-10", projectId: "p1" },
  { id: "t2", title: "Implement responsive nav", description: "Build the responsive navigation component", status: "in-progress", priority: "high", assignee: teamMembers[1], dueDate: "2026-03-12", projectId: "p1" },
  { id: "t3", title: "Set up API endpoints", description: "Create REST API for user management", status: "in-progress", priority: "medium", assignee: teamMembers[2], dueDate: "2026-03-15", projectId: "p1" },
  { id: "t4", title: "SEO audit report", description: "Conduct full SEO audit", status: "todo", priority: "medium", assignee: teamMembers[5], dueDate: "2026-03-18", projectId: "p2" },
  { id: "t5", title: "Brand identity mockups", description: "Design 3 brand identity options", status: "review", priority: "high", assignee: teamMembers[4], dueDate: "2026-03-11", projectId: "p3" },
  { id: "t6", title: "Payment integration", description: "Integrate Stripe payment gateway", status: "todo", priority: "high", assignee: teamMembers[2], dueDate: "2026-03-20", projectId: "p2" },
  { id: "t7", title: "User testing sessions", description: "Conduct 5 user testing sessions", status: "in-progress", priority: "medium", assignee: teamMembers[3], dueDate: "2026-03-14", projectId: "p1" },
  { id: "t8", title: "Content migration", description: "Migrate blog content to new CMS", status: "todo", priority: "low", assignee: teamMembers[1], dueDate: "2026-03-22", projectId: "p4" },
  { id: "t9", title: "Landing page design", description: "Design product landing page", status: "in-progress", priority: "high", assignee: teamMembers[0], dueDate: "2026-03-13", projectId: "p3" },
  { id: "t10", title: "Database optimization", description: "Optimize database queries", status: "review", priority: "medium", assignee: teamMembers[2], dueDate: "2026-03-16", projectId: "p2" },
];

export const projects: Project[] = [
  {
    id: "p1", name: "TechVentures Website Redesign", client: clients[0], status: "active", progress: 65,
    tasks: tasks.filter(t => t.projectId === "p1"),
    teamMembers: [teamMembers[0], teamMembers[1], teamMembers[2], teamMembers[3]],
    deadline: "2026-04-15", description: "Complete website redesign with modern UI/UX, improved performance, and new features.",
  },
  {
    id: "p2", name: "GreenLeaf E-Commerce Platform", client: clients[1], status: "active", progress: 35,
    tasks: tasks.filter(t => t.projectId === "p2"),
    teamMembers: [teamMembers[2], teamMembers[5], teamMembers[3]],
    deadline: "2026-05-01", description: "Build a full e-commerce platform with payment integration and inventory management.",
  },
  {
    id: "p3", name: "StyleBrand Identity & Landing", client: clients[3], status: "active", progress: 50,
    tasks: tasks.filter(t => t.projectId === "p3"),
    teamMembers: [teamMembers[0], teamMembers[4]],
    deadline: "2026-03-30", description: "Brand identity design and product landing page creation.",
  },
  {
    id: "p4", name: "FinanceHub Blog Migration", client: clients[2], status: "on-hold", progress: 10,
    tasks: tasks.filter(t => t.projectId === "p4"),
    teamMembers: [teamMembers[1]],
    deadline: "2026-06-01", description: "Migrate existing blog to new CMS with improved SEO.",
  },
];

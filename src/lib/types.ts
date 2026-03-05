export type Assignee = 'Wolve' | 'Trinkster' | 'Both';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: Assignee;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  assignee: Assignee;
  type: 'meeting' | 'deadline' | 'review' | 'launch' | 'other';
}

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed';

export interface ProjectKPI {
  label: string;
  value: string;
  target: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  kpis: ProjectKPI[];
}

export interface MemoryEntry {
  id: string;
  date: string;
  content: string;
  category: 'decision' | 'insight' | 'milestone' | 'note';
}

export interface Doc {
  id: string;
  title: string;
  project: string;
  content: string;
  updatedAt: string;
  tags: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  currentTask: string;
  avatar: string;
}

export interface FinanceEntry {
  id: string;
  project: string;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export type LeadStage = 'discovery' | 'outreach' | 'call' | 'proposal' | 'closed';

export interface Lead {
  id: string;
  company: string;
  contact: string;
  value: number;
  stage: LeadStage;
  notes: string;
  lastContact: string;
}

export interface AnalyticsData {
  xFollowers: { date: string; count: number }[];
  contentPerformance: { title: string; impressions: number; engagement: number; clicks: number }[];
  conversionRates: { source: string; visitors: number; leads: number; rate: number }[];
}

export interface DailyReport {
  id: string;
  date: string;
  completedItems: string[];
  metrics: { label: string; value: string }[];
  inProgress: string[];
  focus: string[];
  blockers: string[];
}

export interface ContentPost {
  id: string;
  title: string;
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published';
  platform: 'x' | 'linkedin' | 'both';
  impressions?: number;
  engagement?: number;
}

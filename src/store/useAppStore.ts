import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format } from "date-fns";

export type Priority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "inbox" | "today" | "done";
export type DelegationStatus = "delegated" | "in-progress" | "waiting" | "done";
export type LifeArea = "work" | "relationships" | "health" | "finance" | "growth";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  area: LifeArea;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  timeEstimate?: number; // minutes
}

export interface TimeBlock {
  id: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0-23
  durationHours: number; // 1-3
  title: string;
  area: LifeArea;
  color: string;
  taskId?: string;
  isCompleted: boolean;
}

export interface DelegationItem {
  id: string;
  title: string;
  delegatedTo: string;
  status: DelegationStatus;
  dueDate: string;
  area: LifeArea;
  notes?: string;
  createdAt: string;
}

export interface DailyCheckin {
  date: string;
  scores: Record<LifeArea, number>; // 1-10
  wins: string[];
  blockers: string[];
}

export interface AppState {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  delegations: DelegationItem[];
  checkins: DailyCheckin[];

  // Task actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;

  // Time block actions
  addTimeBlock: (block: Omit<TimeBlock, "id">) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  toggleTimeBlock: (id: string) => void;

  // Delegation actions
  addDelegation: (item: Omit<DelegationItem, "id" | "createdAt">) => void;
  updateDelegation: (id: string, updates: Partial<DelegationItem>) => void;
  deleteDelegation: (id: string) => void;

  // Checkin actions
  saveCheckin: (checkin: DailyCheckin) => void;
  getTodayCheckin: () => DailyCheckin | undefined;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => format(new Date(), "yyyy-MM-dd");

const SEED_TASKS: Task[] = [
  { id: uid(), title: "Review Q2 growth strategy", priority: "critical", status: "today", area: "work", createdAt: today(), timeEstimate: 60 },
  { id: uid(), title: "Plan date night with partner", priority: "high", status: "today", area: "relationships", createdAt: today(), timeEstimate: 30 },
  { id: uid(), title: "30-min strength training", priority: "high", status: "inbox", area: "health", createdAt: today(), timeEstimate: 30 },
  { id: uid(), title: "Review monthly P&L", priority: "medium", status: "inbox", area: "finance", createdAt: today(), timeEstimate: 45 },
  { id: uid(), title: "Read 20 pages of Deep Work", priority: "medium", status: "inbox", area: "growth", createdAt: today(), timeEstimate: 30 },
  { id: uid(), title: "Ship landing page v2", priority: "high", status: "today", area: "work", createdAt: today(), timeEstimate: 90 },
  { id: uid(), title: "Call Mom", priority: "high", status: "inbox", area: "relationships", createdAt: today(), timeEstimate: 20 },
];

const SEED_BLOCKS: TimeBlock[] = [
  { id: uid(), date: today(), startHour: 6, durationHours: 1, title: "Morning workout", area: "health", color: "#10b981", isCompleted: false },
  { id: uid(), date: today(), startHour: 8, durationHours: 2, title: "Deep work: Growth strategy", area: "work", color: "#7c3aed", isCompleted: false },
  { id: uid(), date: today(), startHour: 10, durationHours: 1, title: "Team sync", area: "work", color: "#3b82f6", isCompleted: false },
  { id: uid(), date: today(), startHour: 14, durationHours: 2, title: "Ship landing page", area: "work", color: "#7c3aed", isCompleted: false },
  { id: uid(), date: today(), startHour: 19, durationHours: 1, title: "Family time", area: "relationships", color: "#ec4899", isCompleted: false },
  { id: uid(), date: today(), startHour: 21, durationHours: 1, title: "Reading + journaling", area: "growth", color: "#f59e0b", isCompleted: false },
];

const SEED_DELEGATIONS: DelegationItem[] = [
  { id: uid(), title: "Design new onboarding screens", delegatedTo: "Sarah (Designer)", status: "in-progress", dueDate: "2026-05-10", area: "work", createdAt: today() },
  { id: uid(), title: "Fix auth bug in production", delegatedTo: "Dev team", status: "delegated", dueDate: "2026-05-08", area: "work", createdAt: today() },
  { id: uid(), title: "Book dinner reservation", delegatedTo: "Assistant", status: "waiting", dueDate: "2026-05-09", area: "relationships", createdAt: today() },
];

const SEED_CHECKIN: DailyCheckin = {
  date: today(),
  scores: { work: 8, relationships: 7, health: 6, finance: 7, growth: 8 },
  wins: ["Shipped feature", "Had great conversation"],
  blockers: ["Need to follow up on investor email"],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,
      timeBlocks: SEED_BLOCKS,
      delegations: SEED_DELEGATIONS,
      checkins: [SEED_CHECKIN],

      addTask: (task) =>
        set((s) => ({ tasks: [{ ...task, id: uid(), createdAt: today() }, ...s.tasks] })),
      updateTask: (id, updates) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      completeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: "done", completedAt: today() } : t
          ),
        })),

      addTimeBlock: (block) =>
        set((s) => ({ timeBlocks: [...s.timeBlocks, { ...block, id: uid() }] })),
      updateTimeBlock: (id, updates) =>
        set((s) => ({ timeBlocks: s.timeBlocks.map((b) => (b.id === id ? { ...b, ...updates } : b)) })),
      deleteTimeBlock: (id) =>
        set((s) => ({ timeBlocks: s.timeBlocks.filter((b) => b.id !== id) })),
      toggleTimeBlock: (id) =>
        set((s) => ({
          timeBlocks: s.timeBlocks.map((b) =>
            b.id === id ? { ...b, isCompleted: !b.isCompleted } : b
          ),
        })),

      addDelegation: (item) =>
        set((s) => ({ delegations: [{ ...item, id: uid(), createdAt: today() }, ...s.delegations] })),
      updateDelegation: (id, updates) =>
        set((s) => ({ delegations: s.delegations.map((d) => (d.id === id ? { ...d, ...updates } : d)) })),
      deleteDelegation: (id) =>
        set((s) => ({ delegations: s.delegations.filter((d) => d.id !== id) })),

      saveCheckin: (checkin) =>
        set((s) => ({
          checkins: [checkin, ...s.checkins.filter((c) => c.date !== checkin.date)],
        })),
      getTodayCheckin: () => get().checkins.find((c) => c.date === today()),
    }),
    { name: "apex-os-store" }
  )
);

export const AREA_CONFIG: Record<LifeArea, { label: string; color: string; icon: string }> = {
  work:          { label: "Work",          color: "#7c3aed", icon: "⚡" },
  relationships: { label: "Relationships", color: "#ff375f", icon: "❤️" },
  health:        { label: "Health",        color: "#30d158", icon: "💪" },
  finance:       { label: "Finance",       color: "#ffd60a", icon: "💰" },
  growth:        { label: "Growth",        color: "#0a84ff", icon: "🚀" },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  critical: { label: "Critical", color: "#ff453a" },
  high:     { label: "High",     color: "#ff9f0a" },
  medium:   { label: "Medium",   color: "#ffd60a" },
  low:      { label: "Low",      color: "rgba(255,255,255,0.3)" },
};

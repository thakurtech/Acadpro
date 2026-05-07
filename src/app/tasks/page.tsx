"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, AREA_CONFIG, PRIORITY_CONFIG, type Priority, type LifeArea, type TaskStatus } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Plus, Zap, CheckCircle2, Inbox, Clock, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

type Filter = "all" | TaskStatus;

const FILTERS: { id: Filter; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: Zap },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "today", label: "Today", icon: Clock },
  { id: "done", label: "Done", icon: CheckCircle2 },
];

type NewTask = { title: string; priority: Priority; area: LifeArea; status: TaskStatus; notes: string };
const EMPTY_TASK: NewTask = { title: "", priority: "high", area: "work", status: "today", notes: "" };

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useAppStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [areaFilter, setAreaFilter] = useState<LifeArea | "all">("all");
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>(EMPTY_TASK);
  const [quickInput, setQuickInput] = useState("");

  const filtered = tasks.filter((t) => {
    const statusMatch = filter === "all" || t.status === filter;
    const areaMatch = areaFilter === "all" || t.area === areaFilter;
    return statusMatch && areaMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sOrder = { today: 0, inbox: 1, done: 2 };
    if (a.status !== b.status) return sOrder[a.status] - sOrder[b.status];
    return pOrder[a.priority] - pOrder[b.priority];
  });

  const handleQuickAdd = () => {
    const title = quickInput.trim();
    if (!title) return;
    addTask({ title, priority: "high", area: "work", status: "today" });
    setQuickInput("");
    toast.success("Task captured!");
  };

  const handleAdd = () => {
    if (!newTask.title.trim()) { toast.error("Add a title!"); return; }
    addTask(newTask);
    setAdding(false);
    setNewTask(EMPTY_TASK);
    toast.success("Task added!");
  };

  const counts = {
    all: tasks.length,
    inbox: tasks.filter((t) => t.status === "inbox").length,
    today: tasks.filter((t) => t.status === "today").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Tasks</h1>
          <p className="text-ink-muted text-sm mt-0.5">Capture fast, execute faster</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dim rounded-xl text-white text-sm font-medium transition-colors shadow-glow-sm"
        >
          <Plus size={15} />
          New Task
        </button>
      </div>

      {/* Quick Capture */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="glass rounded-xl flex items-center gap-3 px-4 py-3 border-glow">
          <Zap size={16} className="text-accent-glow shrink-0" />
          <input
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
            placeholder="Quick capture — type and hit Enter…"
            className="flex-1 bg-transparent text-sm text-ink-primary placeholder:text-ink-muted outline-none"
          />
          {quickInput && (
            <button
              onClick={handleQuickAdd}
              className="text-xs text-accent-glow hover:text-accent transition-colors shrink-0 font-medium"
            >
              Add →
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters row */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-1 glass rounded-xl p-1">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter === id ? "bg-accent text-white" : "text-ink-muted hover:text-ink-secondary hover:bg-bg-hover"
              )}
            >
              <Icon size={12} />
              {label}
              <span className={cn(
                "text-[10px] px-1 rounded font-mono",
                filter === id ? "text-white/70" : "text-ink-muted"
              )}>
                {counts[id]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setAreaFilter("all")}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-xs transition-all",
              areaFilter === "all" ? "bg-bg-hover text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
            )}
          >
            All areas
          </button>
          {(Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setAreaFilter(areaFilter === key ? "all" : key)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs transition-all",
                areaFilter === key ? "text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
              )}
              style={areaFilter === key ? { background: `${cfg.color}20`, color: cfg.color } : {}}
            >
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence>
          {sorted.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "glass rounded-xl p-4 flex items-center gap-4 group transition-all",
                task.status === "done" ? "opacity-50" : "hover:border-bg-hover"
              )}
            >
              {/* Priority dot */}
              <button
                onClick={() => task.status !== "done" && completeTask(task.id)}
                className="shrink-0 transition-transform hover:scale-110"
              >
                {task.status === "done" ? (
                  <CheckCircle2 size={18} className="text-electric-green" />
                ) : (
                  <div
                    className="w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: PRIORITY_CONFIG[task.priority].color }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: PRIORITY_CONFIG[task.priority].color }}
                    />
                  </div>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  task.status === "done" ? "line-through text-ink-muted" : "text-ink-primary"
                )}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: `${PRIORITY_CONFIG[task.priority].color}15`,
                      color: PRIORITY_CONFIG[task.priority].color,
                    }}
                  >
                    {PRIORITY_CONFIG[task.priority].label}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: `${AREA_CONFIG[task.area].color}15`,
                      color: AREA_CONFIG[task.area].color,
                    }}
                  >
                    {AREA_CONFIG[task.area].icon} {AREA_CONFIG[task.area].label}
                  </span>
                  {task.timeEstimate && (
                    <span className="text-[10px] text-ink-muted">~{task.timeEstimate}min</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {task.status === "inbox" && (
                  <button
                    onClick={() => { updateTask(task.id, { status: "today" }); toast.success("Moved to Today!"); }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-accent/15 text-accent-glow hover:bg-accent/25 transition-colors"
                  >
                    → Today
                  </button>
                )}
                <button
                  onClick={() => { deleteTask(task.id); toast.success("Task deleted"); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-ink-muted hover:text-electric-red transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sorted.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-bg-card flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-ink-muted" />
            </div>
            <p className="text-ink-secondary font-medium">All clear!</p>
            <p className="text-ink-muted text-sm mt-1">No tasks in this view.</p>
          </motion.div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {adding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setAdding(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="glass rounded-2xl p-6 border-glow">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-ink-primary">New Task</h3>
                  <button onClick={() => setAdding(false)} className="p-1.5 rounded-lg hover:bg-bg-hover text-ink-muted">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    autoFocus
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="What needs to get done?"
                    className="w-full bg-bg-card border border-bg-border rounded-xl px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-ink-muted mb-1.5 block">Priority</label>
                      <div className="space-y-1">
                        {(Object.entries(PRIORITY_CONFIG) as [Priority, (typeof PRIORITY_CONFIG)[Priority]][]).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => setNewTask({ ...newTask, priority: key })}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                              newTask.priority === key
                                ? "text-ink-primary"
                                : "text-ink-muted hover:text-ink-secondary hover:bg-bg-hover"
                            )}
                            style={newTask.priority === key ? { background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` } : {}}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted mb-1.5 block">Status</label>
                      <div className="space-y-1 mb-3">
                        {(["today", "inbox"] as TaskStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => setNewTask({ ...newTask, status: s })}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                              newTask.status === s
                                ? "bg-accent/15 text-accent-glow border border-accent/30"
                                : "text-ink-muted hover:text-ink-secondary hover:bg-bg-hover"
                            )}
                          >
                            {s === "today" ? <Clock size={11} /> : <Inbox size={11} />}
                            {s === "today" ? "Today" : "Inbox"}
                          </button>
                        ))}
                      </div>
                      <label className="text-xs text-ink-muted mb-1.5 block">Area</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][]).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => setNewTask({ ...newTask, area: key })}
                            className={cn(
                              "flex items-center justify-center p-1.5 rounded-lg text-xs transition-all",
                              newTask.area === key ? "text-ink-primary" : "text-ink-muted hover:bg-bg-hover"
                            )}
                            style={newTask.area === key ? { background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` } : {}}
                            title={cfg.label}
                          >
                            {cfg.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAdd}
                    className="w-full bg-accent hover:bg-accent-dim text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-glow-sm"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

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
type NewTask = { title: string; priority: Priority; area: LifeArea; status: TaskStatus };
const EMPTY: NewTask = { title: "", priority: "high", area: "work", status: "today" };

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useAppStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [areaFilter, setAreaFilter] = useState<LifeArea | "all">("all");
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>(EMPTY);
  const [quickInput, setQuickInput] = useState("");

  const filtered = tasks.filter((t) => {
    const sm = filter === "all" || t.status === filter;
    const am = areaFilter === "all" || t.area === areaFilter;
    return sm && am;
  });
  const sorted = [...filtered].sort((a, b) => {
    const po = { critical: 0, high: 1, medium: 2, low: 3 };
    const so = { today: 0, inbox: 1, done: 2 };
    if (a.status !== b.status) return so[a.status] - so[b.status];
    return po[a.priority] - po[b.priority];
  });

  const handleQuickAdd = () => {
    const title = quickInput.trim();
    if (!title) return;
    addTask({ title, priority: "high", area: "work", status: "today" });
    setQuickInput("");
    toast.success("Task captured! ⚡");
  };

  const handleAdd = () => {
    if (!newTask.title.trim()) { toast.error("Add a title!"); return; }
    addTask(newTask);
    setAdding(false); setNewTask(EMPTY);
    toast.success("Task added!");
  };

  const counts = {
    all: tasks.length,
    inbox: tasks.filter((t) => t.status === "inbox").length,
    today: tasks.filter((t) => t.status === "today").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="px-4 py-5 md:px-8 md:py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-ink-primary">Tasks</h1>
          <p className="text-xs text-ink-muted mt-0.5">Capture fast, execute faster</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="w-10 h-10 md:w-auto md:px-4 bg-accent hover:bg-accent-dim rounded-xl text-white flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          style={{ boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}
        >
          <Plus size={16} />
          <span className="hidden md:inline">New Task</span>
        </button>
      </div>

      {/* Quick capture */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <Zap size={16} className="text-accent-glow shrink-0" />
        <input value={quickInput} onChange={(e) => setQuickInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          placeholder="Quick capture — hit Enter…"
          className="flex-1 bg-transparent text-sm text-ink-primary placeholder:text-ink-muted outline-none"
        />
        {quickInput && (
          <button onClick={handleQuickAdd} className="text-xs text-accent-glow font-bold shrink-0">Add →</button>
        )}
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1 p-1 rounded-2xl mb-3" style={{ background: "rgba(15,15,26,0.85)", border: "1px solid #1e1e3a" }}>
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setFilter(id)}
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all")}
            style={filter === id ? { background: "#7c3aed", color: "white" } : { color: "#475569" }}
          >
            <Icon size={12} />
            <span className="hidden sm:inline">{label}</span>
            <span className={cn("text-[10px] font-mono", filter === id ? "text-white/70" : "text-ink-muted")}>{counts[id]}</span>
          </button>
        ))}
      </div>

      {/* Area filter — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
        <button onClick={() => setAreaFilter("all")}
          className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0",
            areaFilter === "all" ? "bg-bg-hover text-ink-primary" : "text-ink-muted"
          )}>
          All
        </button>
        {(Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][]).map(([key, cfg]) => (
          <button key={key} onClick={() => setAreaFilter(areaFilter === key ? "all" : key)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0"
            style={areaFilter === key
              ? { background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }
              : { color: "#475569" }
            }
          >
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sorted.map((task, i) => (
            <motion.div key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.025 }}
              className={cn("rounded-2xl p-4 flex items-center gap-3.5 group transition-all",
                task.status === "done" ? "opacity-40" : ""
              )}
              style={{ background: "rgba(15,15,26,0.85)", border: "1px solid #1e1e3a" }}
            >
              <button onClick={() => task.status !== "done" && completeTask(task.id)} className="shrink-0 transition-transform active:scale-95">
                {task.status === "done"
                  ? <CheckCircle2 size={20} className="text-electric-green" />
                  : <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: PRIORITY_CONFIG[task.priority].color }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: PRIORITY_CONFIG[task.priority].color }} />
                    </div>
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold truncate",
                  task.status === "done" ? "line-through text-ink-muted" : "text-ink-primary"
                )}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold"
                    style={{ background: `${PRIORITY_CONFIG[task.priority].color}15`, color: PRIORITY_CONFIG[task.priority].color }}>
                    {PRIORITY_CONFIG[task.priority].label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold"
                    style={{ background: `${AREA_CONFIG[task.area].color}15`, color: AREA_CONFIG[task.area].color }}>
                    {AREA_CONFIG[task.area].icon} {AREA_CONFIG[task.area].label}
                  </span>
                  {task.timeEstimate && <span className="text-[10px] text-ink-muted">~{task.timeEstimate}m</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {task.status === "inbox" && (
                  <button onClick={() => { updateTask(task.id, { status: "today" }); toast.success("Moved to Today!"); }}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors"
                    style={{ background: "rgba(124,58,237,0.12)", color: "#a855f7" }}>
                    Today
                  </button>
                )}
                <button onClick={() => { deleteTask(task.id); toast.success("Deleted"); }}
                  className="p-2 rounded-xl hover:bg-red-500/10 text-ink-muted hover:text-electric-red transition-colors opacity-0 group-hover:opacity-100 md:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sorted.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <CheckCircle2 size={28} className="text-accent-glow" />
            </div>
            <p className="text-ink-secondary font-semibold">All clear!</p>
            <p className="text-ink-muted text-sm mt-1">Nothing in this view.</p>
          </motion.div>
        )}
      </div>

      {/* Add Modal — slides up from bottom on mobile */}
      <AnimatePresence>
        {adding && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50" onClick={() => setAdding(false)} />
            <motion.div
              initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 38 }}
              className="fixed bottom-0 md:top-1/2 md:bottom-auto left-0 md:left-1/2 right-0 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
            >
              <div className="glass rounded-t-3xl md:rounded-2xl p-6 border-glow">
                <div className="w-10 h-1 bg-bg-border rounded-full mx-auto mb-5 md:hidden" />
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-ink-primary">New Task</h3>
                  <button onClick={() => setAdding(false)} className="p-2 rounded-xl hover:bg-bg-hover text-ink-muted"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <input autoFocus value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="What needs to get done?"
                    className="w-full rounded-xl px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e3a" }}
                  />
                  <div>
                    <label className="text-[11px] text-ink-muted mb-2 block font-semibold uppercase tracking-wider">Priority</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.entries(PRIORITY_CONFIG) as [Priority, (typeof PRIORITY_CONFIG)[Priority]][]).map(([key, cfg]) => (
                        <button key={key} onClick={() => setNewTask({ ...newTask, priority: key })}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                          style={newTask.priority === key
                            ? { background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }
                            : { border: "1px solid #1e1e3a", color: "#475569" }
                          }
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-ink-muted mb-2 block font-semibold uppercase tracking-wider">Status</label>
                      <div className="space-y-2">
                        {(["today", "inbox"] as TaskStatus[]).map((s) => (
                          <button key={s} onClick={() => setNewTask({ ...newTask, status: s })}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
                            style={newTask.status === s
                              ? { background: "rgba(124,58,237,0.12)", color: "#a855f7", border: "1px solid rgba(124,58,237,0.3)" }
                              : { border: "1px solid #1e1e3a", color: "#475569" }
                            }
                          >
                            {s === "today" ? <Clock size={12} /> : <Inbox size={12} />}
                            {s === "today" ? "Today" : "Inbox"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-ink-muted mb-2 block font-semibold uppercase tracking-wider">Area</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][]).map(([key, cfg]) => (
                          <button key={key} onClick={() => setNewTask({ ...newTask, area: key })}
                            className="flex items-center justify-center p-2.5 rounded-xl text-sm transition-all"
                            style={newTask.area === key
                              ? { background: `${cfg.color}18`, border: `1px solid ${cfg.color}40` }
                              : { border: "1px solid #1e1e3a", color: "#475569" }
                            }
                            title={cfg.label}
                          >{cfg.icon}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={handleAdd}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
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

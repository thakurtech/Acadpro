"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAppStore, AREA_CONFIG, type DelegationStatus, type LifeArea, type DelegationItem } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Plus, X, AlertCircle, Clock, CheckCircle2, ArrowRight, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG: Record<DelegationStatus, { label: string; color: string; icon: React.ElementType }> = {
  delegated: { label: "Delegated", color: "#3b82f6", icon: ArrowRight },
  "in-progress": { label: "In Progress", color: "#f59e0b", icon: RefreshCw },
  waiting: { label: "Waiting", color: "#f97316", icon: Clock },
  done: { label: "Done", color: "#10b981", icon: CheckCircle2 },
};
const COLUMNS: DelegationStatus[] = ["delegated", "in-progress", "waiting", "done"];
type NewDel = { title: string; delegatedTo: string; status: DelegationStatus; dueDate: string; area: LifeArea };
const EMPTY: NewDel = { title: "", delegatedTo: "", status: "delegated", dueDate: format(new Date(), "yyyy-MM-dd"), area: "work" };

export default function DelegationPage() {
  const { delegations, addDelegation, updateDelegation, deleteDelegation } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [newDel, setNewDel] = useState<NewDel>(EMPTY);
  const [activeCol, setActiveCol] = useState<DelegationStatus>("delegated");

  const today = format(new Date(), "yyyy-MM-dd");
  const isOverdue = (d: string) => d < today;

  const handleAdd = () => {
    if (!newDel.title.trim()) { toast.error("Add a title!"); return; }
    if (!newDel.delegatedTo.trim()) { toast.error("Who are you delegating to?"); return; }
    addDelegation(newDel);
    setAdding(false); setNewDel(EMPTY);
    toast.success("Delegation tracked!");
  };

  return (
    <div className="px-4 py-5 md:px-8 md:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-ink-primary">Delegation</h1>
          <p className="text-xs text-ink-muted mt-0.5">Hand off, follow up, win</p>
        </div>
        <button onClick={() => { setAdding(true); setNewDel(EMPTY); }}
          className="w-10 h-10 md:w-auto md:px-4 bg-accent hover:bg-accent-dim rounded-xl text-white flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          style={{ boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}
        >
          <Plus size={16} />
          <span className="hidden md:inline">Delegate</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {COLUMNS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const count = delegations.filter((d) => d.status === status).length;
          return (
            <div key={status} className="rounded-2xl p-3 text-center"
              style={{ background: "rgba(15,15,26,0.85)", border: `1px solid ${cfg.color}18` }}>
              <p className="text-xl font-black" style={{ color: cfg.color }}>{count}</p>
              <p className="text-[9px] text-ink-muted font-semibold mt-0.5 leading-tight">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Mobile tab switcher */}
      <div className="flex md:hidden gap-1 mb-4 p-1 rounded-2xl" style={{ background: "rgba(15,15,26,0.85)", border: "1px solid #1e1e3a" }}>
        {COLUMNS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <button key={status} onClick={() => setActiveCol(status)}
              className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
              style={activeCol === status
                ? { background: `${cfg.color}20`, color: cfg.color }
                : { color: "#475569" }
              }
            >
              {cfg.label.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {/* Desktop: 4-col kanban | Mobile: single column */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {COLUMNS.map((status) => <KanbanColumn key={status} status={status} delegations={delegations.filter((d) => d.status === status)} today={today} isOverdue={isOverdue} updateDelegation={updateDelegation} deleteDelegation={deleteDelegation} />)}
      </div>
      <div className="md:hidden">
        <KanbanColumn status={activeCol} delegations={delegations.filter((d) => d.status === activeCol)} today={today} isOverdue={isOverdue} updateDelegation={updateDelegation} deleteDelegation={deleteDelegation} />
      </div>

      {/* Add Modal */}
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
                  <h3 className="font-bold text-ink-primary">Delegate a Task</h3>
                  <button onClick={() => setAdding(false)} className="p-2 rounded-xl hover:bg-bg-hover text-ink-muted"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <input autoFocus value={newDel.title} onChange={(e) => setNewDel({ ...newDel, title: e.target.value })}
                    placeholder="What needs to be done?"
                    className="w-full rounded-xl px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e3a" }}
                  />
                  <input value={newDel.delegatedTo} onChange={(e) => setNewDel({ ...newDel, delegatedTo: e.target.value })}
                    placeholder="Delegated to…"
                    className="w-full rounded-xl px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e3a" }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-ink-muted mb-1.5 block font-semibold">Due date</label>
                      <input type="date" value={newDel.dueDate} onChange={(e) => setNewDel({ ...newDel, dueDate: e.target.value })}
                        className="w-full rounded-xl px-3 py-2.5 text-sm text-ink-primary outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e3a" }}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-ink-muted mb-1.5 block font-semibold">Area</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][]).map(([key, cfg]) => (
                          <button key={key} onClick={() => setNewDel({ ...newDel, area: key })}
                            className="flex items-center justify-center p-2.5 rounded-xl text-sm transition-all"
                            style={newDel.area === key
                              ? { background: `${cfg.color}18`, border: `1px solid ${cfg.color}40` }
                              : { border: "1px solid #1e1e3a", color: "#475569" }
                            }
                          >{cfg.icon}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={handleAdd}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
                  >
                    Track Delegation
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

function KanbanColumn({ status, delegations, today, isOverdue, updateDelegation, deleteDelegation }: {
  status: DelegationStatus;
  delegations: DelegationItem[];
  today: string;
  isOverdue: (d: string) => boolean;
  updateDelegation: (id: string, updates: Partial<DelegationItem>) => void;
  deleteDelegation: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div>
      <div className="hidden md:flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
        <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</h3>
        <span className="text-[10px] text-ink-muted ml-auto font-mono">{delegations.length}</span>
      </div>
      <div className="space-y-3">
        <AnimatePresence>
          {delegations.map((item) => (
            <motion.div key={item.id} layout
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl p-4 group"
              style={{ background: "rgba(15,15,26,0.85)", border: `1px solid ${cfg.color}15` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className={cn("text-sm font-semibold leading-snug", status === "done" ? "line-through text-ink-muted" : "text-ink-primary")}>
                  {item.title}
                </p>
                <button onClick={() => { deleteDelegation(item.id); toast.success("Removed"); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-ink-muted hover:text-electric-red transition-all shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-ink-secondary"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  {item.delegatedTo.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-ink-muted truncate">{item.delegatedTo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold"
                  style={{ background: `${AREA_CONFIG[item.area].color}12`, color: AREA_CONFIG[item.area].color }}>
                  {AREA_CONFIG[item.area].icon} {AREA_CONFIG[item.area].label}
                </span>
                <div className="flex items-center gap-1">
                  {isOverdue(item.dueDate) && status !== "done" && <AlertCircle size={11} className="text-electric-red" />}
                  <span className={cn("text-[10px] font-mono font-semibold",
                    isOverdue(item.dueDate) && status !== "done" ? "text-electric-red" : "text-ink-muted"
                  )}>
                    {format(new Date(item.dueDate), "MMM d")}
                  </span>
                </div>
              </div>
              {status !== "done" && (
                <div className="mt-3 pt-3 border-t border-bg-border grid grid-cols-3 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(["delegated","in-progress","waiting","done"] as DelegationStatus[]).filter((s) => s !== status).slice(0,3).map((s) => (
                    <button key={s} onClick={() => { updateDelegation(item.id, { status: s }); toast.success(`→ ${STATUS_CONFIG[s].label}`); }}
                      className="py-1.5 rounded-lg text-[10px] font-bold transition-colors"
                      style={{ background: `${STATUS_CONFIG[s].color}10`, color: STATUS_CONFIG[s].color }}>
                      {STATUS_CONFIG[s].label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {delegations.length === 0 && (
          <div className="rounded-2xl p-6 text-center" style={{ border: "1px dashed #1e1e3a" }}>
            <p className="text-xs text-ink-muted">Nothing here</p>
          </div>
        )}
      </div>
    </div>
  );
}

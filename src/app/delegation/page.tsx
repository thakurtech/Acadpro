"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAppStore, AREA_CONFIG, type DelegationStatus, type LifeArea } from "@/store/useAppStore";
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

type NewDel = { title: string; delegatedTo: string; status: DelegationStatus; dueDate: string; area: LifeArea; notes: string };
const EMPTY: NewDel = {
  title: "",
  delegatedTo: "",
  status: "delegated",
  dueDate: format(new Date(), "yyyy-MM-dd"),
  area: "work",
  notes: "",
};

export default function DelegationPage() {
  const { delegations, addDelegation, updateDelegation, deleteDelegation } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [newDel, setNewDel] = useState<NewDel>(EMPTY);

  const today = format(new Date(), "yyyy-MM-dd");
  const isOverdue = (d: string) => d < today;

  const handleAdd = () => {
    if (!newDel.title.trim()) { toast.error("Add a title!"); return; }
    if (!newDel.delegatedTo.trim()) { toast.error("Who are you delegating to?"); return; }
    addDelegation(newDel);
    setAdding(false);
    setNewDel(EMPTY);
    toast.success("Delegation tracked!");
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Delegation Board</h1>
          <p className="text-ink-muted text-sm mt-0.5">Hand it off, follow up, get it done</p>
        </div>
        <button
          onClick={() => { setAdding(true); setNewDel(EMPTY); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dim rounded-xl text-white text-sm font-medium transition-colors shadow-glow-sm"
        >
          <Plus size={15} />
          Delegate
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {COLUMNS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const count = delegations.filter((d) => d.status === status).length;
          return (
            <div
              key={status}
              className="glass rounded-xl p-3 flex items-center gap-3"
              style={{ borderColor: `${cfg.color}20` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}15` }}>
                <cfg.icon size={14} style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-lg font-bold text-ink-primary tabular-nums">{count}</p>
                <p className="text-[10px] text-ink-muted">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const items = delegations.filter((d) => d.status === status);

          return (
            <div key={status}>
              <div
                className="flex items-center gap-2 mb-3 px-1"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: cfg.color }}
                />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                  {cfg.label}
                </h3>
                <span className="text-[10px] text-ink-muted ml-auto font-mono">{items.length}</span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass rounded-xl p-4 group"
                      style={{ borderColor: `${cfg.color}15` }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className={cn(
                          "text-sm font-medium leading-snug",
                          status === "done" ? "line-through text-ink-muted" : "text-ink-primary"
                        )}>
                          {item.title}
                        </p>
                        <button
                          onClick={() => { deleteDelegation(item.id); toast.success("Removed"); }}
                          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-ink-muted hover:text-electric-red transition-all shrink-0"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-5 h-5 rounded-full bg-bg-hover flex items-center justify-center text-[10px] font-bold text-ink-secondary">
                          {item.delegatedTo.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-ink-muted truncate">{item.delegatedTo}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: `${AREA_CONFIG[item.area].color}15`,
                            color: AREA_CONFIG[item.area].color,
                          }}
                        >
                          {AREA_CONFIG[item.area].icon}
                        </span>

                        <div className="flex items-center gap-1">
                          {isOverdue(item.dueDate) && status !== "done" && (
                            <AlertCircle size={11} className="text-electric-red" />
                          )}
                          <span className={cn(
                            "text-[10px] font-mono",
                            isOverdue(item.dueDate) && status !== "done" ? "text-electric-red" : "text-ink-muted"
                          )}>
                            {format(new Date(item.dueDate), "MMM d")}
                          </span>
                        </div>
                      </div>

                      {/* Status transition buttons */}
                      {status !== "done" && (
                        <div className="mt-3 pt-3 border-t border-bg-border flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {COLUMNS.filter((s) => s !== status).map((s) => (
                            <button
                              key={s}
                              onClick={() => { updateDelegation(item.id, { status: s }); toast.success(`Moved to ${STATUS_CONFIG[s].label}`); }}
                              className="flex-1 py-1 rounded-lg text-[10px] font-medium transition-colors"
                              style={{
                                background: `${STATUS_CONFIG[s].color}10`,
                                color: STATUS_CONFIG[s].color,
                              }}
                            >
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {items.length === 0 && (
                  <div
                    className="rounded-xl border border-dashed border-bg-border p-6 text-center"
                    style={{ borderColor: `${cfg.color}15` }}
                  >
                    <p className="text-xs text-ink-muted">Nothing here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
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
                  <h3 className="font-semibold text-ink-primary">Delegate a Task</h3>
                  <button onClick={() => setAdding(false)} className="p-1.5 rounded-lg hover:bg-bg-hover text-ink-muted">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-ink-muted mb-1.5 block">What needs to be done?</label>
                    <input
                      autoFocus
                      value={newDel.title}
                      onChange={(e) => setNewDel({ ...newDel, title: e.target.value })}
                      placeholder="Task description"
                      className="w-full bg-bg-card border border-bg-border rounded-xl px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink-muted mb-1.5 block">Delegated to</label>
                    <input
                      value={newDel.delegatedTo}
                      onChange={(e) => setNewDel({ ...newDel, delegatedTo: e.target.value })}
                      placeholder="Name or team"
                      className="w-full bg-bg-card border border-bg-border rounded-xl px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-ink-muted mb-1.5 block">Due date</label>
                      <input
                        type="date"
                        value={newDel.dueDate}
                        onChange={(e) => setNewDel({ ...newDel, dueDate: e.target.value })}
                        className="w-full bg-bg-card border border-bg-border rounded-xl px-3 py-2.5 text-sm text-ink-primary outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted mb-1.5 block">Area</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][]).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => setNewDel({ ...newDel, area: key })}
                            className={cn(
                              "flex items-center justify-center p-2 rounded-lg text-sm transition-all",
                              newDel.area === key ? "text-ink-primary" : "text-ink-muted hover:bg-bg-hover"
                            )}
                            style={newDel.area === key ? { background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` } : {}}
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

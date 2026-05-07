"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, subDays } from "date-fns";
import { useAppStore, AREA_CONFIG, type LifeArea } from "@/store/useAppStore";
import { formatHour, cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, X, Check, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5);
const AREA_COLORS: Record<LifeArea, string> = {
  work: "#7c3aed", relationships: "#ec4899", health: "#10b981", finance: "#f59e0b", growth: "#3b82f6",
};
type NewBlock = { startHour: number; title: string; area: LifeArea; durationHours: number };
const EMPTY: NewBlock = { startHour: 9, title: "", area: "work", durationHours: 1 };

export default function PlannerPage() {
  const { timeBlocks, addTimeBlock, deleteTimeBlock, toggleTimeBlock } = useAppStore();
  const [date, setDate] = useState(new Date());
  const [adding, setAdding] = useState(false);
  const [newBlock, setNewBlock] = useState<NewBlock>(EMPTY);

  const dateStr = format(date, "yyyy-MM-dd");
  const blocks = timeBlocks.filter((b) => b.date === dateStr);
  const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

  const handleAdd = () => {
    if (!newBlock.title.trim()) { toast.error("Add a title!"); return; }
    addTimeBlock({ date: dateStr, startHour: newBlock.startHour, durationHours: newBlock.durationHours, title: newBlock.title, area: newBlock.area, color: AREA_COLORS[newBlock.area], isCompleted: false });
    setAdding(false); setNewBlock(EMPTY);
    toast.success("Block added!");
  };

  const totalHours = blocks.reduce((s, b) => s + b.durationHours, 0);
  const completedHours = blocks.filter((b) => b.isCompleted).reduce((s, b) => s + b.durationHours, 0);
  const now = new Date().getHours();

  return (
    <div className="px-4 py-5 md:px-8 md:py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-ink-primary">Day Planner</h1>
          <p className="text-xs text-ink-muted mt-0.5">Time-box every hour</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center glass rounded-xl p-1">
            <button onClick={() => setDate(subDays(date, 1))} className="p-2 rounded-lg hover:bg-bg-hover text-ink-muted transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => setDate(new Date())}
              className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-w-[56px]",
                isToday ? "bg-accent text-white" : "text-ink-secondary hover:bg-bg-hover"
              )}
            >
              {isToday ? "Today" : format(date, "MMM d")}
            </button>
            <button onClick={() => setDate(addDays(date, 1))} className="p-2 rounded-lg hover:bg-bg-hover text-ink-muted transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
          <button onClick={() => { setAdding(true); setNewBlock(EMPTY); }}
            className="w-10 h-10 md:w-auto md:px-4 bg-accent hover:bg-accent-dim rounded-xl text-white flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
            style={{ boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}
          >
            <Plus size={16} />
            <span className="hidden md:inline">Add Block</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-4"
        style={{ background: "rgba(15,15,26,0.85)", border: "1px solid #1e1e3a" }}>
        <div className="grid grid-cols-3 gap-4 flex-1">
          {[
            { label: "Scheduled", value: `${totalHours}h`, color: "#94a3b8" },
            { label: "Done", value: `${completedHours}h`, color: "#10b981" },
            { label: "Left", value: `${totalHours - completedHours}h`, color: "#7c3aed" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[10px] text-ink-muted">{s.label}</p>
              <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 hidden md:block">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: totalHours > 0 ? `${(completedHours / totalHours) * 100}%` : "0%", background: "linear-gradient(90deg,#7c3aed,#3b82f6)" }} />
          </div>
          <p className="text-[10px] text-ink-muted text-right mt-1">
            {totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0}% complete
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.85)", border: "1px solid #1e1e3a" }}>
        {HOURS.map((hour) => {
          const blockStart = blocks.find((b) => b.startHour === hour);
          const blockContinue = !blockStart && blocks.find((b) => hour > b.startHour && hour < b.startHour + b.durationHours);
          const isNow = isToday && now === hour;

          if (blockContinue) return null;

          return (
            <div key={hour}
              className={cn("flex relative border-b last:border-b-0", isNow ? "border-accent/20" : "border-bg-border")}
              style={{ minHeight: blockStart ? `${blockStart.durationHours * 56}px` : "56px" }}
            >
              {isNow && <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: "#a855f7", boxShadow: "0 0 8px #a855f7" }} />}

              {/* Hour label */}
              <div className="w-14 md:w-16 shrink-0 flex items-start justify-end pr-3 pt-3.5">
                <span className={cn("text-[11px] font-medium", isNow ? "text-accent-glow" : "text-ink-muted")}>
                  {formatHour(hour)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 relative py-1.5 pr-2">
                {blockStart && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    className="absolute inset-y-1.5 inset-x-1 rounded-xl px-3 py-2 cursor-pointer group/block"
                    style={{
                      background: `linear-gradient(135deg, ${blockStart.color}22, ${blockStart.color}10)`,
                      border: `1px solid ${blockStart.color}35`,
                      opacity: blockStart.isCompleted ? 0.5 : 1,
                    }}
                    onClick={() => toggleTimeBlock(blockStart.id)}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: blockStart.color }} />
                          <span className={cn("text-sm font-bold truncate",
                            blockStart.isCompleted ? "line-through text-ink-muted" : "text-ink-primary"
                          )}>
                            {blockStart.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-ink-muted mt-0.5 ml-4">
                          {AREA_CONFIG[blockStart.area].label} · {blockStart.durationHours}h
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity ml-2">
                        <button onClick={(e) => { e.stopPropagation(); toggleTimeBlock(blockStart.id); }}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: blockStart.color }}>
                          <Check size={12} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteTimeBlock(blockStart.id); toast.success("Removed"); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-ink-muted hover:text-electric-red transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                {!blockStart && !blockContinue && (
                  <button
                    onClick={() => { setAdding(true); setNewBlock({ ...EMPTY, startHour: hour }); }}
                    className="w-full h-10 rounded-xl border border-transparent hover:border-dashed hover:border-bg-border flex items-center justify-center text-[11px] text-ink-muted hover:text-accent-glow transition-all opacity-0 hover:opacity-100 gap-1"
                  >
                    <Plus size={11} /> {formatHour(hour)}
                  </button>
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
                  <h3 className="font-bold text-ink-primary">New Time Block</h3>
                  <button onClick={() => setAdding(false)} className="p-2 rounded-xl hover:bg-bg-hover text-ink-muted"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <input autoFocus value={newBlock.title} onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="What are you doing?"
                    className="w-full rounded-xl px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted outline-none transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e3a" }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-ink-muted mb-1.5 block font-medium">Start</label>
                      <select value={newBlock.startHour} onChange={(e) => setNewBlock({ ...newBlock, startHour: +e.target.value })}
                        className="w-full rounded-xl px-3 py-2.5 text-sm text-ink-primary outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e3a" }}
                      >
                        {HOURS.map((h) => <option key={h} value={h} className="bg-bg-card">{formatHour(h)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-ink-muted mb-1.5 block font-medium">Duration</label>
                      <select value={newBlock.durationHours} onChange={(e) => setNewBlock({ ...newBlock, durationHours: +e.target.value })}
                        className="w-full rounded-xl px-3 py-2.5 text-sm text-ink-primary outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e3a" }}
                      >
                        {[0.5, 1, 1.5, 2, 2.5, 3, 4].map((h) => <option key={h} value={h} className="bg-bg-card">{h}h</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-ink-muted mb-2 block font-medium">Life Area</label>
                    <div className="grid grid-cols-5 gap-2">
                      {(Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][]).map(([key, cfg]) => (
                        <button key={key} onClick={() => setNewBlock({ ...newBlock, area: key })}
                          className={cn("flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all text-xs")}
                          style={newBlock.area === key
                            ? { background: `${cfg.color}18`, border: `1px solid ${cfg.color}50`, color: cfg.color }
                            : { border: "1px solid #1e1e3a", color: "#475569" }
                          }
                        >
                          <span className="text-base">{cfg.icon}</span>
                          <span className="text-[9px] font-medium">{cfg.label.slice(0, 4)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleAdd}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-colors"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
                  >
                    Add Time Block
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

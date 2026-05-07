"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, subDays } from "date-fns";
import { useAppStore, AREA_CONFIG, type LifeArea } from "@/store/useAppStore";
import { formatHour, cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, X, Check, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5); // 5am–10pm
const AREA_COLORS: Record<LifeArea, string> = {
  work: "#7c3aed",
  relationships: "#ec4899",
  health: "#10b981",
  finance: "#f59e0b",
  growth: "#3b82f6",
};

type NewBlock = { startHour: number; title: string; area: LifeArea; durationHours: number };
const EMPTY: NewBlock = { startHour: 9, title: "", area: "work", durationHours: 1 };

export default function PlannerPage() {
  const { timeBlocks, addTimeBlock, deleteTimeBlock, toggleTimeBlock } = useAppStore();
  const [date, setDate] = useState(new Date());
  const [adding, setAdding] = useState(false);
  const [newBlock, setNewBlock] = useState<NewBlock>(EMPTY);
  const [hoverHour, setHoverHour] = useState<number | null>(null);

  const dateStr = format(date, "yyyy-MM-dd");
  const blocks = timeBlocks.filter((b) => b.date === dateStr);

  const handleAdd = () => {
    if (!newBlock.title.trim()) { toast.error("Add a title!"); return; }
    addTimeBlock({
      date: dateStr,
      startHour: newBlock.startHour,
      durationHours: newBlock.durationHours,
      title: newBlock.title,
      area: newBlock.area,
      color: AREA_COLORS[newBlock.area],
      isCompleted: false,
    });
    setAdding(false);
    setNewBlock(EMPTY);
    toast.success("Time block added!");
  };

  const getBlockAtHour = (hour: number) =>
    blocks.find((b) => hour >= b.startHour && hour < b.startHour + b.durationHours);

  const isBlockStart = (hour: number) =>
    blocks.find((b) => b.startHour === hour);

  const totalHours = blocks.reduce((s, b) => s + b.durationHours, 0);
  const completedHours = blocks.filter((b) => b.isCompleted).reduce((s, b) => s + b.durationHours, 0);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Day Planner</h1>
          <p className="text-ink-muted text-sm mt-0.5">Time-box your day, own your results</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date nav */}
          <div className="flex items-center gap-1 glass rounded-xl p-1">
            <button
              onClick={() => setDate(subDays(date, 1))}
              className="p-1.5 rounded-lg hover:bg-bg-hover text-ink-muted hover:text-ink-primary transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setDate(new Date())}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  ? "bg-accent text-white"
                  : "text-ink-secondary hover:bg-bg-hover"
              )}
            >
              {format(date, "MMM d") === format(new Date(), "MMM d") ? "Today" : format(date, "MMM d")}
            </button>
            <button
              onClick={() => setDate(addDays(date, 1))}
              className="p-1.5 rounded-lg hover:bg-bg-hover text-ink-muted hover:text-ink-primary transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => { setAdding(true); setNewBlock(EMPTY); }}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dim rounded-xl text-white text-sm font-medium transition-colors shadow-glow-sm"
          >
            <Plus size={15} />
            Add Block
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 glass rounded-xl px-5 py-3">
        <div>
          <p className="text-xs text-ink-muted">Scheduled</p>
          <p className="text-lg font-bold text-ink-primary">{totalHours}h</p>
        </div>
        <div className="w-px h-8 bg-bg-border" />
        <div>
          <p className="text-xs text-ink-muted">Completed</p>
          <p className="text-lg font-bold text-electric-green">{completedHours}h</p>
        </div>
        <div className="w-px h-8 bg-bg-border" />
        <div>
          <p className="text-xs text-ink-muted">Remaining</p>
          <p className="text-lg font-bold text-ink-secondary">{totalHours - completedHours}h</p>
        </div>
        <div className="flex-1 ml-4">
          <div className="h-2 bg-bg-card rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: totalHours > 0 ? `${(completedHours / totalHours) * 100}%` : "0%",
                background: "linear-gradient(90deg, #7c3aed, #3b82f6)",
              }}
            />
          </div>
        </div>
        <p className="text-xs font-mono text-ink-muted">
          {totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0}%
        </p>
      </div>

      <div className="flex gap-6">
        {/* Timeline */}
        <div className="flex-1">
          <div className="space-y-0">
            {HOURS.map((hour) => {
              const blockStart = isBlockStart(hour);
              const blockContinue = !blockStart && getBlockAtHour(hour);
              const isNow = new Date().getHours() === hour && dateStr === format(new Date(), "yyyy-MM-dd");

              return (
                <div
                  key={hour}
                  className="relative flex group"
                  onMouseEnter={() => setHoverHour(hour)}
                  onMouseLeave={() => setHoverHour(null)}
                >
                  {/* Hour label */}
                  <div className="w-16 shrink-0 flex items-start pt-2">
                    <span className={cn(
                      "text-[11px] font-medium",
                      isNow ? "text-accent-glow" : "text-ink-muted"
                    )}>
                      {formatHour(hour)}
                    </span>
                  </div>

                  {/* Grid line + content */}
                  <div className="flex-1 border-t border-bg-border min-h-[52px] relative">
                    {isNow && (
                      <div className="absolute top-0 left-0 right-0 h-px bg-accent-glow z-10" style={{ boxShadow: "0 0 8px #a855f7" }} />
                    )}

                    {blockStart && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute inset-x-2 top-1 rounded-lg px-3 py-2 cursor-pointer group/block transition-all"
                        style={{
                          height: `${blockStart.durationHours * 52 - 6}px`,
                          background: `linear-gradient(135deg, ${blockStart.color}25 0%, ${blockStart.color}15 100%)`,
                          border: `1px solid ${blockStart.color}40`,
                          opacity: blockStart.isCompleted ? 0.5 : 1,
                        }}
                        onClick={() => toggleTimeBlock(blockStart.id)}
                      >
                        <div className="flex items-start justify-between h-full">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: blockStart.color }}
                              />
                              <span className={cn(
                                "text-sm font-semibold truncate",
                                blockStart.isCompleted ? "line-through text-ink-muted" : "text-ink-primary"
                              )}>
                                {blockStart.title}
                              </span>
                            </div>
                            <p className="text-[10px] text-ink-muted ml-4">
                              {AREA_CONFIG[blockStart.area].label} · {blockStart.durationHours}h
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleTimeBlock(blockStart.id); }}
                              className="p-1 rounded-md hover:bg-white/10 transition-colors"
                              style={{ color: blockStart.color }}
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteTimeBlock(blockStart.id); toast.success("Block removed"); }}
                              className="p-1 rounded-md hover:bg-red-500/10 text-ink-muted hover:text-electric-red transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Add on hover */}
                    {!blockStart && !blockContinue && hoverHour === hour && (
                      <button
                        onClick={() => { setAdding(true); setNewBlock({ ...EMPTY, startHour: hour }); }}
                        className="absolute inset-x-2 top-1 h-10 rounded-lg border border-dashed border-bg-border hover:border-accent/40 flex items-center justify-center gap-2 text-xs text-ink-muted hover:text-accent-glow transition-all"
                      >
                        <Plus size={12} />
                        Add block at {formatHour(hour)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Area legend */}
        <div className="w-44 shrink-0">
          <div className="glass rounded-xl p-4 sticky top-6">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-3">Areas</p>
            <div className="space-y-2">
              {(Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][]).map(([key, cfg]) => {
                const areaBlocks = blocks.filter((b) => b.area === key);
                const areaHours = areaBlocks.reduce((s, b) => s + b.durationHours, 0);
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                      <span className="text-xs text-ink-secondary">{cfg.label}</span>
                    </div>
                    <span className="text-xs font-mono text-ink-muted">{areaHours}h</span>
                  </div>
                );
              })}
            </div>
            {blocks.length === 0 && (
              <p className="text-xs text-ink-muted text-center mt-4 py-2">No blocks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Block Modal */}
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
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="glass rounded-2xl p-6 border-glow">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-ink-primary">New Time Block</h3>
                  <button onClick={() => setAdding(false)} className="p-1.5 rounded-lg hover:bg-bg-hover text-ink-muted">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-ink-muted mb-1.5 block">Title</label>
                    <input
                      autoFocus
                      value={newBlock.title}
                      onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      placeholder="What are you doing?"
                      className="w-full bg-bg-card border border-bg-border rounded-xl px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-ink-muted mb-1.5 block">Start time</label>
                      <select
                        value={newBlock.startHour}
                        onChange={(e) => setNewBlock({ ...newBlock, startHour: +e.target.value })}
                        className="w-full bg-bg-card border border-bg-border rounded-xl px-3 py-2.5 text-sm text-ink-primary outline-none focus:border-accent/50 transition-colors"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h} className="bg-bg-card">{formatHour(h)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted mb-1.5 block">Duration</label>
                      <select
                        value={newBlock.durationHours}
                        onChange={(e) => setNewBlock({ ...newBlock, durationHours: +e.target.value })}
                        className="w-full bg-bg-card border border-bg-border rounded-xl px-3 py-2.5 text-sm text-ink-primary outline-none focus:border-accent/50 transition-colors"
                      >
                        {[0.5, 1, 1.5, 2, 2.5, 3, 4].map((h) => (
                          <option key={h} value={h} className="bg-bg-card">{h}h</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-ink-muted mb-1.5 block">Life area</label>
                    <div className="grid grid-cols-5 gap-2">
                      {(Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setNewBlock({ ...newBlock, area: key })}
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs",
                            newBlock.area === key
                              ? "border-opacity-80 text-ink-primary"
                              : "border-bg-border text-ink-muted hover:border-opacity-40"
                          )}
                          style={newBlock.area === key ? {
                            background: `${cfg.color}20`,
                            borderColor: `${cfg.color}60`,
                          } : {}}
                        >
                          <span>{cfg.icon}</span>
                          <span className="text-[9px] truncate w-full text-center">{cfg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleAdd}
                    className="w-full bg-accent hover:bg-accent-dim text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-glow-sm mt-1"
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

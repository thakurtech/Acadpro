"use client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAppStore, AREA_CONFIG, PRIORITY_CONFIG } from "@/store/useAppStore";
import { getGreeting, scoreToColor, cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Users, Zap, TrendingUp, ArrowRight, Command } from "lucide-react";
import Link from "next/link";

const item = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } },
};

export default function Dashboard() {
  const { tasks, timeBlocks, delegations, getTodayCheckin } = useAppStore();
  const checkin = getTodayCheckin();
  const today = format(new Date(), "yyyy-MM-dd");

  const todayTasks = tasks.filter((t) => t.status === "today");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const todayBlocks = timeBlocks.filter((b) => b.date === today);
  const completedBlocks = todayBlocks.filter((b) => b.isCompleted);
  const activeDelegations = delegations.filter((d) => d.status !== "done");
  const avgScore = checkin
    ? Math.round(Object.values(checkin.scores).reduce((a, b) => a + b, 0) / 5)
    : 0;

  const now = new Date().getHours();
  const currentBlock = todayBlocks.find((b) => now >= b.startHour && now < b.startHour + b.durationHours);
  const overdueCount = activeDelegations.filter((d) => d.dueDate <= today).length;

  const stats = [
    { label: "Tasks", value: `${doneTasks.length}/${todayTasks.length + doneTasks.length}`, sub: "done today", color: "#10b981", icon: CheckCircle2, progress: todayTasks.length + doneTasks.length > 0 ? (doneTasks.length / (todayTasks.length + doneTasks.length)) * 100 : 0 },
    { label: "Blocks", value: `${completedBlocks.length}/${todayBlocks.length}`, sub: "time-boxed", color: "#7c3aed", icon: Clock, progress: todayBlocks.length > 0 ? (completedBlocks.length / todayBlocks.length) * 100 : 0 },
    { label: "Delegated", value: activeDelegations.length, sub: "in flight", color: "#3b82f6", icon: Users, progress: delegations.length > 0 ? ((delegations.length - activeDelegations.length) / delegations.length) * 100 : 0 },
    { label: "Life Score", value: checkin ? `${avgScore}/10` : "—", sub: avgScore >= 7 ? "Elite zone" : "Keep pushing", color: scoreToColor(avgScore), icon: Zap, progress: avgScore * 10 },
  ];

  return (
    <div className="px-4 py-5 md:px-8 md:py-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-xs text-ink-muted font-medium">{format(new Date(), "EEEE, MMMM d")}</p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl md:text-3xl font-black text-ink-primary">
            {getGreeting()}, <span className="text-gradient">Boss</span> 👋
          </h1>
          <button
            className="hidden md:flex items-center gap-2 px-3 py-1.5 glass rounded-xl text-xs text-ink-muted hover:text-ink-secondary transition-colors"
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          >
            <Command size={11} />⌘K
          </button>
        </div>
      </motion.div>

      {currentBlock && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="mb-4 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${currentBlock.color}20, ${currentBlock.color}08)`, border: `1px solid ${currentBlock.color}30` }}
        >
          <div className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: currentBlock.color, boxShadow: `0 0 10px ${currentBlock.color}` }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-ink-muted font-semibold uppercase tracking-widest">Now</p>
            <p className="text-sm font-bold text-ink-primary truncate">{currentBlock.title}</p>
          </div>
          <span className="text-xs text-ink-muted shrink-0">{currentBlock.startHour}:00–{currentBlock.startHour + currentBlock.durationHours}:00</span>
        </motion.div>
      )}

      <motion.div initial="initial" animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={item}
            className="rounded-2xl p-4"
            style={{ background: "rgba(15,15,26,0.85)", border: `1px solid ${s.color}18` }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-ink-muted font-medium">{s.label}</p>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={13} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-black text-ink-primary tabular-nums leading-none">{s.value}</p>
            <p className="text-[10px] text-ink-muted mt-1">{s.sub}</p>
            <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full animate-progress" style={{ width: `${s.progress}%`, background: s.color }} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {overdueCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mb-4 rounded-2xl p-3.5 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <TrendingUp size={15} className="text-electric-red shrink-0" />
          <p className="text-sm text-ink-secondary flex-1">
            <span className="text-electric-red font-bold">{overdueCount} delegation{overdueCount > 1 ? "s" : ""}</span> overdue
          </p>
          <Link href="/delegation" className="text-xs text-electric-red font-bold shrink-0">Review →</Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={item} initial="initial" animate="animate"
          className="md:col-span-2 rounded-2xl p-5"
          style={{ background: "rgba(15,15,26,0.85)", border: "1px solid #1e1e3a" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-ink-primary">Today&apos;s Tasks</h2>
            <Link href="/tasks" className="flex items-center gap-1 text-xs text-ink-muted hover:text-accent-glow transition-colors">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-1">
            {[...todayTasks, ...doneTasks].slice(0, 7).map((task, i) => (
              <motion.div key={task.id}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                className={cn("flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
                  task.status === "done" ? "opacity-40" : "hover:bg-bg-hover"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: PRIORITY_CONFIG[task.priority].color }} />
                <span className={cn("flex-1 text-sm truncate",
                  task.status === "done" ? "line-through text-ink-muted" : "text-ink-secondary"
                )}>{task.title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md"
                    style={{ background: `${AREA_CONFIG[task.area].color}12`, color: AREA_CONFIG[task.area].color }}>
                    {AREA_CONFIG[task.area].icon}
                  </span>
                  {task.status === "done"
                    ? <CheckCircle2 size={14} className="text-electric-green" />
                    : <Circle size={14} className="text-ink-muted" />
                  }
                </div>
              </motion.div>
            ))}
            {todayTasks.length === 0 && doneTasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-ink-muted text-sm">Nothing yet</p>
                <Link href="/tasks" className="text-xs text-accent-glow hover:underline mt-1 inline-block">Add tasks →</Link>
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div variants={item} initial="initial" animate="animate"
            className="rounded-2xl p-4"
            style={{ background: "rgba(15,15,26,0.85)", border: "1px solid #1e1e3a" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-ink-primary">Life Score</h2>
              <Link href="/life" className="flex items-center gap-1 text-xs text-ink-muted hover:text-accent-glow transition-colors">
                Update <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-2.5">
              {(Object.entries(AREA_CONFIG) as [keyof typeof AREA_CONFIG, (typeof AREA_CONFIG)[keyof typeof AREA_CONFIG]][]).map(([key, cfg]) => {
                const score = checkin?.scores[key] ?? 0;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm w-4 text-center">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-ink-muted">{cfg.label}</span>
                        <span className="text-[10px] font-bold font-mono" style={{ color: scoreToColor(score) }}>{score}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-full rounded-full animate-progress" style={{ width: `${score * 10}%`, background: cfg.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={item} initial="initial" animate="animate"
            className="rounded-2xl p-4"
            style={{ background: "rgba(15,15,26,0.85)", border: "1px solid #1e1e3a" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-ink-primary">Upcoming</h2>
              <Link href="/planner" className="flex items-center gap-1 text-xs text-ink-muted hover:text-accent-glow transition-colors">
                Plan <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-2">
              {todayBlocks.filter((b) => b.startHour >= now).slice(0, 3).map((block) => (
                <div key={block.id} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                  style={{ background: `${block.color}08`, border: `1px solid ${block.color}18` }}>
                  <div className="w-1 h-5 rounded-full shrink-0" style={{ background: block.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-primary truncate">{block.title}</p>
                    <p className="text-[10px] text-ink-muted">{block.startHour}:00 · {block.durationHours}h</p>
                  </div>
                </div>
              ))}
              {todayBlocks.filter((b) => b.startHour >= now).length === 0 && (
                <p className="text-xs text-ink-muted text-center py-2">No more blocks today</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

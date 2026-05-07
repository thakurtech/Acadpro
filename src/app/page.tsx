"use client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAppStore, AREA_CONFIG, PRIORITY_CONFIG } from "@/store/useAppStore";
import { getGreeting, scoreToColor, cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Zap,
  TrendingUp,
  ArrowRight,
  Command,
} from "lucide-react";
import Link from "next/link";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  },
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
  const currentBlock = todayBlocks.find(
    (b) => now >= b.startHour && now < b.startHour + b.durationHours
  );

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-ink-muted text-sm font-medium">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
            <h1 className="text-3xl font-bold text-ink-primary mt-1">
              {getGreeting()}, <span className="text-gradient">Boss</span> 👋
            </h1>
          </div>
          <button
            onClick={() => {
              const e = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true });
              window.dispatchEvent(e);
            }}
            className="flex items-center gap-2 px-3 py-2 glass rounded-lg text-xs text-ink-muted hover:text-ink-secondary transition-colors border-glow"
          >
            <Command size={12} />
            <span>Quick actions</span>
            <kbd className="font-mono bg-bg-card px-1 rounded border border-bg-border ml-1">⌘K</kbd>
          </button>
        </div>
      </motion.div>

      {currentBlock && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-xl p-4 flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, ${currentBlock.color}18 0%, ${currentBlock.color}08 100%)`,
            border: `1px solid ${currentBlock.color}30`,
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: currentBlock.color, boxShadow: `0 0 10px ${currentBlock.color}` }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-ink-muted font-medium uppercase tracking-wider">Now</p>
            <p className="text-sm font-semibold text-ink-primary truncate">{currentBlock.title}</p>
          </div>
          <span className="text-xs text-ink-muted shrink-0">{currentBlock.startHour}:00 – {currentBlock.startHour + currentBlock.durationHours}:00</span>
        </motion.div>
      )}

      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[
          {
            label: "Today's Tasks",
            value: `${doneTasks.length}/${todayTasks.length + doneTasks.length}`,
            sub: "completed",
            icon: CheckCircle2,
            color: "#10b981",
            progress: todayTasks.length + doneTasks.length > 0 ? (doneTasks.length / (todayTasks.length + doneTasks.length)) * 100 : 0,
          },
          {
            label: "Time Blocks",
            value: `${completedBlocks.length}/${todayBlocks.length}`,
            sub: "scheduled",
            icon: Clock,
            color: "#7c3aed",
            progress: todayBlocks.length > 0 ? (completedBlocks.length / todayBlocks.length) * 100 : 0,
          },
          {
            label: "Delegated",
            value: activeDelegations.length,
            sub: "in flight",
            icon: Users,
            color: "#3b82f6",
            progress: delegations.length > 0 ? ((delegations.length - activeDelegations.length) / delegations.length) * 100 : 0,
          },
          {
            label: "Life Score",
            value: checkin ? `${avgScore}/10` : "—",
            sub: avgScore >= 7 ? "Elite zone" : "Keep pushing",
            icon: Zap,
            color: scoreToColor(avgScore),
            progress: avgScore * 10,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={stagger.item}
            className="glass rounded-xl p-4 transition-all duration-200"
            style={{ borderColor: `${stat.color}20` }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-ink-muted font-medium">{stat.label}</p>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}18` }}
              >
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-ink-primary tabular-nums">{stat.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{stat.sub}</p>
            <div className="mt-3 h-1 bg-bg-card rounded-full overflow-hidden">
              <div
                className="h-full rounded-full animate-progress"
                style={{ width: `${stat.progress}%`, background: stat.color }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-primary text-sm">Today&apos;s Tasks</h2>
            <Link href="/tasks" className="flex items-center gap-1 text-xs text-ink-muted hover:text-accent-glow transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {[...todayTasks, ...doneTasks].slice(0, 6).map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  task.status === "done" ? "opacity-50" : "hover:bg-bg-hover"
                )}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: PRIORITY_CONFIG[task.priority].color }}
                />
                <span
                  className={cn(
                    "flex-1 text-sm truncate",
                    task.status === "done" ? "line-through text-ink-muted" : "text-ink-secondary"
                  )}
                >
                  {task.title}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: `${AREA_CONFIG[task.area].color}15`,
                      color: AREA_CONFIG[task.area].color,
                    }}
                  >
                    {AREA_CONFIG[task.area].icon}
                  </span>
                  {task.status === "done" ? (
                    <CheckCircle2 size={14} className="text-electric-green" />
                  ) : (
                    <Circle size={14} className="text-ink-muted" />
                  )}
                </div>
              </motion.div>
            ))}
            {todayTasks.length === 0 && doneTasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-ink-muted text-sm">No tasks for today</p>
                <Link href="/tasks" className="text-xs text-accent-glow hover:underline mt-1 inline-block">Add your first task →</Link>
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink-primary text-sm">Life Score</h2>
              <Link href="/life" className="flex items-center gap-1 text-xs text-ink-muted hover:text-accent-glow transition-colors">
                Update <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {(Object.entries(AREA_CONFIG) as [keyof typeof AREA_CONFIG, (typeof AREA_CONFIG)[keyof typeof AREA_CONFIG]][]).map(([key, cfg]) => {
                const score = checkin?.scores[key] ?? 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-sm w-5 text-center">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-ink-muted">{cfg.label}</span>
                        <span className="text-xs font-mono font-semibold" style={{ color: scoreToColor(score) }}>{score}/10</span>
                      </div>
                      <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full animate-progress"
                          style={{ width: `${score * 10}%`, background: cfg.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink-primary text-sm">Upcoming Blocks</h2>
              <Link href="/planner" className="flex items-center gap-1 text-xs text-ink-muted hover:text-accent-glow transition-colors">
                Planner <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {todayBlocks
                .filter((b) => b.startHour >= now)
                .slice(0, 3)
                .map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ background: `${block.color}10`, border: `1px solid ${block.color}20` }}
                  >
                    <div
                      className="w-1 h-6 rounded-full shrink-0"
                      style={{ background: block.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink-primary truncate">{block.title}</p>
                      <p className="text-[10px] text-ink-muted">{block.startHour}:00 · {block.durationHours}h</p>
                    </div>
                  </div>
                ))}
              {todayBlocks.filter((b) => b.startHour >= now).length === 0 && (
                <p className="text-xs text-ink-muted text-center py-3">No more blocks today</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {activeDelegations.filter((d) => d.dueDate <= format(new Date(), "yyyy-MM-dd")).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 rounded-xl p-4 flex items-center gap-3"
          style={{ background: "#ef444410", border: "1px solid #ef444430" }}
        >
          <TrendingUp size={16} className="text-electric-red shrink-0" />
          <p className="text-sm text-ink-secondary">
            <span className="text-electric-red font-semibold">
              {activeDelegations.filter((d) => d.dueDate <= format(new Date(), "yyyy-MM-dd")).length} delegation{activeDelegations.filter((d) => d.dueDate <= format(new Date(), "yyyy-MM-dd")).length > 1 ? "s" : ""}
            </span>{" "}
            overdue — follow up now.
          </p>
          <Link href="/delegation" className="ml-auto text-xs text-electric-red hover:underline shrink-0">
            Review →
          </Link>
        </motion.div>
      )}
    </div>
  );
}

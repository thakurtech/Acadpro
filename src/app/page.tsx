"use client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAppStore, AREA_CONFIG, PRIORITY_CONFIG } from "@/store/useAppStore";
import { getGreeting, scoreToColor } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Users, Zap, ArrowRight, TrendingUp, Command } from "lucide-react";
import Link from "next/link";


function StatCard({ label, value, sub, color, progress, icon: Icon, delay }: {
  label:string; value:string|number; sub:string; color:string; progress:number; icon:React.ElementType; delay:number;
}) {
  return (
    <motion.div
      initial={{ opacity:0, y:20, scale:0.96 }}
      animate={{ opacity:1, y:0, scale:1 }}
      transition={{ delay, type:"spring", stiffness:260, damping:22 }}
      className="card p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold" style={{ color:"rgba(255,255,255,0.4)" }}>{label}</p>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background:`${color}18` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-[28px] font-black leading-none tracking-tight" style={{ color:"rgba(255,255,255,0.95)" }}>{value}</p>
        <p className="text-[12px] font-medium mt-1" style={{ color:"rgba(255,255,255,0.35)" }}>{sub}</p>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full progress-bar" style={{ width:`${progress}%`, background:color }} />
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { tasks, timeBlocks, delegations, getTodayCheckin } = useAppStore();
  const checkin = getTodayCheckin();
  const today = format(new Date(), "yyyy-MM-dd");
  const now = new Date().getHours();

  const todayTasks   = tasks.filter(t => t.status === "today");
  const doneTasks    = tasks.filter(t => t.status === "done");
  const todayBlocks  = timeBlocks.filter(b => b.date === today);
  const doneBlocks   = todayBlocks.filter(b => b.isCompleted);
  const activeDels   = delegations.filter(d => d.status !== "done");
  const overdueDels  = activeDels.filter(d => d.dueDate <= today);
  const avgScore     = checkin ? Math.round(Object.values(checkin.scores).reduce((a,b)=>a+b,0)/5) : 0;
  const currentBlock = todayBlocks.find(b => now >= b.startHour && now < b.startHour + b.durationHours);
  const total        = todayTasks.length + doneTasks.length;

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">

      {/* ── Greeting ── */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium" style={{ color:"rgba(255,255,255,0.35)" }}>
            {format(new Date(),"EEEE, MMMM d")}
          </p>
          <h1 className="text-[28px] md:text-[34px] font-black tracking-tight leading-tight mt-1">
            {getGreeting()},{" "}
            <span className="text-gradient">Boss</span> 👋
          </h1>
        </div>
        <button onClick={() => window.dispatchEvent(new KeyboardEvent("keydown",{key:"k",ctrlKey:true,bubbles:true}))}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold shrink-0"
          style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.4)", border:"0.5px solid rgba(255,255,255,0.08)" }}>
          <Command size={12} />⌘K
        </button>
      </motion.div>

      {/* ── Now banner ── */}
      {currentBlock && (
        <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.05 }}
          className="card mb-5 p-4 flex items-center gap-4"
          style={{ borderLeft:`3px solid ${currentBlock.color}` }}>
          <div className="w-2 h-2 rounded-full pulse-dot shrink-0"
            style={{ background:currentBlock.color }} />
          <div className="flex-1 min-w-0">
            <p className="label-caps mb-0.5">Now</p>
            <p className="text-[15px] font-bold truncate" style={{ color:"rgba(255,255,255,0.92)" }}>{currentBlock.title}</p>
          </div>
          <p className="text-[12px] font-mono shrink-0" style={{ color:"rgba(255,255,255,0.35)" }}>
            {currentBlock.startHour}:00–{currentBlock.startHour+currentBlock.durationHours}:00
          </p>
        </motion.div>
      )}

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Tasks" value={`${doneTasks.length}/${total}`} sub="completed today"
          color="#30d158" progress={total>0?(doneTasks.length/total)*100:0} icon={CheckCircle2} delay={0.08} />
        <StatCard label="Time Blocks" value={`${doneBlocks.length}/${todayBlocks.length}`} sub="time-boxed"
          color="#7c3aed" progress={todayBlocks.length>0?(doneBlocks.length/todayBlocks.length)*100:0} icon={Clock} delay={0.12} />
        <StatCard label="Delegated" value={activeDels.length} sub="in flight"
          color="#0a84ff" progress={delegations.length>0?((delegations.length-activeDels.length)/delegations.length)*100:0} icon={Users} delay={0.16} />
        <StatCard label="Life Score" value={checkin?`${avgScore}/10`:"—"} sub={avgScore>=8?"Elite zone 🔥":avgScore>=6?"Strong":"Keep pushing"}
          color={scoreToColor(avgScore)} progress={avgScore*10} icon={Zap} delay={0.2} />
      </div>

      {/* ── Overdue alert ── */}
      {overdueDels.length > 0 && (
        <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
          className="mb-4 rounded-2xl p-4 flex items-center gap-3"
          style={{ background:"rgba(255,69,58,0.08)", border:"0.5px solid rgba(255,69,58,0.25)" }}>
          <TrendingUp size={16} style={{ color:"#ff453a" }} className="shrink-0" />
          <p className="text-[13px] font-medium flex-1" style={{ color:"rgba(255,255,255,0.7)" }}>
            <span className="font-bold" style={{ color:"#ff453a" }}>{overdueDels.length} delegation{overdueDels.length>1?"s":""}</span> overdue
          </p>
          <Link href="/delegation" className="text-[12px] font-bold shrink-0" style={{ color:"#ff453a" }}>Review →</Link>
        </motion.div>
      )}

      {/* ── Main columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tasks list */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
          className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 divider">
            <p className="text-[15px] font-bold" style={{ color:"rgba(255,255,255,0.92)" }}>Today</p>
            <Link href="/tasks" className="flex items-center gap-1 text-[13px] font-semibold"
              style={{ color:"rgba(191,90,242,0.9)" }}>
              All tasks <ArrowRight size={13} />
            </Link>
          </div>

          {[...todayTasks,...doneTasks].slice(0,7).map((task, i) => (
            <motion.div key={task.id}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.28+i*0.04 }}
              className={`flex items-center gap-4 px-5 py-3.5 divider last:border-0 ${task.status!=="done"?"hover:bg-white/[0.02]":""} transition-colors`}>
              {task.status === "done"
                ? <CheckCircle2 size={20} style={{ color:"#30d158" }} className="shrink-0" />
                : <div className="w-5 h-5 rounded-full border-[1.5px] shrink-0"
                    style={{ borderColor:PRIORITY_CONFIG[task.priority].color }} />
              }
              <span className={`flex-1 text-[14px] font-medium truncate ${task.status==="done"?"line-through":""}`}
                style={{ color: task.status==="done" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.82)" }}>
                {task.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ background:AREA_CONFIG[task.area].color }} />
                <span className="text-[11px] font-semibold" style={{ color:"rgba(255,255,255,0.3)" }}>
                  {AREA_CONFIG[task.area].label}
                </span>
              </div>
            </motion.div>
          ))}

          {total === 0 && (
            <div className="text-center py-12">
              <p className="text-[14px] font-medium" style={{ color:"rgba(255,255,255,0.35)" }}>No tasks yet</p>
              <Link href="/tasks" className="text-[13px] font-semibold mt-1 inline-block"
                style={{ color:"rgba(191,90,242,0.8)" }}>Add your first →</Link>
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Life score */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 divider">
              <p className="text-[15px] font-bold" style={{ color:"rgba(255,255,255,0.92)" }}>Life Score</p>
              <Link href="/life" className="text-[13px] font-semibold" style={{ color:"rgba(191,90,242,0.9)" }}>Update →</Link>
            </div>
            <div className="p-5 space-y-3.5">
              {(Object.entries(AREA_CONFIG) as [keyof typeof AREA_CONFIG, (typeof AREA_CONFIG)[keyof typeof AREA_CONFIG]][]).map(([key, cfg]) => {
                const score = checkin?.scores[key] ?? 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-[16px] w-5 text-center">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[12px] font-medium" style={{ color:"rgba(255,255,255,0.45)" }}>{cfg.label}</span>
                        <span className="text-[12px] font-bold tabular-nums" style={{ color:scoreToColor(score) }}>{score}</span>
                      </div>
                      <div className="h-[3px] rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full progress-bar" style={{ width:`${score*10}%`, background:cfg.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Upcoming blocks */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }}
            className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 divider">
              <p className="text-[15px] font-bold" style={{ color:"rgba(255,255,255,0.92)" }}>Upcoming</p>
              <Link href="/planner" className="text-[13px] font-semibold" style={{ color:"rgba(191,90,242,0.9)" }}>Plan →</Link>
            </div>
            <div className="p-3 space-y-2">
              {todayBlocks.filter(b=>b.startHour>=now).slice(0,4).map(b => (
                <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                  style={{ background:`${b.color}0a`, border:`0.5px solid ${b.color}20` }}>
                  <div className="w-[3px] h-8 rounded-full shrink-0" style={{ background:b.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color:"rgba(255,255,255,0.88)" }}>{b.title}</p>
                    <p className="text-[11px] font-medium" style={{ color:"rgba(255,255,255,0.3)" }}>{b.startHour}:00 · {b.durationHours}h</p>
                  </div>
                </div>
              ))}
              {todayBlocks.filter(b=>b.startHour>=now).length===0 && (
                <p className="text-center text-[12px] py-4" style={{ color:"rgba(255,255,255,0.25)" }}>No more blocks today</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

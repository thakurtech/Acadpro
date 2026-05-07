"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAppStore, AREA_CONFIG, type LifeArea, type DailyCheckin } from "@/store/useAppStore";
import { scoreToColor, scoreToLabel, cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Minus, Plus, Save } from "lucide-react";
import toast from "react-hot-toast";

const AREAS = Object.entries(AREA_CONFIG) as [LifeArea, (typeof AREA_CONFIG)[LifeArea]][];

export default function LifePage() {
  const { checkins, saveCheckin, getTodayCheckin } = useAppStore();
  const todayCheckin = getTodayCheckin();
  const today = format(new Date(), "yyyy-MM-dd");

  const [scores, setScores] = useState<Record<LifeArea, number>>({
    work: todayCheckin?.scores.work ?? 5,
    relationships: todayCheckin?.scores.relationships ?? 5,
    health: todayCheckin?.scores.health ?? 5,
    finance: todayCheckin?.scores.finance ?? 5,
    growth: todayCheckin?.scores.growth ?? 5,
  });
  const [wins, setWins] = useState(todayCheckin?.wins.join("\n") ?? "");
  const [blockers, setBlockers] = useState(todayCheckin?.blockers.join("\n") ?? "");
  const [saved, setSaved] = useState(false);

  const totalScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);

  const handleSave = () => {
    saveCheckin({ date: today, scores, wins: wins.split("\n").filter(Boolean), blockers: blockers.split("\n").filter(Boolean) });
    setSaved(true);
    toast.success("Life score saved! 🔥");
    setTimeout(() => setSaved(false), 2500);
  };

  const adjust = (area: LifeArea, delta: number) =>
    setScores((s) => ({ ...s, [area]: Math.max(1, Math.min(10, s[area] + delta)) }));

  return (
    <div className="px-4 py-5 md:px-8 md:py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-ink-primary">Life Score</h1>
          <p className="text-xs text-ink-muted mt-0.5">Rate all 5 areas. Build a legendary life.</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold">Average</p>
          <p className="text-3xl font-black leading-none" style={{ color: scoreToColor(totalScore) }}>
            {totalScore}<span className="text-sm font-medium text-ink-muted">/10</span>
          </p>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: scoreToColor(totalScore) }}>
            {scoreToLabel(totalScore)}
          </p>
        </div>
      </div>

      {/* Score cards */}
      <div className="space-y-3 mb-5">
        {AREAS.map(([key, cfg], i) => {
          const score = scores[key];
          return (
            <motion.div key={key}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4"
              style={{ background: "rgba(15,15,26,0.85)", border: `1px solid ${cfg.color}18` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${cfg.color}12` }}>
                  {cfg.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink-primary">{cfg.label}</p>
                  <p className="text-[11px] font-semibold" style={{ color: scoreToColor(score) }}>{scoreToLabel(score)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => adjust(key, -1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors active:scale-95"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e3a" }}>
                    <Minus size={14} />
                  </button>
                  <span className="text-2xl font-black w-10 text-center tabular-nums" style={{ color: scoreToColor(score) }}>{score}</span>
                  <button onClick={() => adjust(key, 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors active:scale-95"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e3a" }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Click-to-seek bar */}
              <div className="relative h-3 rounded-full overflow-hidden cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  setScores((s) => ({ ...s, [key]: Math.max(1, Math.min(10, Math.round(pct * 10))) }));
                }}
              >
                <motion.div className="h-full rounded-full"
                  animate={{ width: `${score * 10}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  style={{ background: `linear-gradient(90deg, ${cfg.color}70, ${cfg.color})` }}
                />
              </div>

              {/* Number picker */}
              <div className="flex justify-between mt-2">
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <button key={n} onClick={() => setScores((s) => ({ ...s, [key]: n }))}
                    className={cn("flex-1 py-1 text-[10px] font-bold rounded transition-colors",
                      score === n ? "text-ink-primary" : "text-ink-muted/50 hover:text-ink-muted"
                    )}
                    style={score === n ? { color: cfg.color } : {}}
                  >{n}</button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Wins + Blockers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl p-4" style={{ background: "rgba(15,15,26,0.85)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <label className="text-[11px] font-black text-electric-green uppercase tracking-widest block mb-2">🏆 Today&apos;s Wins</label>
          <textarea value={wins} onChange={(e) => setWins(e.target.value)}
            placeholder="One win per line…" rows={3}
            className="w-full bg-transparent text-sm text-ink-secondary placeholder:text-ink-muted outline-none resize-none" />
        </div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(15,15,26,0.85)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <label className="text-[11px] font-black text-electric-red uppercase tracking-widest block mb-2">🚧 Blockers</label>
          <textarea value={blockers} onChange={(e) => setBlockers(e.target.value)}
            placeholder="What slowed you down?" rows={3}
            className="w-full bg-transparent text-sm text-ink-secondary placeholder:text-ink-muted outline-none resize-none" />
        </div>
      </div>

      {/* Save button */}
      <motion.button onClick={handleSave}
        whileTap={{ scale: 0.97 }}
        className={cn("w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black transition-all mb-6",
          saved ? "text-electric-green" : "text-white"
        )}
        style={saved
          ? { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }
          : { background: "linear-gradient(135deg,#7c3aed,#3b82f6)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }
        }
      >
        <Save size={16} />
        {saved ? "Saved! Keep winning 🔥" : "Save Today's Score"}
      </motion.button>

      {/* 7-day trend */}
      {checkins.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-5"
          style={{ background: "rgba(15,15,26,0.85)", border: "1px solid #1e1e3a" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-accent-glow" />
            <h3 className="text-sm font-bold text-ink-primary">7-Day Trend</h3>
          </div>
          <div className="flex items-end gap-2 h-16">
            {Array.from({ length: 7 }, (_, i) => {
              const d = format(new Date(Date.now() - (6 - i) * 86400000), "yyyy-MM-dd");
              const c = checkins.find((x) => x.date === d);
              const avg = c ? Math.round(Object.values(c.scores).reduce((a, b) => a + b, 0) / 5) : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-lg transition-all"
                    style={{ height: `${Math.max(4, avg * 5.6)}px`, background: c ? scoreToColor(avg) : "#1e1e3a" }} />
                  <span className="text-[9px] text-ink-muted font-mono">{format(new Date(Date.now() - (6 - i) * 86400000), "d")}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-bg-border">
            <span className="text-xs text-ink-muted">{checkins.length} day{checkins.length !== 1 ? "s" : ""} tracked</span>
            <div className="flex gap-1">
              {AREAS.map(([key, cfg]) => (
                <div key={key} className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} title={cfg.label} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

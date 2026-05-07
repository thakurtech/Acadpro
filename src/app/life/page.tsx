"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const defaultScores: Record<LifeArea, number> = {
    work: todayCheckin?.scores.work ?? 5,
    relationships: todayCheckin?.scores.relationships ?? 5,
    health: todayCheckin?.scores.health ?? 5,
    finance: todayCheckin?.scores.finance ?? 5,
    growth: todayCheckin?.scores.growth ?? 5,
  };

  const [scores, setScores] = useState<Record<LifeArea, number>>(defaultScores);
  const [wins, setWins] = useState(todayCheckin?.wins.join("\n") ?? "");
  const [blockers, setBlockers] = useState(todayCheckin?.blockers.join("\n") ?? "");
  const [saved, setSaved] = useState(false);

  const totalScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);

  const handleSave = () => {
    const checkin: DailyCheckin = {
      date: today,
      scores,
      wins: wins.split("\n").filter(Boolean),
      blockers: blockers.split("\n").filter(Boolean),
    };
    saveCheckin(checkin);
    setSaved(true);
    toast.success("Life score saved! 🔥");
    setTimeout(() => setSaved(false), 2000);
  };

  const adjust = (area: LifeArea, delta: number) => {
    setScores((s) => ({ ...s, [area]: Math.max(1, Math.min(10, s[area] + delta)) }));
  };

  const recentCheckins = checkins.slice(0, 7);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Life Score</h1>
          <p className="text-ink-muted text-sm mt-0.5">Track all 5 areas. Build a legendary life.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] text-ink-muted uppercase tracking-wider">Today&apos;s Average</p>
            <p
              className="text-3xl font-black tabular-nums"
              style={{ color: scoreToColor(totalScore) }}
            >
              {totalScore}<span className="text-base font-normal text-ink-muted">/10</span>
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `${scoreToColor(totalScore)}20`, border: `1px solid ${scoreToColor(totalScore)}30` }}
          >
            <Sparkles size={22} style={{ color: scoreToColor(totalScore) }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score sliders */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Rate Today&apos;s Areas</h2>

          {AREAS.map(([key, cfg], i) => {
            const score = scores[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5"
                style={{ borderColor: `${cfg.color}20` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${cfg.color}15` }}
                    >
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-ink-primary">{cfg.label}</p>
                      <p className="text-xs font-medium" style={{ color: scoreToColor(score) }}>
                        {scoreToLabel(score)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjust(key, -1)}
                      className="w-8 h-8 rounded-lg bg-bg-hover hover:bg-bg-card flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span
                      className="text-2xl font-black w-12 text-center tabular-nums"
                      style={{ color: scoreToColor(score) }}
                    >
                      {score}
                    </span>
                    <button
                      onClick={() => adjust(key, 1)}
                      className="w-8 h-8 rounded-lg bg-bg-hover hover:bg-bg-card flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Track bar */}
                <div className="relative h-3 bg-bg-card rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    setScores((s) => ({ ...s, [key]: Math.max(1, Math.min(10, Math.round(pct * 10))) }));
                  }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${score * 10}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    style={{ background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})` }}
                  />
                  {/* Tick marks */}
                  <div className="absolute inset-0 flex items-center">
                    {Array.from({ length: 9 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-px h-full bg-bg-surface"
                        style={{ left: `${(i + 1) * 10}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setScores((s) => ({ ...s, [key]: n }))}
                      className={cn(
                        "w-6 h-5 flex items-center justify-center text-[9px] font-medium rounded transition-colors",
                        score === n ? "text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
                      )}
                      style={score === n ? { color: cfg.color } : {}}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Wins + Blockers */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-4"
            >
              <label className="text-xs font-semibold text-electric-green uppercase tracking-wider block mb-2">
                🏆 Today&apos;s Wins
              </label>
              <textarea
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="One win per line…"
                rows={4}
                className="w-full bg-transparent text-sm text-ink-secondary placeholder:text-ink-muted outline-none resize-none"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="glass rounded-2xl p-4"
            >
              <label className="text-xs font-semibold text-electric-red uppercase tracking-wider block mb-2">
                🚧 Blockers
              </label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="What slowed you down?"
                rows={4}
                className="w-full bg-transparent text-sm text-ink-secondary placeholder:text-ink-muted outline-none resize-none"
              />
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={handleSave}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all",
              saved
                ? "bg-electric-green/20 text-electric-green border border-electric-green/30"
                : "bg-accent hover:bg-accent-dim text-white shadow-glow-sm"
            )}
          >
            <Save size={16} />
            {saved ? "Saved! Keep winning 🔥" : "Save Today's Score"}
          </motion.button>
        </div>

        {/* Trend sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-accent-glow" />
              <h3 className="text-sm font-semibold text-ink-primary">7-Day Trend</h3>
            </div>

            {recentCheckins.length <= 1 && (
              <p className="text-xs text-ink-muted text-center py-4">
                Check in daily to see your trend
              </p>
            )}

            {recentCheckins.length > 1 && (
              <div className="space-y-3">
                {recentCheckins.map((c) => {
                  const avg = Math.round(Object.values(c.scores).reduce((a, b) => a + b, 0) / 5);
                  return (
                    <div key={c.date} className="flex items-center gap-3">
                      <span className="text-[10px] text-ink-muted font-mono w-12 shrink-0">
                        {format(new Date(c.date), "MMM d")}
                      </span>
                      <div className="flex-1 h-1.5 bg-bg-card rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${avg * 10}%`, background: scoreToColor(avg) }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold font-mono w-6 text-right"
                        style={{ color: scoreToColor(avg) }}
                      >
                        {avg}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Area breakdown */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-ink-primary mb-4">Today&apos;s Breakdown</h3>
            <div className="space-y-3">
              {AREAS.map(([key, cfg]) => {
                const score = scores[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-base">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className="h-2 bg-bg-card rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          animate={{ width: `${score * 10}%` }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          style={{ background: cfg.color }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold w-4 text-right" style={{ color: scoreToColor(score) }}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-bg-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted">Overall score</span>
                <span className="text-lg font-black" style={{ color: scoreToColor(totalScore) }}>
                  {totalScore}/10
                </span>
              </div>
              <p className="text-xs font-medium mt-0.5" style={{ color: scoreToColor(totalScore) }}>
                {scoreToLabel(totalScore)} — {totalScore >= 8 ? "You're crushing it!" : totalScore >= 6 ? "Solid progress." : "Push harder today."}
              </p>
            </div>
          </div>

          {/* Streak */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-ink-primary mb-3">Check-in Streak</h3>
            <div className="flex items-end gap-1">
              {Array.from({ length: 7 }, (_, i) => {
                const d = format(new Date(Date.now() - i * 86400000), "yyyy-MM-dd");
                const c = checkins.find((x) => x.date === d);
                const h = c ? Math.round(Object.values(c.scores).reduce((a, b) => a + b, 0) / 5) : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-md transition-all"
                      style={{
                        height: `${Math.max(8, h * 4)}px`,
                        background: c ? scoreToColor(h) : "#1e1e3a",
                        opacity: i === 0 ? 1 : 0.7,
                      }}
                    />
                    <span className="text-[8px] text-ink-muted font-mono">
                      {format(new Date(Date.now() - i * 86400000), "d")}
                    </span>
                  </div>
                );
              }).reverse()}
            </div>
            <p className="text-xs text-ink-muted mt-2">
              {checkins.length} day{checkins.length !== 1 ? "s" : ""} tracked total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

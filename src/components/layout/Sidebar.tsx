"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CalendarDays, CheckSquare, Users, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/delegation", label: "Delegate", icon: Users },
  { href: "/life", label: "Life Score", icon: Sparkles },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] flex-col z-40 border-r border-bg-border bg-bg-surface">
        <div className="px-5 py-6 border-b border-bg-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center"
              style={{ boxShadow: "0 0 16px rgba(124,58,237,0.5)" }}>
              <Zap size={16} className="text-white fill-white" />
            </div>
            <div>
              <span className="font-black text-[15px] text-ink-primary tracking-tight">APEX</span>
              <p className="text-[9px] text-ink-muted font-semibold tracking-widest uppercase">Life OS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link key={href} href={href}>
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                    active ? "text-ink-primary" : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
                  )}
                  style={active ? { background: "rgba(124,58,237,0.12)" } : {}}
                >
                  {active && (
                    <motion.div layoutId="nav-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: "#a855f7" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={16} className={active ? "text-accent-glow" : "text-ink-muted"} />
                  <span>{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-bg-border">
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <p className="text-[9px] text-ink-muted font-semibold uppercase tracking-widest">Mode</p>
            <p className="text-xs text-accent-glow font-medium mt-0.5">Top 0.1% 🔥</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile top header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(8,8,15,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1e1e3a" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center"
            style={{ boxShadow: "0 0 12px rgba(124,58,237,0.5)" }}>
            <Zap size={13} className="text-white fill-white" />
          </div>
          <span className="font-black text-[14px] text-ink-primary">APEX</span>
        </div>
        <span className="text-[10px] text-accent-glow font-semibold uppercase tracking-widest">Top 0.1% 🔥</span>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ background: "rgba(8,8,15,0.95)", backdropFilter: "blur(24px)", borderTop: "1px solid #1e1e3a" }}>
        <div className="flex items-center justify-around px-1 py-2 pb-safe">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link key={href} href={href} className="flex-1">
                <motion.div whileTap={{ scale: 0.85 }}
                  className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-xl relative"
                >
                  {active && (
                    <motion.div layoutId="mobile-active"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "rgba(124,58,237,0.15)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={22} className={active ? "text-accent-glow" : "text-ink-muted"} />
                  <span className={cn(
                    "text-[9px] font-semibold z-10",
                    active ? "text-accent-glow" : "text-ink-muted"
                  )}>
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

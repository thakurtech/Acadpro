"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CalendarDays, CheckSquare, Users, Sparkles, Zap } from "lucide-react";

const NAV = [
  { href: "/",           label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner",    label: "Planner",   icon: CalendarDays   },
  { href: "/tasks",      label: "Tasks",     icon: CheckSquare    },
  { href: "/delegation", label: "Delegate",  icon: Users          },
  { href: "/life",       label: "Life Score",icon: Sparkles       },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-40"
        style={{
          background: "rgba(8,8,12,0.92)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          borderRight: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#5e5ce6)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.45)",
              }}
            >
              <Zap size={17} className="text-white fill-white" />
            </div>
            <div>
              <p className="font-black text-base tracking-tight" style={{ color: "rgba(255,255,255,0.95)" }}>APEX</p>
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Life OS</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link key={href} href={href}>
                <motion.div whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-colors"
                  style={{
                    background: active ? "rgba(124,58,237,0.15)" : "transparent",
                    color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {active && (
                    <motion.div layoutId="sidebar-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                      style={{ background: "#bf5af2" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon size={16}
                    style={{ color: active ? "#bf5af2" : "rgba(255,255,255,0.35)" }}
                    className="shrink-0"
                  />
                  <span className="text-sm font-semibold">{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom badge */}
        <div className="p-4 pb-6">
          <div className="rounded-2xl px-4 py-3"
            style={{ background: "rgba(124,58,237,0.08)", border: "0.5px solid rgba(124,58,237,0.2)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(191,90,242,0.7)" }}>Mode</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>Top 0.1% 🔥</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile header ───────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-4"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5e5ce6)", boxShadow: "0 2px 10px rgba(124,58,237,0.5)" }}>
            <Zap size={15} className="text-white fill-white" />
          </div>
          <span className="font-black text-[15px]" style={{ color: "rgba(255,255,255,0.95)" }}>APEX</span>
        </div>
        <span className="text-[11px] font-bold" style={{ color: "rgba(191,90,242,0.8)" }}>Top 0.1% 🔥</span>
      </header>

      {/* ── Mobile tab bar ──────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50"
        style={{
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          borderTop: "0.5px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center px-2 pt-2 pb-safe">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link key={href} href={href} className="flex-1">
                <motion.div whileTap={{ scale: 0.85 }}
                  className="flex flex-col items-center gap-1 py-1.5 rounded-2xl relative"
                >
                  {active && (
                    <motion.div layoutId="tab-bg"
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: "rgba(124,58,237,0.15)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon size={22} style={{ color: active ? "#bf5af2" : "rgba(255,255,255,0.3)", zIndex: 1 }} />
                  <span className="text-[10px] font-semibold z-10"
                    style={{ color: active ? "#bf5af2" : "rgba(255,255,255,0.3)" }}>
                    {label.split(" ")[0]}
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

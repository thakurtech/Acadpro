"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Users,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Day Planner", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/delegation", label: "Delegation", icon: Users },
  { href: "/life", label: "Life Score", icon: Sparkles },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col z-40 border-r border-bg-border bg-bg-surface">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <div>
            <span className="font-bold text-[15px] text-ink-primary tracking-tight">APEX</span>
            <p className="text-[10px] text-ink-muted font-medium tracking-widest uppercase">Life OS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group",
                  active
                    ? "bg-accent/15 text-ink-primary"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={16}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-accent-glow" : "text-ink-muted group-hover:text-ink-secondary"
                  )}
                />
                <span className="truncate">{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="px-4 py-4 border-t border-bg-border">
        <div className="glass rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-ink-muted font-medium uppercase tracking-wider">Today&apos;s focus</p>
          <p className="text-xs text-ink-secondary mt-0.5">Top 0.1% mode 🔥</p>
        </div>
      </div>
    </aside>
  );
}

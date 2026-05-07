"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, CalendarDays, CheckSquare, Users, Sparkles, Plus } from "lucide-react";

const COMMANDS = [
  { id: "dash", label: "Go to Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "plan", label: "Go to Day Planner", icon: CalendarDays, href: "/planner" },
  { id: "tasks", label: "Go to Tasks", icon: CheckSquare, href: "/tasks" },
  { id: "del", label: "Go to Delegation", icon: Users, href: "/delegation" },
  { id: "life", label: "Go to Life Score", icon: Sparkles, href: "/life" },
  { id: "new-task", label: "Quick add task", icon: Plus, href: "/tasks?new=1" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const toggle = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((v) => !v);
      setQuery("");
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", toggle);
    return () => window.removeEventListener("keydown", toggle);
  }, [toggle]);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const select = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-glow-lg border border-accent/20">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-bg-border">
                <Search size={16} className="text-ink-muted shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands…"
                  className="flex-1 bg-transparent text-ink-primary placeholder:text-ink-muted text-sm outline-none"
                />
                <kbd className="text-[10px] text-ink-muted bg-bg-card px-1.5 py-0.5 rounded border border-bg-border font-mono">ESC</kbd>
              </div>
              <div className="py-2 max-h-64 overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="text-center text-ink-muted text-sm py-6">No commands found</p>
                )}
                {filtered.map((cmd, i) => (
                  <motion.button
                    key={cmd.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => select(cmd.href)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-hover transition-colors text-left group"
                  >
                    <cmd.icon size={15} className="text-ink-muted group-hover:text-accent-glow transition-colors" />
                    {cmd.label}
                  </motion.button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-bg-border">
                <p className="text-[10px] text-ink-muted">
                  <kbd className="font-mono bg-bg-card px-1 py-0.5 rounded border border-bg-border mr-1">↑↓</kbd>
                  navigate
                  <kbd className="font-mono bg-bg-card px-1 py-0.5 rounded border border-bg-border mx-1 ml-3">↵</kbd>
                  select
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

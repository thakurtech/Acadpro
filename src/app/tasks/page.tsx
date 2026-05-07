"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, AREA_CONFIG, PRIORITY_CONFIG, type Priority, type LifeArea, type TaskStatus } from "@/store/useAppStore";
import { Plus, Zap, CheckCircle2, Circle, Inbox, Clock, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";


type Filter = "all" | TaskStatus;
const FILTERS: { id:Filter; label:string }[] = [
  { id:"all",   label:"All"   },
  { id:"today", label:"Today" },
  { id:"inbox", label:"Inbox" },
  { id:"done",  label:"Done"  },
];
type NewTask = { title:string; priority:Priority; area:LifeArea; status:TaskStatus };
const EMPTY: NewTask = { title:"", priority:"high", area:"work", status:"today" };

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useAppStore();
  const [filter, setFilter]       = useState<Filter>("all");
  const [areaF,  setAreaF]        = useState<LifeArea|"all">("all");
  const [adding, setAdding]       = useState(false);
  const [form,   setForm]         = useState<NewTask>(EMPTY);
  const [quick,  setQuick]        = useState("");
  const [swipeId, setSwipeId]     = useState<string|null>(null);

  const filtered = tasks
    .filter(t => (filter==="all"||t.status===filter) && (areaF==="all"||t.area===areaF))
    .sort((a,b)=>{
      const po={critical:0,high:1,medium:2,low:3};
      const so={today:0,inbox:1,done:2};
      if(a.status!==b.status) return so[a.status]-so[b.status];
      return po[a.priority]-po[b.priority];
    });

  const counts = { all:tasks.length, today:tasks.filter(t=>t.status==="today").length, inbox:tasks.filter(t=>t.status==="inbox").length, done:tasks.filter(t=>t.status==="done").length };

  const quickAdd = () => {
    if(!quick.trim()) return;
    addTask({ title:quick.trim(), priority:"high", area:"work", status:"today" });
    setQuick(""); toast.success("Captured ⚡");
  };

  const handleAdd = () => {
    if(!form.title.trim()) { toast.error("Add a title"); return; }
    addTask(form); setAdding(false); setForm(EMPTY); toast.success("Task added");
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-black tracking-tight" style={{ color:"rgba(255,255,255,0.95)" }}>Tasks</h1>
          <p className="text-[13px] font-medium mt-0.5" style={{ color:"rgba(255,255,255,0.35)" }}>Capture fast, execute faster</p>
        </div>
        <button onClick={()=>setAdding(true)} className="btn-accent w-10 h-10 md:w-auto md:px-4 flex items-center justify-center gap-2 text-[13px]">
          <Plus size={16} />
          <span className="hidden md:inline">New Task</span>
        </button>
      </div>

      {/* Quick capture */}
      <div className="card mb-4 flex items-center gap-3 px-4 py-3.5"
        style={{ borderLeft:"3px solid #7c3aed" }}>
        <Zap size={16} style={{ color:"#bf5af2" }} className="shrink-0" />
        <input value={quick} onChange={e=>setQuick(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&quickAdd()}
          placeholder="Quick capture — press Enter…"
          className="flex-1 bg-transparent text-[14px] font-medium placeholder:font-normal outline-none"
          style={{ color:"rgba(255,255,255,0.88)", caretColor:"#bf5af2" }}
        />
        <AnimatePresence>
          {quick && (
            <motion.button initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              onClick={quickAdd} className="text-[12px] font-bold shrink-0" style={{ color:"#bf5af2" }}>
              Add →
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex p-1 rounded-2xl gap-0.5" style={{ background:"rgba(255,255,255,0.05)" }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={()=>setFilter(f.id)}
              className="px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all flex items-center gap-1.5"
              style={filter===f.id
                ? { background:"#7c3aed", color:"#fff", boxShadow:"0 2px 8px rgba(124,58,237,0.4)" }
                : { color:"rgba(255,255,255,0.35)" }}>
              {f.label}
              <span className="text-[10px] font-mono opacity-60">{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Area filter */}
      <div className="flex gap-2 overflow-x-auto no-scroll mb-5 pb-1">
        <button onClick={()=>setAreaF("all")}
          className="px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all"
          style={areaF==="all"?{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.8)"}:{color:"rgba(255,255,255,0.3)"}}>
          All areas
        </button>
        {(Object.entries(AREA_CONFIG) as [LifeArea,(typeof AREA_CONFIG)[LifeArea]][]).map(([key,cfg])=>(
          <button key={key} onClick={()=>setAreaF(areaF===key?"all":key)}
            className="px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all"
            style={areaF===key
              ? { background:`${AREA_CONFIG[key].color}18`, color:AREA_CONFIG[key].color, border:`0.5px solid ${AREA_CONFIG[key].color}35` }
              : { color:"rgba(255,255,255,0.3)" }}>
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="card overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filtered.map((task, i) => (
            <motion.div key={task.id} layout
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-30, height:0 }}
              transition={{ delay:i*0.025 }}
              className={`flex items-center gap-4 px-5 py-3.5 divider last:border-0 relative group ${task.status!=="done"?"hover:bg-white/[0.025]":""} transition-colors cursor-default`}
              onMouseEnter={()=>setSwipeId(task.id)} onMouseLeave={()=>setSwipeId(null)}
            >
              <button onClick={()=>task.status!=="done"&&completeTask(task.id)} className="shrink-0 transition-transform active:scale-90">
                {task.status==="done"
                  ? <CheckCircle2 size={22} style={{ color:"#30d158" }} />
                  : <Circle size={22} style={{ color:PRIORITY_CONFIG[task.priority].color, opacity:0.7 }} />
                }
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-semibold truncate ${task.status==="done"?"line-through":""}`}
                  style={{ color:task.status==="done"?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.88)" }}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                    style={{ background:`${PRIORITY_CONFIG[task.priority].color}14`, color:PRIORITY_CONFIG[task.priority].color }}>
                    {PRIORITY_CONFIG[task.priority].label}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background:AREA_CONFIG[task.area].color }} />
                  <span className="text-[11px] font-medium" style={{ color:"rgba(255,255,255,0.3)" }}>
                    {AREA_CONFIG[task.area].label}
                  </span>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 transition-opacity ${swipeId===task.id?"opacity-100":"opacity-0"}`}>
                {task.status==="inbox" && (
                  <button onClick={()=>{updateTask(task.id,{status:"today"});toast.success("→ Today");}}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors"
                    style={{ background:"rgba(124,58,237,0.15)", color:"#bf5af2" }}>
                    Today
                  </button>
                )}
                <button onClick={()=>{deleteTask(task.id);toast.success("Deleted");}}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-red-500/15">
                  <Trash2 size={14} style={{ color:"rgba(255,255,255,0.3)" }} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length===0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="py-16 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{ background:"rgba(124,58,237,0.08)" }}>
              <CheckCircle2 size={28} style={{ color:"rgba(191,90,242,0.5)" }} />
            </div>
            <p className="text-[15px] font-semibold" style={{ color:"rgba(255,255,255,0.4)" }}>All clear</p>
            <p className="text-[13px] mt-1" style={{ color:"rgba(255,255,255,0.2)" }}>Nothing in this view</p>
          </motion.div>
        )}
      </div>

      {/* Add sheet */}
      <AnimatePresence>
        {adding && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
              onClick={()=>setAdding(false)} />
            <motion.div
              initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", stiffness:420, damping:40 }}
              className="fixed bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[440px] z-50 sheet rounded-t-[28px] md:rounded-[24px] p-6"
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6 md:hidden" style={{ background:"rgba(255,255,255,0.15)" }} />
              <div className="flex items-center justify-between mb-6">
                <p className="text-[17px] font-bold" style={{ color:"rgba(255,255,255,0.92)" }}>New Task</p>
                <button onClick={()=>setAdding(false)} className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background:"rgba(255,255,255,0.06)" }}>
                  <X size={15} style={{ color:"rgba(255,255,255,0.5)" }} />
                </button>
              </div>
              <div className="space-y-4">
                <input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                  onKeyDown={e=>e.key==="Enter"&&handleAdd()}
                  placeholder="What needs to get done?"
                  className="w-full rounded-2xl px-4 py-3.5 text-[15px] font-medium placeholder:font-normal outline-none"
                  style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.9)", border:"0.5px solid rgba(255,255,255,0.1)" }}
                />
                <div>
                  <p className="label-caps mb-3">Priority</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.entries(PRIORITY_CONFIG) as [Priority,(typeof PRIORITY_CONFIG)[Priority]][]).map(([key,cfg])=>(
                      <button key={key} onClick={()=>setForm({...form,priority:key})}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[12px] font-bold transition-all"
                        style={form.priority===key
                          ? { background:`${PRIORITY_CONFIG[key].color}20`, color:PRIORITY_CONFIG[key].color, border:`0.5px solid ${PRIORITY_CONFIG[key].color}35` }
                          : { background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.35)" }}>
                        <div className="w-2 h-2 rounded-full" style={{ background:PRIORITY_CONFIG[key].color }} />
                        <span className="hidden sm:inline">{cfg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="label-caps mb-3">Status</p>
                    <div className="space-y-2">
                      {(["today","inbox"] as TaskStatus[]).map(s=>(
                        <button key={s} onClick={()=>setForm({...form,status:s})}
                          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all"
                          style={form.status===s
                            ? { background:"rgba(124,58,237,0.15)", color:"#bf5af2", border:"0.5px solid rgba(124,58,237,0.3)" }
                            : { background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.35)" }}>
                          {s==="today"?<Clock size={14}/>:<Inbox size={14}/>}
                          {s==="today"?"Today":"Inbox"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="label-caps mb-3">Area</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.entries(AREA_CONFIG) as [LifeArea,(typeof AREA_CONFIG)[LifeArea]][]).map(([key,cfg])=>(
                        <button key={key} onClick={()=>setForm({...form,area:key})}
                          className="flex items-center justify-center py-3 rounded-2xl text-[16px] transition-all"
                          style={form.area===key
                            ? { background:`${AREA_CONFIG[key].color}18`, border:`0.5px solid ${AREA_CONFIG[key].color}35` }
                            : { background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.08)" }}
                          title={cfg.label}>
                          {cfg.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleAdd} className="btn-accent w-full py-4 text-[15px]">Add Task</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

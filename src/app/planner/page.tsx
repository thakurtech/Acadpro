"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, subDays } from "date-fns";
import { useAppStore, AREA_CONFIG, type LifeArea } from "@/store/useAppStore";
import { formatHour } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, X, Check, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5);
type NewBlock = { startHour:number; title:string; area:LifeArea; durationHours:number };
const EMPTY: NewBlock = { startHour:9, title:"", area:"work", durationHours:1 };

export default function PlannerPage() {
  const { timeBlocks, addTimeBlock, deleteTimeBlock, toggleTimeBlock } = useAppStore();
  const [date, setDate] = useState(new Date());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<NewBlock>(EMPTY);

  const dateStr  = format(date, "yyyy-MM-dd");
  const isToday  = dateStr === format(new Date(), "yyyy-MM-dd");
  const blocks   = timeBlocks.filter(b => b.date === dateStr);
  const now      = new Date().getHours();
  const totalH   = blocks.reduce((s,b)=>s+b.durationHours,0);
  const doneH    = blocks.filter(b=>b.isCompleted).reduce((s,b)=>s+b.durationHours,0);

  const handleAdd = () => {
    if (!form.title.trim()) { toast.error("Add a title"); return; }
    addTimeBlock({ date:dateStr, ...form, color:AREA_CONFIG[form.area].color, isCompleted:false });
    setAdding(false); setForm(EMPTY);
    toast.success("Block added");
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-black tracking-tight" style={{ color:"rgba(255,255,255,0.95)" }}>Day Planner</h1>
          <p className="text-[13px] font-medium mt-0.5" style={{ color:"rgba(255,255,255,0.35)" }}>Time-box every hour</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-2xl overflow-hidden"
            style={{ background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.08)" }}>
            <button onClick={()=>setDate(subDays(date,1))} className="px-3 py-2.5 transition-colors hover:bg-white/5">
              <ChevronLeft size={15} style={{ color:"rgba(255,255,255,0.5)" }} />
            </button>
            <button onClick={()=>setDate(new Date())}
              className="px-3 py-2 text-[13px] font-bold min-w-[52px] text-center transition-all"
              style={{ color: isToday ? "#bf5af2" : "rgba(255,255,255,0.6)" }}>
              {isToday ? "Today" : format(date,"MMM d")}
            </button>
            <button onClick={()=>setDate(addDays(date,1))} className="px-3 py-2.5 transition-colors hover:bg-white/5">
              <ChevronRight size={15} style={{ color:"rgba(255,255,255,0.5)" }} />
            </button>
          </div>
          <button onClick={()=>{ setAdding(true); setForm(EMPTY); }}
            className="btn-accent w-10 h-10 md:w-auto md:px-4 flex items-center justify-center gap-2 text-[13px]">
            <Plus size={16} />
            <span className="hidden md:inline">Add Block</span>
          </button>
        </div>
      </div>

      {/* Progress card */}
      <div className="card p-5 mb-5 flex items-center gap-5">
        {[
          { label:"Scheduled", value:`${totalH}h`, color:"rgba(255,255,255,0.6)" },
          { label:"Done",      value:`${doneH}h`,  color:"#30d158" },
          { label:"Remaining", value:`${totalH-doneH}h`, color:"#7c3aed" },
        ].map((s,i) => (
          <div key={s.label} className={i>0?"border-l pl-5":""}
            style={{ borderColor:"rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.3)" }}>{s.label}</p>
            <p className="text-[22px] font-black mt-0.5 leading-none" style={{ color:s.color }}>{s.value}</p>
          </div>
        ))}
        <div className="flex-1 ml-2">
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full progress-bar"
              style={{ width:totalH>0?`${(doneH/totalH)*100}%`:"0%", background:"linear-gradient(90deg,#7c3aed,#0a84ff)" }} />
          </div>
          <p className="text-[11px] font-mono mt-1.5 text-right" style={{ color:"rgba(255,255,255,0.25)" }}>
            {totalH>0?Math.round((doneH/totalH)*100):0}%
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="card overflow-hidden">
        {HOURS.map((hour) => {
          const blockStart = blocks.find(b => b.startHour === hour);
          const isContinue = !blockStart && blocks.some(b => hour > b.startHour && hour < b.startHour+b.durationHours);
          const isNow = isToday && now === hour;

          if (isContinue) return null;

          return (
            <div key={hour}
              className="relative flex divider last:border-0 group/row"
              style={{ minHeight: blockStart ? `${blockStart.durationHours * 60}px` : "56px" }}>

              {isNow && (
                <div className="absolute top-0 left-0 right-0 h-px z-20"
                  style={{ background:"#bf5af2", boxShadow:"0 0 8px rgba(191,90,242,0.8)" }} />
              )}

              {/* Hour */}
              <div className="w-16 shrink-0 flex items-start justify-end pr-4 pt-4">
                <span className="text-[11px] font-semibold tabular-nums"
                  style={{ color: isNow?"#bf5af2":"rgba(255,255,255,0.2)" }}>
                  {formatHour(hour)}
                </span>
              </div>

              {/* Block or empty slot */}
              <div className="flex-1 py-1.5 pr-2 relative">
                {blockStart ? (
                  <motion.div
                    initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
                    className="absolute inset-1 rounded-2xl px-4 py-3 cursor-pointer group/block"
                    style={{
                      background:`linear-gradient(135deg,${blockStart.color}1a,${blockStart.color}0d)`,
                      border:`0.5px solid ${blockStart.color}30`,
                      opacity: blockStart.isCompleted ? 0.45 : 1,
                    }}
                    onClick={() => toggleTimeBlock(blockStart.id)}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background:blockStart.color }} />
                          <p className={`text-[14px] font-bold truncate ${blockStart.isCompleted?"line-through":""}`}
                            style={{ color: blockStart.isCompleted?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.92)" }}>
                            {blockStart.title}
                          </p>
                        </div>
                        <p className="text-[11px] font-medium ml-4 mt-0.5"
                          style={{ color:"rgba(255,255,255,0.3)" }}>
                          {AREA_CONFIG[blockStart.area].label} · {blockStart.durationHours}h
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity shrink-0 ml-2">
                        <button onClick={e=>{e.stopPropagation();toggleTimeBlock(blockStart.id);}}
                          className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10">
                          <Check size={13} style={{ color:blockStart.color }} />
                        </button>
                        <button onClick={e=>{e.stopPropagation();deleteTimeBlock(blockStart.id);toast.success("Removed");}}
                          className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors hover:bg-red-500/15">
                          <Trash2 size={13} style={{ color:"rgba(255,255,255,0.35)" }} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={()=>{ setAdding(true); setForm({...EMPTY,startHour:hour}); }}
                    className="w-full h-10 rounded-2xl flex items-center justify-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-all"
                    style={{ border:"0.5px dashed rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.25)" }}>
                    <Plus size={12} />
                    <span className="text-[11px] font-medium">{formatHour(hour)}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
                <p className="text-[17px] font-bold" style={{ color:"rgba(255,255,255,0.92)" }}>New Time Block</p>
                <button onClick={()=>setAdding(false)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/8"
                  style={{ background:"rgba(255,255,255,0.06)" }}>
                  <X size={15} style={{ color:"rgba(255,255,255,0.5)" }} />
                </button>
              </div>
              <div className="space-y-4">
                <input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                  onKeyDown={e=>e.key==="Enter"&&handleAdd()}
                  placeholder="What are you doing?"
                  className="w-full rounded-2xl px-4 py-3.5 text-[15px] font-medium placeholder:font-normal outline-none transition-all"
                  style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.9)", border:"0.5px solid rgba(255,255,255,0.1)" }}
                />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Start time", key:"startHour" as const, options:HOURS.map(h=>({ value:h, label:formatHour(h) })) },
                    { label:"Duration", key:"durationHours" as const, options:[0.5,1,1.5,2,2.5,3,4].map(h=>({ value:h, label:`${h}h` })) },
                  ].map(sel => (
                    <div key={sel.key}>
                      <p className="label-caps mb-2">{sel.label}</p>
                      <select value={form[sel.key]} onChange={e=>setForm({...form,[sel.key]:+e.target.value})}
                        className="w-full rounded-2xl px-4 py-3 text-[14px] font-medium outline-none"
                        style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.88)", border:"0.5px solid rgba(255,255,255,0.1)" }}>
                        {sel.options.map(o=><option key={o.value} value={o.value} className="bg-[#1c1c22]">{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="label-caps mb-3">Life Area</p>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.entries(AREA_CONFIG) as [LifeArea,(typeof AREA_CONFIG)[LifeArea]][]).map(([key,cfg]) => (
                      <button key={key} onClick={()=>setForm({...form,area:key})}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all"
                        style={form.area===key
                          ? { background:`${AREA_CONFIG[key].color}18`, border:`0.5px solid ${AREA_CONFIG[key].color}40` }
                          : { background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.08)" }}>
                        <span className="text-[18px]">{cfg.icon}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color:form.area===key?AREA_CONFIG[key].color:"rgba(255,255,255,0.3)" }}>
                          {cfg.label.slice(0,4)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleAdd} className="btn-accent w-full py-4 text-[15px]">Add Time Block</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

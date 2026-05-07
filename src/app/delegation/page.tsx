"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAppStore, AREA_CONFIG, type DelegationStatus, type LifeArea, type DelegationItem } from "@/store/useAppStore";
import { Plus, X, AlertCircle, Clock, CheckCircle2, ArrowRight, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const AREA_COLORS: Record<LifeArea,string> = { work:"#7c3aed", relationships:"#ff375f", health:"#30d158", finance:"#ffd60a", growth:"#0a84ff" };
const STATUS_CFG: Record<DelegationStatus,{label:string;color:string;icon:React.ElementType}> = {
  delegated:    { label:"Delegated",   color:"#0a84ff", icon:ArrowRight   },
  "in-progress":{ label:"In Progress", color:"#ffd60a", icon:RefreshCw   },
  waiting:      { label:"Waiting",     color:"#ff9f0a", icon:Clock        },
  done:         { label:"Done",        color:"#30d158", icon:CheckCircle2 },
};
const COLS: DelegationStatus[] = ["delegated","in-progress","waiting","done"];
type NewDel = { title:string; delegatedTo:string; status:DelegationStatus; dueDate:string; area:LifeArea };
const EMPTY: NewDel = { title:"", delegatedTo:"", status:"delegated", dueDate:format(new Date(),"yyyy-MM-dd"), area:"work" };

function Card({ item, today, updateDelegation, deleteDelegation }: {
  item:DelegationItem; today:string;
  updateDelegation:(id:string,u:Partial<DelegationItem>)=>void;
  deleteDelegation:(id:string)=>void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[item.status];
  const overdue = item.dueDate < today && item.status !== "done";

  return (
    <motion.div layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
      className="rounded-3xl p-4 group cursor-pointer"
      style={{ background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.08)" }}
      onClick={()=>setOpen(!open)}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background:`${cfg.color}14` }}>
          <cfg.icon size={14} style={{ color:cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-semibold leading-snug ${item.status==="done"?"line-through":""}`}
            style={{ color:item.status==="done"?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.9)" }}>
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)" }}>
              {item.delegatedTo.charAt(0).toUpperCase()}
            </div>
            <span className="text-[12px] font-medium truncate" style={{ color:"rgba(255,255,255,0.4)" }}>{item.delegatedTo}</span>
            <div className="ml-auto flex items-center gap-1 shrink-0">
              {overdue && <AlertCircle size={11} style={{ color:"#ff453a" }} />}
              <span className={`text-[11px] font-bold font-mono`} style={{ color:overdue?"#ff453a":"rgba(255,255,255,0.3)" }}>
                {format(new Date(item.dueDate),"MMM d")}
              </span>
            </div>
          </div>
        </div>
        <button onClick={e=>{e.stopPropagation();deleteDelegation(item.id);toast.success("Removed");}}
          className="w-7 h-7 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/15 shrink-0">
          <Trash2 size={12} style={{ color:"rgba(255,255,255,0.35)" }} />
        </button>
      </div>

      <AnimatePresence>
        {open && item.status!=="done" && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            className="overflow-hidden">
            <div className="flex gap-1.5 mt-3 pt-3" style={{ borderTop:"0.5px solid rgba(255,255,255,0.06)" }}>
              {COLS.filter(s=>s!==item.status).map(s=>(
                <button key={s} onClick={e=>{e.stopPropagation();updateDelegation(item.id,{status:s});toast.success(`→ ${STATUS_CFG[s].label}`);}}
                  className="flex-1 py-2 rounded-2xl text-[11px] font-bold transition-colors"
                  style={{ background:`${STATUS_CFG[s].color}10`, color:STATUS_CFG[s].color }}>
                  {STATUS_CFG[s].label.split(" ")[0]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DelegationPage() {
  const { delegations, addDelegation, updateDelegation, deleteDelegation } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState<NewDel>(EMPTY);
  const [activeCol, setActiveCol] = useState<DelegationStatus>("delegated");
  const today = format(new Date(),"yyyy-MM-dd");

  const handleAdd = () => {
    if(!form.title.trim()) { toast.error("Add a title"); return; }
    if(!form.delegatedTo.trim()) { toast.error("Who are you delegating to?"); return; }
    addDelegation(form); setAdding(false); setForm(EMPTY); toast.success("Tracked!");
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-black tracking-tight" style={{ color:"rgba(255,255,255,0.95)" }}>Delegation</h1>
          <p className="text-[13px] font-medium mt-0.5" style={{ color:"rgba(255,255,255,0.35)" }}>Hand off, follow up, win</p>
        </div>
        <button onClick={()=>{setAdding(true);setForm(EMPTY);}} className="btn-accent w-10 h-10 md:w-auto md:px-4 flex items-center justify-center gap-2 text-[13px]">
          <Plus size={16}/><span className="hidden md:inline">Delegate</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {COLS.map(s => {
          const cfg = STATUS_CFG[s];
          const count = delegations.filter(d=>d.status===s).length;
          return (
            <div key={s} className="rounded-2xl p-4 text-center"
              style={{ background:"rgba(255,255,255,0.04)", border:`0.5px solid ${cfg.color}18` }}>
              <p className="text-[22px] font-black leading-none" style={{ color:cfg.color }}>{count}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide mt-1.5" style={{ color:"rgba(255,255,255,0.3)" }}>
                {cfg.label.split(" ")[0]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile tab bar */}
      <div className="flex md:hidden gap-1 p-1 rounded-2xl mb-4" style={{ background:"rgba(255,255,255,0.05)" }}>
        {COLS.map(s=>{
          const cfg=STATUS_CFG[s];
          return (
            <button key={s} onClick={()=>setActiveCol(s)}
              className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
              style={activeCol===s?{background:`${cfg.color}18`,color:cfg.color}:{color:"rgba(255,255,255,0.3)"}}>
              {cfg.label.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {/* Desktop kanban | Mobile single col */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {COLS.map(s=>(
          <KanbanCol key={s} status={s} items={delegations.filter(d=>d.status===s)}
            today={today} updateDelegation={updateDelegation} deleteDelegation={deleteDelegation} />
        ))}
      </div>
      <div className="md:hidden">
        <KanbanCol status={activeCol} items={delegations.filter(d=>d.status===activeCol)}
          today={today} updateDelegation={updateDelegation} deleteDelegation={deleteDelegation} />
      </div>

      {/* Add sheet */}
      <AnimatePresence>
        {adding && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-50" style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)"}}
              onClick={()=>setAdding(false)} />
            <motion.div
              initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
              transition={{type:"spring",stiffness:420,damping:40}}
              className="fixed bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[440px] z-50 sheet rounded-t-[28px] md:rounded-[24px] p-6"
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6 md:hidden" style={{background:"rgba(255,255,255,0.15)"}} />
              <div className="flex items-center justify-between mb-6">
                <p className="text-[17px] font-bold" style={{color:"rgba(255,255,255,0.92)"}}>Delegate a Task</p>
                <button onClick={()=>setAdding(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.06)"}}>
                  <X size={15} style={{color:"rgba(255,255,255,0.5)"}} />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  {placeholder:"What needs to be done?",key:"title" as const},
                  {placeholder:"Delegated to…",key:"delegatedTo" as const},
                ].map(f=>(
                  <input key={f.key} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                    placeholder={f.placeholder} autoFocus={f.key==="title"}
                    className="w-full rounded-2xl px-4 py-3.5 text-[15px] font-medium placeholder:font-normal outline-none"
                    style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.9)",border:"0.5px solid rgba(255,255,255,0.1)"}} />
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="label-caps mb-2">Due date</p>
                    <input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}
                      className="w-full rounded-2xl px-4 py-3 text-[14px] font-medium outline-none"
                      style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.88)",border:"0.5px solid rgba(255,255,255,0.1)"}} />
                  </div>
                  <div>
                    <p className="label-caps mb-2">Area</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.entries(AREA_CONFIG) as [LifeArea,(typeof AREA_CONFIG)[LifeArea]][]).map(([key,cfg])=>(
                        <button key={key} onClick={()=>setForm({...form,area:key})}
                          className="flex items-center justify-center py-3 rounded-2xl text-[16px] transition-all"
                          style={form.area===key?{background:`${AREA_COLORS[key]}18`,border:`0.5px solid ${AREA_COLORS[key]}35`}:{background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.08)"}}
                          title={cfg.label}>{cfg.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleAdd} className="btn-accent w-full py-4 text-[15px]">Track Delegation</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function KanbanCol({ status, items, today, updateDelegation, deleteDelegation }: {
  status:DelegationStatus; items:DelegationItem[]; today:string;
  updateDelegation:(id:string,u:Partial<DelegationItem>)=>void;
  deleteDelegation:(id:string)=>void;
}) {
  const cfg = STATUS_CFG[status];
  return (
    <div>
      <div className="hidden md:flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{background:cfg.color}} />
        <p className="text-[11px] font-black uppercase tracking-widest" style={{color:cfg.color}}>{cfg.label}</p>
        <span className="ml-auto text-[11px] font-mono" style={{color:"rgba(255,255,255,0.25)"}}>{items.length}</span>
      </div>
      <div className="space-y-2.5">
        <AnimatePresence>
          {items.map(item=>(
            <Card key={item.id} item={item} today={today} updateDelegation={updateDelegation} deleteDelegation={deleteDelegation} />
          ))}
        </AnimatePresence>
        {items.length===0&&(
          <div className="rounded-3xl py-8 text-center" style={{border:"0.5px dashed rgba(255,255,255,0.07)"}}>
            <p className="text-[12px]" style={{color:"rgba(255,255,255,0.2)"}}>Nothing here</p>
          </div>
        )}
      </div>
    </div>
  );
}

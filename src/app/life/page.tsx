"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAppStore, AREA_CONFIG, type LifeArea, type DailyCheckin } from "@/store/useAppStore";
import { scoreToColor, scoreToLabel } from "@/lib/utils";
import { Minus, Plus, Save, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const AREA_COLORS: Record<LifeArea,string> = { work:"#7c3aed", relationships:"#ff375f", health:"#30d158", finance:"#ffd60a", growth:"#0a84ff" };
const AREAS = Object.entries(AREA_CONFIG) as [LifeArea,(typeof AREA_CONFIG)[LifeArea]][];

export default function LifePage() {
  const { checkins, saveCheckin, getTodayCheckin } = useAppStore();
  const todayCheckin = getTodayCheckin();
  const today = format(new Date(),"yyyy-MM-dd");

  const [scores, setScores] = useState<Record<LifeArea,number>>({
    work:          todayCheckin?.scores.work          ?? 5,
    relationships: todayCheckin?.scores.relationships ?? 5,
    health:        todayCheckin?.scores.health        ?? 5,
    finance:       todayCheckin?.scores.finance       ?? 5,
    growth:        todayCheckin?.scores.growth        ?? 5,
  });
  const [wins,     setWins]     = useState(todayCheckin?.wins.join("\n")     ?? "");
  const [blockers, setBlockers] = useState(todayCheckin?.blockers.join("\n") ?? "");
  const [saved,    setSaved]    = useState(false);

  const avg = Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/5);

  const save = () => {
    const c: DailyCheckin = { date:today, scores, wins:wins.split("\n").filter(Boolean), blockers:blockers.split("\n").filter(Boolean) };
    saveCheckin(c); setSaved(true);
    toast.success("Saved! Keep winning 🔥");
    setTimeout(()=>setSaved(false),2500);
  };

  const adj = (area:LifeArea, d:number) =>
    setScores(s=>({...s,[area]:Math.max(1,Math.min(10,s[area]+d))}));

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-black tracking-tight" style={{color:"rgba(255,255,255,0.95)"}}>Life Score</h1>
          <p className="text-[13px] font-medium mt-0.5" style={{color:"rgba(255,255,255,0.35)"}}>Rate all 5 areas. Build a legendary life.</p>
        </div>
        <div className="text-right">
          <p className="label-caps mb-1">Average</p>
          <p className="text-[36px] font-black leading-none" style={{color:scoreToColor(avg)}}>{avg}</p>
          <p className="text-[11px] font-bold mt-1" style={{color:scoreToColor(avg)}}>{scoreToLabel(avg)}</p>
        </div>
      </div>

      {/* Score cards */}
      <div className="space-y-3 mb-5">
        {AREAS.map(([key,cfg],i)=>{
          const score = scores[key];
          const color = AREA_COLORS[key];
          return (
            <motion.div key={key}
              initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*0.07,type:"spring",stiffness:260,damping:22}}
              className="card p-5"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[20px] shrink-0"
                  style={{background:`${color}14`}}>
                  {cfg.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold" style={{color:"rgba(255,255,255,0.92)"}}>{cfg.label}</p>
                  <p className="text-[12px] font-semibold mt-0.5" style={{color:scoreToColor(score)}}>{scoreToLabel(score)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={()=>adj(key,-1)}
                    className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                    style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.08)"}}>
                    <Minus size={15} style={{color:"rgba(255,255,255,0.5)"}}/>
                  </button>
                  <span className="text-[26px] font-black w-8 text-center tabular-nums" style={{color:scoreToColor(score)}}>{score}</span>
                  <button onClick={()=>adj(key,1)}
                    className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                    style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.08)"}}>
                    <Plus size={15} style={{color:"rgba(255,255,255,0.5)"}}/>
                  </button>
                </div>
              </div>

              {/* Seek bar */}
              <div className="relative h-3 rounded-full overflow-hidden cursor-pointer mb-2"
                style={{background:"rgba(255,255,255,0.06)"}}
                onClick={e=>{
                  const r=e.currentTarget.getBoundingClientRect();
                  setScores(s=>({...s,[key]:Math.max(1,Math.min(10,Math.round(((e.clientX-r.left)/r.width)*10)))}));
                }}
              >
                <motion.div className="h-full rounded-full"
                  animate={{width:`${score*10}%`}}
                  transition={{type:"spring",stiffness:200,damping:20}}
                  style={{background:`linear-gradient(90deg,${color}80,${color})`}}
                />
                {/* Tick marks */}
                {[1,2,3,4,5,6,7,8,9].map(t=>(
                  <div key={t} className="absolute top-0 bottom-0 w-px" style={{left:`${t*10}%`,background:"rgba(0,0,0,0.3)"}} />
                ))}
              </div>

              {/* Number row */}
              <div className="flex justify-between">
                {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                  <button key={n} onClick={()=>setScores(s=>({...s,[key]:n}))}
                    className="flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all"
                    style={score===n?{color,background:`${color}14`}:{color:"rgba(255,255,255,0.2)"}}>
                    {n}
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Wins + Blockers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="card p-5">
          <p className="label-caps mb-3" style={{color:"rgba(48,209,88,0.7)"}}>🏆 Today&apos;s Wins</p>
          <textarea value={wins} onChange={e=>setWins(e.target.value)}
            placeholder="One win per line…" rows={3}
            className="w-full bg-transparent text-[14px] font-medium placeholder:font-normal outline-none resize-none"
            style={{color:"rgba(255,255,255,0.75)",caretColor:"#30d158"}}
          />
        </div>
        <div className="card p-5">
          <p className="label-caps mb-3" style={{color:"rgba(255,69,58,0.7)"}}>🚧 Blockers</p>
          <textarea value={blockers} onChange={e=>setBlockers(e.target.value)}
            placeholder="What slowed you down?" rows={3}
            className="w-full bg-transparent text-[14px] font-medium placeholder:font-normal outline-none resize-none"
            style={{color:"rgba(255,255,255,0.75)",caretColor:"#ff453a"}}
          />
        </div>
      </div>

      {/* Save */}
      <motion.button onClick={save} whileTap={{scale:0.97}}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-3xl text-[16px] font-black transition-all mb-8"
        style={saved
          ? {background:"rgba(48,209,88,0.1)",color:"#30d158",border:"0.5px solid rgba(48,209,88,0.25)"}
          : {background:"linear-gradient(135deg,#7c3aed,#5e5ce6)",color:"#fff",boxShadow:"0 4px 24px rgba(124,58,237,0.4)"}
        }
      >
        <Save size={18}/>
        {saved ? "Saved! Keep winning 🔥" : "Save Today's Score"}
      </motion.button>

      {/* 7-day chart */}
      <AnimatePresence>
        {checkins.length > 1 && (
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="card p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} style={{color:"rgba(191,90,242,0.8)"}}/>
              <p className="text-[15px] font-bold" style={{color:"rgba(255,255,255,0.88)"}}>7-Day Trend</p>
            </div>
            <div className="flex items-end gap-2" style={{height:"80px"}}>
              {Array.from({length:7},(_,i)=>{
                const d=format(new Date(Date.now()-(6-i)*86400000),"yyyy-MM-dd");
                const c=checkins.find(x=>x.date===d);
                const a=c?Math.round(Object.values(c.scores).reduce((s,v)=>s+v,0)/5):0;
                const isT=d===today;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full rounded-xl transition-all"
                      style={{
                        height:`${Math.max(6,a*7.2)}px`,
                        background:c?scoreToColor(a):"rgba(255,255,255,0.06)",
                        opacity:isT?1:0.6,
                        boxShadow:isT&&c?`0 0 12px ${scoreToColor(a)}60`:"none",
                      }}
                    />
                    <span className="text-[9px] font-semibold font-mono" style={{color:isT?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)"}}>
                      {format(new Date(Date.now()-(6-i)*86400000),"d")}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4" style={{borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
              <p className="text-[12px] font-medium" style={{color:"rgba(255,255,255,0.3)"}}>
                {checkins.length} day{checkins.length!==1?"s":""} tracked
              </p>
              <div className="flex gap-1.5">
                {AREAS.map(([key,cfg])=>(
                  <div key={key} className="w-2 h-2 rounded-full" style={{background:AREA_COLORS[key]}} title={cfg.label} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

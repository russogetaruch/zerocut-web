"use client";

import { motion } from "framer-motion";
import { Activity, Clock } from "lucide-react";

export function PerformanceMonitor() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart Card */}
         <div className="lg:col-span-2 bg-[#080808] border border-[#1a1a1a] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] -mr-10 -mt-10 pointer-events-none group-hover:opacity-[0.05] transition-all">
               <Activity size={180} />
            </div>
            
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="font-mono text-[10px] text-primary tracking-[0.3em] uppercase mb-1">Performance_Sistema</h3>
                  <p className="text-lg font-serif font-bold text-white tracking-wide">Faturamento da Semana</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-zinc-600 font-mono tracking-tighter uppercase">Media.Movel</p>
                  <p className="text-sm font-mono text-zinc-300">R$ 1.240,43</p>
               </div>
            </div>

            {/* Simulated CSS Mini Chart */}
            <div className="flex items-end justify-between h-32 gap-2 mt-4">
               {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                     <div 
                        className="w-full bg-zinc-900 rounded-t-lg transition-all duration-1000 origin-bottom group-hover/bar:bg-primary/40 relative overflow-hidden h-full flex flex-col justify-end"
                     >
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                          className="w-full bg-gradient-to-t from-primary/10 to-primary/40" 
                        />
                     </div>
                     <span className="text-[9px] text-zinc-700 font-mono tracking-tighter uppercase">Dia.{i+1}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Stats Cards */}
         <div className="flex flex-col gap-6">
            <div className="flex-1 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col justify-between group cursor-help transition-all hover:bg-primary/10">
               <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                     <Activity size={18} />
                  </div>
                  <span className="text-[10px] text-primary/60 font-mono tracking-widest uppercase">Meta.Atingida</span>
               </div>
               <div>
                  <p className="text-4xl font-mono font-black text-white mb-1">94%</p>
                  <p className="text-[10px] text-primary/70 font-mono tracking-widest uppercase">Conversão Agendados</p>
               </div>
            </div>
            
            <div className="flex-1 bg-[#080808] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col justify-between hover:border-[#222] transition-all">
               <div className="flex justify-between items-start">
                  <div className="p-3 bg-zinc-900 rounded-xl text-zinc-500 border border-zinc-800">
                     <Clock size={18} />
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Tempo.Medio</span>
               </div>
               <div>
                  <p className="text-4xl font-mono font-black text-white mb-1">42min</p>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Tempo Médio de Corte</p>
               </div>
            </div>
         </div>
      </div>
  );
}

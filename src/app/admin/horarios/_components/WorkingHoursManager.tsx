"use client";

import { useState } from "react";
import { Save, Clock, Moon, Sun, AlertCircle } from "lucide-react";
import { updateWorkingHours } from "../actions";

const DAYS = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
];

export default function WorkingHoursManager({ initialHours, tenantId }: { initialHours: any[], tenantId: string }) {
  const [hours, setHours] = useState(initialHours);
  const [isSaving, setIsSaving] = useState(false);

  const toggleClosed = (index: number) => {
    const newHours = [...hours];
    newHours[index].is_closed = !newHours[index].is_closed;
    setHours(newHours);
  };

  const updateTime = (index: number, field: 'open_time' | 'close_time', value: string) => {
    const newHours = [...hours];
    newHours[index][field] = value;
    setHours(newHours);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateWorkingHours(tenantId, hours);
    setIsSaving(false);
    if (!result.error) {
       alert("Horários salvos com sucesso!");
    } else {
       alert("Erro ao salvar: " + result.error);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-[2.5rem] overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-[#1a1a1a] flex justify-between items-center bg-black/40">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/20 rounded-lg">
                  <Sun size={18} className="text-primary" />
               </div>
               <h3 className="text-white font-bold tracking-tight">Grade Semanal</h3>
            </div>
            <button 
              disabled={isSaving}
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-black font-black text-[10px] tracking-widest uppercase rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
               {isSaving ? "SINCRONIZANDO..." : "SALVAR_GRADE"}
            </button>
         </div>

         <div className="divide-y divide-[#151515]">
            {DAYS.map((day, index) => {
               const dayHours = hours.find(h => h.day_of_week === index) || { open_time: '09:00', close_time: '19:00', is_closed: false };
               
               return (
                  <div key={day} className={`p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors ${dayHours.is_closed ? 'bg-black/60' : 'hover:bg-white/[0.02]'}`}>
                     <div className="flex items-center gap-4 min-w-[120px]">
                        <div className={`w-2 h-2 rounded-full ${dayHours.is_closed ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                        <span className={`font-mono text-xs tracking-widest uppercase font-bold ${dayHours.is_closed ? 'text-zinc-600' : 'text-white'}`}>
                           {day}
                        </span>
                     </div>

                     {!dayHours.is_closed ? (
                        <div className="flex items-center gap-4 bg-[#050505] p-2 rounded-2xl border border-[#1a1a1a]">
                           <div className="flex items-center gap-2 px-4">
                              <Sun size={12} className="text-zinc-600" />
                              <input 
                                 type="time" 
                                 value={dayHours.open_time.substring(0, 5)}
                                 onChange={(e) => updateTime(index, 'open_time', e.target.value)}
                                 className="bg-transparent text-white font-mono text-sm outline-none w-16"
                              />
                           </div>
                           <div className="h-4 w-px bg-zinc-800"></div>
                           <div className="flex items-center gap-2 px-4">
                              <Moon size={12} className="text-zinc-600" />
                              <input 
                                 type="time" 
                                 value={dayHours.close_time.substring(0, 5)}
                                 onChange={(e) => updateTime(index, 'close_time', e.target.value)}
                                 className="bg-transparent text-white font-mono text-sm outline-none w-16"
                              />
                           </div>
                        </div>
                     ) : (
                        <div className="flex-1 flex items-center justify-center">
                           <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.4em] italic">Estabelecimento Fechado</span>
                        </div>
                     )}

                     <button 
                       onClick={() => toggleClosed(index)}
                       className={`px-4 py-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-widest transition-all border ${dayHours.is_closed ? 'border-primary/20 text-primary hover:bg-primary/10' : 'border-zinc-800 text-zinc-600 hover:border-red-500/40 hover:text-red-500'}`}
                     >
                        {dayHours.is_closed ? "ABRIR DIA_" : "FECHAR DIA_"}
                     </button>
                  </div>
               );
            })}
         </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex items-start gap-4">
         <AlertCircle size={20} className="text-primary text-primary shrink-0 mt-1" />
         <div className="space-y-1">
            <p className="text-xs text-white font-bold tracking-tight">Regra de Disponibilidade</p>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
               Os horários aqui configurados limitam automaticamente as opções de agendamento na sua vitrine pública. 
               Diferenças de fusos horários são ajustadas para o horário local (UTC-3).
            </p>
         </div>
      </div>

    </div>
  );
}

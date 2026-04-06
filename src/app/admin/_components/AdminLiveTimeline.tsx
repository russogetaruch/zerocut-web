"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TimelineBlockAnimated } from "./TimelineAnimated";

export function AdminLiveTimeline({ initialAppointments, tenantId }: { initialAppointments: any[], tenantId: string }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const supabase = createClient();

  useEffect(() => {
    // 1. Escutador Real-time para AGENDAMENTOS
    const channel = supabase.channel('admin-appointments')
       .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'appointments', 
          filter: `tenant_id=eq.${tenantId}` 
       }, async (payload) => {
          console.log("Change detected:", payload);
          
          if (payload.eventType === 'INSERT') {
             // Precisamos buscar o serviço (join) para ter o nome e preço no novo item
             const { data: newFullApt } = await supabase
                .from('appointments')
                .select('*, services(*)')
                .eq('id', payload.new.id)
                .single();
             
             if (newFullApt) {
                setAppointments(prev => [newFullApt, ...prev].sort((a,b) => a.appointment_time.localeCompare(b.appointment_time)));
             }
          } else if (payload.eventType === 'UPDATE') {
             setAppointments(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a));
          } else if (payload.eventType === 'DELETE') {
             setAppointments(prev => prev.filter(a => a.id !== payload.old.id));
          }
       })
       .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tenantId]);

  // Cálculos em tempo real
  const waitingCount = appointments?.filter(a => a.status === 'SCHEDULED' || a.status === 'WAITING' || a.status === 'INCOMING').length || 0;
  const completedCount = appointments?.filter(a => a.status === 'COMPLETED').length || 0;
  
  const dailyRevenue = appointments
    ?.filter(a => a.status === 'COMPLETED')
    .reduce((acc, curr) => acc + (Number(curr.services?.price) || 0), 0) || 0;
    
  const estClosing = appointments
    ?.reduce((acc, curr) => acc + (Number(curr.services?.price) || 0), 0) || 0;

  return (
    <div className="space-y-10">
      {/* Vital Stats (Agora Dinâmicos no Cliente) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalBox title="FILA DE ESPERA" value={waitingCount < 10 ? `0${waitingCount}` : waitingCount.toString()} icon={<Clock size={16}/>} isAlert={waitingCount > 0} />
        <VitalBox title="CONCLUÍDOS HOJE" value={completedCount < 10 ? `0${completedCount}` : completedCount.toString()} icon={<CheckCircle2 size={16}/>} />
        <VitalBox title="RECEITA ROTITIVA" value={`R$ ${dailyRevenue.toFixed(2)}`} icon={<Activity size={16}/>} isGold />
        <VitalBox title="FECHAMENTO EST." value={`R$ ${estClosing.toFixed(2)}`} icon={<Activity size={16}/>} />
      </div>

      {/* TimelineBoard */}
      <div className="mt-8">
        <h3 className="font-mono text-xs text-zinc-500 tracking-widest mb-4 uppercase">
           [ PRÓXIMOS AGENDAMENTOS NA FILA ]
        </h3>
        
        <div className="flex flex-col gap-3">
          {appointments && appointments.length > 0 ? (
             appointments.map((apt, idx) => (
                <TimelineBlockAnimated 
                   key={apt.id}
                   id={apt.id}
                   tenantId={tenantId}
                   time={apt.appointment_time.substring(0, 5)} 
                   client={apt.client_name}
                   service={apt.services?.name || "Serviço Adicional"} 
                   price={apt.services?.price || 50}
                   status={apt.status} 
                   delay={idx * 0.05}
                />
             ))
          ) : (
             <div className="p-10 border border-dashed border-[#222] bg-[#050505] rounded-xl flex items-center justify-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
                [ NENHUM AGENDAMENTO PREVISTO ]
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VitalBox({ title, value, icon, isAlert, isGold }: any) {
  return (
    <div className={`p-4 rounded-lg border flex flex-col gap-3 relative overflow-hidden group transition-colors ${
       isGold ? 'border-primary/40 bg-primary/5' : 
       isAlert ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#1a1a1a] bg-[#080808] hover:border-[#333]'
    }`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all duration-500">
         {icon}
      </div>
      <span className={`font-mono text-[10px] tracking-widest ${isGold ? 'text-primary' : isAlert ? 'text-amber-500' : 'text-zinc-500'}`}>{title}</span>
      <span className="font-mono text-3xl text-white font-light tracking-tight">{value}</span>
    </div>
  );
}

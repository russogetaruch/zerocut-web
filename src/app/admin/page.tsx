import { Activity, Clock, CheckCircle2, ChevronRight, LayoutDashboard, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TimelineBlockAnimated } from "./_components/TimelineAnimated";
import { AdminLiveTimeline } from "./_components/AdminLiveTimeline";
import { PerformanceMonitor } from "./_components/PerformanceMonitor";

export const dynamic = "force-dynamic";

export default async function TenantAdminDashboard() {
  const supabase = await createClient();

  // Para o MVP: Simular login do dono
  const { data: tenantOwner } = await supabase.from('tenants').select('*').order('created_at', { ascending: false }).limit(1).single();

  // Buscar agendamentos reais COM os dados do serviço
  const { data: appointments } = await supabase
     .from('appointments')
     .select('*, services(*)')
     .eq('tenant_id', tenantOwner?.id)
     .order('appointment_time', { ascending: true });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Dynamic Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-10 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#1a1a1a] w-fit shadow-xl group">
             <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse border-4 border-green-500/20"></div>
             <h2 className="text-2xl font-black text-white tracking-widest uppercase group-hover:text-primary transition-colors">
                Painel Operacional
             </h2>
          </div>
          <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase flex items-center gap-2">
             <Database size={10} className="text-primary" /> AMBIENTE: <span className="text-white bg-zinc-900 px-2 rounded">{tenantOwner?.name || "Não Identificado"}</span>
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="hidden lg:flex items-center gap-10 px-8 border-x border-zinc-200 mr-4">
               <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Link Clicável</p>
                  <p className="text-xs text-green-600 font-semibold">/b/{tenantOwner?.slug || "barbearia"}</p>
               </div>
           </div>
           <button className="font-mono text-[11px] text-black font-black tracking-[0.2em] uppercase bg-primary hover:bg-white transition-all px-10 py-4 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.2)] active:scale-95 group">
             Novo Agendamento
           </button>
        </div>
      </div>

      {/* MOTOR 1: Monitoramento de Performance Gráfico */}
      <PerformanceMonitor />

      {/* MOTOR 2: Realtime Engine (Timeline e Stats Diários) */}
      <AdminLiveTimeline initialAppointments={appointments || []} tenantId={tenantOwner?.id} />
      
    </div>
  );
}

function VitalBox({ title, value, icon, isAlert, isGold }: any) {
  // Removido (Lógica movida para AdminLiveTimeline para Realtime total)
  return null;
}

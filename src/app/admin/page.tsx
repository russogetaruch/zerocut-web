import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  LayoutDashboard, 
  Database,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Star
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminHeaderActions } from "./_components/AdminHeaderActions";
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header com Contexto */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(212,175,55,1)]"></div>
             <h2 className="text-3xl font-serif font-black text-white tracking-tight uppercase italic text-shadow-glow">Insights & Performance</h2>
          </div>
          <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase flex items-center gap-2">
             <Database size={10} className="text-primary" /> Sistema: <span className="text-zinc-300">{tenantOwner?.name || "Ambiente_Nativo"}</span>
          </p>
        </div>
        
        <AdminHeaderActions tenantSlug={tenantOwner?.slug || ""} tenantName={tenantOwner?.name || ""} />
      </div>

      {/* Grid de Métricas Rápidas (Poderia ser substituído por Widgets Reais) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <StatsCard 
           title="Conversão de Vitrine" 
           value="14.2%" 
           trend="+2.4%" 
           icon={<TrendingUp size={20}/>} 
         />
         <StatsCard 
           title="Novos Clientes" 
           value="28" 
           trend="+12%" 
           isPositive 
           icon={<Users size={20}/>} 
         />
         <StatsCard 
           title="Ocupação da Agenda" 
           value="82%" 
           trend="-3%" 
           icon={<Calendar size={20}/>} 
         />
      </div>

      {/* Monitor de Gráficos (Visual) */}
      <div className="bg-[#050505] border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
         <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
         <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="font-mono text-xs text-zinc-500 tracking-widest uppercase">Fluxo de Caixa Mensal</h3>
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-primary"></div>
               <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
            </div>
         </div>
         <PerformanceMonitor />
      </div>

      {/* Timeline Real-time Integrada */}
      <div className="space-y-6">
         <div className="flex items-center gap-3 ml-2">
            <Clock size={16} className="text-primary" />
            <h3 className="font-serif font-black text-xl text-white uppercase italic tracking-tight">Stream de Atividade</h3>
         </div>
         <AdminLiveTimeline initialAppointments={appointments || []} tenantId={tenantOwner?.id} />
      </div>
      
    </div>
  );
}

function StatsCard({ title, value, trend, icon, isPositive = true }: any) {
  return (
    <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[30px] hover:border-primary/20 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700">
         {icon}
       </div>
       <p className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest mb-4">{title}</p>
       <div className="flex items-end gap-4">
          <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
          <span className={`text-[10px] font-mono font-bold mb-1 px-2 py-0.5 rounded ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
             {trend}
          </span>
       </div>
    </div>
  );
}

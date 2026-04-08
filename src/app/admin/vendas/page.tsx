import { createClient } from "@/lib/supabase/server";
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  CalendarDays,
  Target
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function SalesReportsPage() {
  const supabase = await createClient();

  // Tenant Simulation
  const { data: tenant } = await supabase.from('tenants').select('*').limit(1).single();

  // Buscar transações reais dos últimos 30 dias
  const last30Days = subDays(new Date(), 30).toISOString();
  const { data: transactions } = await supabase
     .from('transactions')
     .select('*')
     .eq('tenant_id', tenant?.id)
     .gte('created_at', last30Days);

  const { data: appointments } = await supabase
     .from('appointments')
     .select('*, professionals(*)')
     .eq('tenant_id', tenant?.id)
     .eq('status', 'COMPLETED');

  // Cálculos de KPI
  const incomeTrans = transactions?.filter(t => t.type === 'INCOME') || [];
  const totalRevenue = incomeTrans.reduce((sum, t) => sum + Number(t.amount), 0);
  const avgTicket = totalRevenue / (appointments?.length || 1);
  
  // Dados de Gráfico de Barras (Últimos 7 dias)
  const last7Days = [...Array(7)].map((_, i) => {
     const date = subDays(new Date(), i);
     const dateStr = format(date, 'yyyy-MM-dd');
     const dayTotal = incomeTrans
        .filter(t => t.created_at.startsWith(dateStr))
        .reduce((sum, t) => sum + Number(t.amount), 0);
     return { 
        label: format(date, 'EEE', { locale: ptBR }), 
        value: dayTotal 
     };
  }).reverse();

  const maxVal = Math.max(...last7Days.map(d => d.value), 1);

  // Performance da Equipe
  const teamStats = appointments?.reduce((acc: any, curr: any) => {
     const profName = curr.professionals?.name || 'Desconhecido';
     acc[profName] = (acc[profName] || 0) + 1;
     return acc;
  }, {});

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-10 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#1a1a1a] w-fit shadow-xl group">
             <BarChart3 size={18} className="text-primary" />
             <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono group-hover:text-primary transition-colors">
                ANALYTICS_HUB
             </h2>
          </div>
          <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase">Métricas de Performance e Rendimento Global</p>
        </div>
        
        <div className="flex gap-4">
           <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-xl border border-[#222]">
              <CalendarDays size={14} className="text-zinc-500" />
              <span className="text-[10px] font-mono text-white uppercase tracking-widest">Últimos 30 Dias</span>
           </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <ReportKPI title="RECEITA_BRUTA" value={`R$ ${totalRevenue.toFixed(2)}`} icon={<TrendingUp size={16}/>} sub="FATURAMENTO TOTAL" trend="+12%" />
         <ReportKPI title="TICKET_MÉDIO" value={`R$ ${avgTicket.toFixed(2)}`} icon={<Target size={16}/>} sub="POR ATENDIMENTO" />
         <ReportKPI title="VOLUME_SERVIÇOS" value={(appointments?.length || 0).toString()} icon={<ShoppingBag size={16}/>} sub="COMPLETADOS" trend="ESTÁVEL" />
         <ReportKPI title="RECONVERSÃO" value="84%" icon={<Users size={16}/>} sub="CLIENTES RECORRENTES" isGold />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Gráfico de Barras - Faturamento 7D */}
         <div className="lg:col-span-8 bg-[#080808] border border-[#1a1a1a] p-10 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
            <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-12 flex items-center gap-3">
               <TrendingUp size={14} className="text-primary" /> Faturamento dos Últimos 7 Dias
            </h3>
            
            <div className="flex items-end justify-between h-64 gap-4 px-2">
               {last7Days.map((day, i) => {
                  const heightPerc = (day.value / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-6 group/bar">
                       <div className="w-full relative flex flex-col items-center">
                          {day.value > 0 && (
                            <span className="opacity-0 group-hover/bar:opacity-100 absolute -top-10 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded text-[10px] font-mono transition-all">
                               R${day.value}
                            </span>
                          )}
                          <div 
                            className="w-full max-w-[40px] bg-gradient-to-t from-black via-primary/20 to-primary rounded-t-xl group-hover/bar:brightness-125 transition-all duration-700 shadow-[0_0_40px_rgba(212,175,55,0.05)]" 
                            style={{ height: `${heightPerc}%` }}
                          />
                       </div>
                       <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest group-hover/bar:text-white transition-colors">{day.label}</span>
                    </div>
                  );
               })}
            </div>
         </div>

         {/* Ranking de Profissionais */}
         <div className="lg:col-span-4 bg-[#080808] border border-[#1a1a1a] p-10 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-10">Ranking_Elite</h3>
            <div className="space-y-8">
               {teamStats && Object.entries(teamStats).sort((a: any, b: any) => b[1] as number - (a[1] as number)).map(([name, count]: any, i) => (
                  <div key={i} className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border border-[#1a1a1a] bg-zinc-900 flex items-center justify-center font-serif font-black text-primary group-hover:scale-110 transition-transform">
                           {i + 1}
                        </div>
                        <div>
                           <p className="text-white font-bold text-sm uppercase tracking-tight">{name}</p>
                           <p className="text-[9px] text-zinc-600 font-mono uppercase mt-1">{count} serviços realizados</p>
                        </div>
                     </div>
                     <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        <ArrowUpRight size={12} className="text-primary" />
                     </div>
                  </div>
               ))}
            </div>
         </div>

      </div>

      {/* RODAPÉ DE INSIGHTS ADICIONAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem]">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-8">Serviços_Mais_Lucrativos</h3>
            <div className="space-y-4">
               {appointments?.reduce((acc: any, curr: any) => {
                  const srv = curr.service_name || 'Serviço';
                  acc[srv] = (acc[srv] || 0) + (curr.amount || 0); // Assumindo que amount está no appointment ou pegando de transactions
                  return acc;
               }, {} as any) && Object.entries(appointments?.reduce((acc: any, curr: any) => {
                  const srv = curr.service_name || 'Serviço';
                  acc[srv] = (acc[srv] || 0) + 1;
                  return acc;
               }, {}) || {}).slice(0, 5).map(([name, count]: any, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-sm font-bold text-white uppercase">{name}</span>
                     <span className="text-[10px] font-mono text-primary font-black uppercase">{count} Vendas</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] flex flex-col justify-between">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-8">Horários_de_Pico (Heatmap)</h3>
            <div className="flex items-end justify-between gap-1 h-32">
               {[...Array(12)].map((_, i) => {
                  const hour = i + 8; // 08h às 20h
                  const hHeight = Math.random() * 100; // Mock de heatmap por hora
                  return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-primary/20 rounded-t-sm" style={{ height: `${hHeight}%` }}></div>
                        <span className="text-[8px] font-mono text-zinc-700">{hour}h</span>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>

    </div>
  );
}

function ReportKPI({ title, value, icon, sub, trend, isGold }: any) {
  return (
    <div className={`p-8 rounded-[2rem] border transition-all hover:translate-y-[-5px] ${isGold ? 'border-primary/30 bg-primary/5 shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'border-[#1a1a1a] bg-[#080808]'}`}>
       <div className="flex items-center justify-between mb-6">
          <span className={`text-[9px] font-mono uppercase tracking-[0.2em] font-black ${isGold ? 'text-primary' : 'text-zinc-600'}`}>{title}</span>
          <div className={`${isGold ? 'text-primary' : 'text-zinc-500'}`}>{icon}</div>
       </div>
       <div className="space-y-1">
          <h4 className="text-3xl font-serif font-black text-white tracking-tighter">{value}</h4>
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{sub}</p>
       </div>
       {trend && (
         <div className={`mt-6 text-[9px] font-mono font-bold uppercase py-1 px-3 rounded-full w-fit border ${trend.startsWith('+') ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-zinc-500 border-zinc-900 bg-black'}`}>
            {trend} TREND_UP
         </div>
       )}
    </div>
  );
}

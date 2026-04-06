import { createClient } from "@/lib/supabase/server";
import { Users, Star, AlertTriangle, Phone, Search, Filter } from "lucide-react";
import { generateWhatsAppLink, CRM_MESSAGES } from "@/lib/utils/whatsapp";

export const dynamic = "force-dynamic";

export default async function ClientsCRMPage() {
  const supabase = await createClient();

  // 1. Identificar o Tenant Ativo (Dono logado)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div className="p-20 text-center font-mono text-zinc-500 uppercase tracking-widest text-xs">Loja não identificada.</div>;

  // 2. Buscar Dados Consolidados da View Inteligente (Performance O(1))
  const { data: insights, error } = await supabase
    .from('client_insights')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('total_visits', { ascending: false });

  if (error) {
    console.error("Erro ao carregar CRM:", error);
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-10 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#1a1a1a] w-fit shadow-xl group">
             <Users size={18} className="text-primary" />
             <h2 className="text-2xl font-black text-white tracking-widest uppercase group-hover:text-primary transition-colors">
                Base de Clientes
             </h2>
          </div>
          <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase">Gestão de Retenção e Ciclos de Fidelidade Baseados na View_DB</p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] flex items-center justify-between group shadow-2xl">
            <div>
               <p className="text-[9px] font-mono text-primary uppercase tracking-[0.2em] mb-2 font-black">CLIENTES_VIP</p>
               <h4 className="text-3xl font-serif font-black text-white">{insights?.filter(i => i.status === 'VIP').length || 0}</h4>
            </div>
            <Star size={24} className="text-primary opacity-50" />
         </div>
         <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2rem] flex items-center justify-between group">
            <div>
               <p className="text-[9px] font-mono text-red-500 uppercase tracking-[0.2em] mb-2 font-black">EM_RISCO</p>
               <h4 className="text-3xl font-serif font-black text-white">{insights?.filter(i => i.status === 'EM_RISCO').length || 0}</h4>
            </div>
            <AlertTriangle size={24} className="text-red-500 opacity-50" />
         </div>
         <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] flex items-center justify-between group">
            <div>
               <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-2 font-black">RECORRÊNCIA_TOTAL</p>
               <h4 className="text-3xl font-serif font-black text-white">{insights?.length || 0}</h4>
            </div>
            <Users size={24} className="text-zinc-600 opacity-50" />
         </div>
      </div>

      {/* Tabela de Inteligência */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-[#1a1a1a] bg-black/40 flex justify-between items-center">
            <div className="relative w-full max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
               <input 
                 type="text" 
                 placeholder="BUSCAR_NA_BASE..." 
                 className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl pl-12 pr-6 py-3 text-xs text-white outline-none focus:border-primary transition-all font-mono"
               />
            </div>
            <Filter size={18} className="text-zinc-600 cursor-pointer hover:text-white transition-colors" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0c0c0c] text-[10px] font-mono text-zinc-600 uppercase tracking-widest border-b border-[#151515]">
                <th className="px-10 py-6">Perfil do Cliente</th>
                <th className="px-10 py-6">Status_Sistema</th>
                <th className="px-10 py-6 text-center">Progresso_Fidelidade</th>
                <th className="px-10 py-6 text-right">Ação_Mkt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121212]">
              {insights && insights.length > 0 ? insights.map((insight, idx) => {
                const isVip = insight.status === 'VIP';
                const isAtRisk = insight.status === 'EM_RISCO';
                
                // Escolher mensagem baseada no status
                const message = isAtRisk 
                  ? CRM_MESSAGES.RECOVERY(insight.client_name)
                  : CRM_MESSAGES.REMINDER(insight.client_name, 'seu barbeiro');

                return (
                  <tr key={idx} className="group hover:bg-[#0c0c0c] transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border transition-all ${isVip ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-[#222] bg-zinc-900 text-zinc-600'}`}>
                          {insight.client_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg uppercase tracking-tight group-hover:text-primary transition-colors">{insight.client_name}</p>
                          <p className="text-[10px] text-zinc-600 font-mono mt-1">{insight.client_phone || 'SEM_CONTATO'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-mono font-bold border tracking-widest ${
                         isVip ? 'text-primary bg-primary/10 border-primary/20' : 
                         isAtRisk ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
                         'text-green-500 bg-green-500/10 border-green-500/20'
                       }`}>
                         {insight.status} • {insight.total_visits} VISITAS
                       </span>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col items-center gap-3">
                          <div className="flex gap-1.5">
                             {[...Array(10)].map((_, i) => (
                               <div key={i} className={`w-2.5 h-2.5 rounded-full border transition-all ${i < insight.loyalty_points ? 'bg-primary border-primary animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'bg-transparent border-[#222]'}`}></div>
                             ))}
                          </div>
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Cartão: {insight.loyalty_points}/10</span>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <a 
                         href={generateWhatsAppLink(insight.client_phone || '', message)}
                         target="_blank"
                         className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                           isAtRisk 
                             ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' 
                             : 'bg-[#1a1a1a] text-zinc-400 hover:text-primary border border-transparent hover:border-primary/30'
                         }`}
                       >
                          <Phone size={14} />
                          {isAtRisk ? 'Resgatar Cliente' : 'Contato'}
                       </a>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                   <td colSpan={4} className="py-32 text-center text-zinc-700 font-mono text-xs uppercase tracking-[0.5em]">
                      [ DATABASE_EMPTY_WAITING_FOR_DATA ]
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

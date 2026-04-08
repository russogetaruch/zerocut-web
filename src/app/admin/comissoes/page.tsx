import { createClient } from "@/lib/supabase/server";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  ChevronRight,
  Briefcase
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  const supabase = await createClient();

  // 1. Get Active Tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Loja não encontrada.</div>;

  // 2. Fetch Professionals with their specific commissions
  const { data: professionals } = await supabase
    .from('professionals')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('name', { ascending: true });

  // 3. Fetch completed appointments with transactions for the current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      services (name, price),
      transactions (amount, net_amount, payment_method, created_at)
    `)
    .eq('tenant_id', tenant.id)
    .eq('status', 'COMPLETED')
    .gte('created_at', startOfMonth.toISOString());

  // 4. Calculate stats per professional
  const profStats = professionals?.map(prof => {
    const profApps = appointments?.filter(app => app.professional_id === prof.id) || [];
    const totalGenerated = profApps.reduce((acc, app) => acc + Number(app.services?.price || 0), 0);
    const totalCommission = (totalGenerated * Number(prof.commission_percentage || 0)) / 100;
    
    return {
      ...prof,
      appsCount: profApps.length,
      totalGenerated,
      totalCommission
    };
  }) || [];

  const totalMonthCommission = profStats.reduce((acc, p) => acc + p.totalCommission, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-10 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#1a1a1a] w-fit shadow-xl group">
             <Briefcase size={18} className="text-primary" />
             <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono group-hover:text-primary transition-colors">
                EXTRATO_COMISSOES
             </h2>
          </div>
          <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase">
             Gestão de Payout e Performance da Equipe
          </p>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-4">
           <Calendar size={16} className="text-primary" />
           <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              Referência: {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
           </span>
        </div>
      </div>

      {/* Destaques Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] flex flex-col justify-between">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Total à Pagar (Mês)</p>
            <h3 className="text-4xl font-serif font-black text-primary tracking-tight">
               R$ {totalMonthCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed tracking-tight">
               Este valor representa a soma das comissões de todos os barbeiros ativos no período atual.
            </p>
         </div>
         
         <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] flex flex-col justify-between border-l-4 border-l-primary/30">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Volume Gerado pela Equipe</p>
            <h3 className="text-4xl font-serif font-black text-white tracking-tight">
               R$ {profStats.reduce((acc, p) => acc + p.totalGenerated, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-4 font-mono">
               Sincronizado com as comandas finalizadas.
            </p>
         </div>
      </div>

      {/* Lista de Profissionais */}
      <div className="space-y-4">
         <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] font-black pl-2">Performance Individual</h4>
         
         <div className="grid grid-cols-1 gap-4">
            {profStats.map((prof) => (
               <div key={prof.id} className="group bg-[#0a0a0a] border border-[#1a1a1a] hover:border-primary/30 transition-all p-6 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-xl">
                  {/* Perfil */}
                  <div className="flex items-center gap-4 min-w-[240px]">
                     <div className="w-14 h-14 rounded-full border-2 border-[#1a1a1a] p-1 overflow-hidden group-hover:border-primary transition-colors">
                        <img 
                          src={prof.avatar_url || `https://i.pravatar.cc/150?u=${prof.id}`}
                          className="w-full h-full object-cover rounded-full filter grayscale group-hover:grayscale-0 transition-all"
                        />
                     </div>
                     <div>
                        <h5 className="text-white font-bold tracking-tight">{prof.name}</h5>
                        <p className="text-[10px] font-mono text-primary font-black uppercase tracking-widest">{prof.commission_percentage}% COMISSÃO</p>
                     </div>
                  </div>

                  {/* Stats Curto */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 w-full border-t md:border-t-0 md:border-l border-[#1a1a1a] pt-6 md:pt-0 md:pl-8">
                     <div>
                        <p className="text-[9px] font-mono text-zinc-600 uppercase mb-1">Serviços</p>
                        <p className="text-lg font-bold text-white">{prof.appsCount}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-mono text-zinc-600 uppercase mb-1">Valor Gerado</p>
                        <p className="text-lg font-medium text-zinc-400">R$ {prof.totalGenerated.toFixed(2)}</p>
                     </div>
                     <div className="hidden md:block">
                        <p className="text-[9px] font-mono text-zinc-600 uppercase mb-1">Status Pagamento</p>
                        <span className="text-[8px] bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full font-black border border-yellow-500/20 uppercase tracking-widest">Pendente</span>
                     </div>
                  </div>

                  {/* Valor Final */}
                  <div className="text-right min-w-[120px]">
                     <p className="text-[9px] font-mono text-primary uppercase mb-1 font-black">A Receber_</p>
                     <p className="text-2xl font-serif font-black text-white">R$ {prof.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  
                  <button className="p-3 bg-[#111] text-zinc-500 hover:text-white hover:bg-primary hover:text-black rounded-xl transition-all">
                     <ChevronRight size={18} />
                  </button>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
}

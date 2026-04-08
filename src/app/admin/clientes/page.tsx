import { createClient } from "@/lib/supabase/server";
import { 
  Users, 
  Search, 
  Phone, 
  Star, 
  TrendingUp, 
  History,
  Crown,
  ChevronRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = await createClient();

  // 1. Get Active Tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, loyalty_target_cuts')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Loja não encontrada.</div>;

  // 2. Fetch Customers
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('total_spent', { ascending: false });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-10 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#1a1a1a] w-fit shadow-xl group">
             <Users size={18} className="text-primary" />
             <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono group-hover:text-primary transition-colors">
                CRM_CLIENTES
             </h2>
          </div>
          <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase">
             Gestão de Fidelidade e Retenção de Público
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-3 rounded-2xl w-full md:w-80 shadow-2xl focus-within:border-primary transition-all">
           <Search size={16} className="text-zinc-600" />
           <input 
             type="text" 
             placeholder="Buscar Cliente_"
             className="bg-transparent border-none outline-none text-xs text-white font-mono flex-1"
           />
        </div>
      </div>

      {/* Grid de Destaques CRM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Crown size={60} className="text-primary" />
            </div>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Base de Clientes</p>
            <h3 className="text-4xl font-serif font-black text-white">{customers?.length || 0}</h3>
            <p className="text-[9px] font-mono text-zinc-500 mt-4 uppercase">Sincronizado via Cadastro de Comendas</p>
         </div>

         <div className="bg-[#080808] border border-primary/20 p-8 rounded-[2rem] relative overflow-hidden group">
            <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-4">Meta do Clube</p>
            <h3 className="text-4xl font-serif font-black text-white">{tenant.loyalty_target_cuts} <span className="text-sm font-sans text-zinc-500 uppercase">Cortes</span></h3>
            <p className="text-[9px] font-mono text-zinc-500 mt-4 uppercase">Para Liberar Benefício VIP</p>
         </div>

         <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] relative overflow-hidden group">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Taxa de Retorno</p>
            <h3 className="text-4xl font-serif font-black text-white">82%</h3>
            <p className="text-[9px] font-mono text-green-500 mt-4 uppercase">+12% vs Mês Anterior</p>
         </div>
      </div>

      {/* Lista de Clientes (Ranking de Gasto/Fidelidade) */}
      <div className="space-y-4">
         <div className="flex justify-between items-center px-4">
            <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] font-black">Ranking_Fidelidade</h4>
            <div className="flex gap-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
               <span>Nome</span>
               <span className="hidden md:inline">Pontos</span>
               <span>Total Gasto</span>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-3">
            {customers?.map((customer, index) => (
               <div key={customer.id} className="group bg-[#0a0a0a] border border-[#1a1a1a] hover:border-primary/40 transition-all p-5 rounded-2xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-6">
                     <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#222] flex items-center justify-center font-black text-xs text-zinc-700 group-hover:text-primary transition-colors">
                        {index + 1}
                     </div>
                     <div>
                        <h5 className="text-white font-bold tracking-tight text-sm flex items-center gap-2">
                           {customer.name}
                           {customer.loyalty_points >= tenant.loyalty_target_cuts && (
                              <Crown size={12} className="text-primary animate-pulse" />
                           )}
                        </h5>
                        <div className="flex items-center gap-3 mt-1">
                           <div className="flex items-center gap-1 text-[9px] text-zinc-600 font-mono">
                              <Phone size={10} /> {customer.phone}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-12">
                     <div className="hidden md:flex flex-col items-end">
                        <div className="flex gap-1 mb-1">
                           {Array.from({ length: Math.min(customer.loyalty_points, 5) }).map((_, i) => (
                              <Star key={i} size={10} className="fill-primary text-primary" />
                           ))}
                           {customer.loyalty_points > 5 && <span className="text-[9px] text-primary font-black">+{customer.loyalty_points - 5}</span>}
                        </div>
                        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-tighter">{customer.loyalty_points} Pontos Acumulados</p>
                     </div>

                     <div className="text-right min-w-[100px]">
                        <p className="text-sm font-mono font-bold text-white tracking-widest">R$ {Number(customer.total_spent).toFixed(2)}</p>
                        <p className="text-[8px] font-mono text-zinc-700 uppercase">Gasto Consolidado_</p>
                     </div>

                     <button className="p-2 text-zinc-700 hover:text-white transition-colors">
                        <ChevronRight size={18} />
                     </button>
                  </div>
               </div>
            ))}

            {(!customers || customers.length === 0) && (
               <div className="p-20 text-center border-2 border-dashed border-[#1a1a1a] rounded-[3rem]">
                  <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.4em]">Nenhum cliente registrado_</p>
               </div>
            )}
         </div>
      </div>

    </div>
  );
}

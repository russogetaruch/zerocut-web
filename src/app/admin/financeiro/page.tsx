import { createClient } from "@/lib/supabase/server";
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Calendar,
  CreditCard,
  QrCode,
  Banknote,
  AlertCircle,
  Percent,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function FinanceDashboardPage() {
  const supabase = await createClient();

  // Buscar o tenant ativo
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Loja não encontrada.</div>;

  // Buscar transações
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });

  const totalGross = transactions?.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalNet = transactions?.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.net_amount || t.amount), 0) || 0;
  const totalFees = totalGross - totalNet;
  
  const totalExpense = transactions?.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const balance = totalNet - totalExpense;
  
  const pendingFiado = transactions?.filter(t => t.payment_method === 'FIADO').reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  const today = new Date().toISOString().split('T')[0];
  const todayNet = transactions?.filter(t => t.type === 'INCOME' && t.created_at.startsWith(today)).reduce((acc, t) => acc + Number(t.net_amount || t.amount), 0) || 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-10 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#1a1a1a] w-fit shadow-xl group">
             <Wallet size={18} className="text-primary" />
             <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono group-hover:text-primary transition-colors">
                FINANCEIRO_HUB
             </h2>
          </div>
          <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase">
             Fluxo de Caixa e Inteligência de Receita Líquida
          </p>
        </div>
        
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-primary text-black font-black text-[10px] tracking-widest uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              + LANÇAR_DESPESA
           </button>
           <button className="px-6 py-3 bg-zinc-900 text-white font-black text-[10px] tracking-widest uppercase rounded-xl border border-[#222] hover:bg-zinc-800 transition-all">
              GERAR_RELATORIO
           </button>
        </div>
      </div>

      {/* Grid de Cards Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         
         {/* SALDO EM CONTA (LÍQUIDO) */}
         <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <DollarSign size={80} className="text-primary" />
            </div>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Saldo Real (Líquido)</p>
            <h3 className="text-4xl font-serif font-black text-white tracking-tight">
               R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-green-500 uppercase tracking-widest">
               <TrendingUp size={12} /> Atualizado Agora
            </div>
         </div>

         {/* RECEITA LÍQUIDA HOJE */}
         <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] relative overflow-hidden group">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Líquido de Hoje</p>
            <h3 className="text-4xl font-serif font-black text-primary tracking-tight">
               R$ {todayNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
               <ArrowUpRight size={12} className="text-primary" /> +8% Real vs Ontem
            </div>
         </div>

         {/* TOTAL MAQUININHA (FEE) */}
         <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Percent size={40} className="text-red-500" />
            </div>
            <p className="text-[10px] font-mono text-red-500/60 uppercase tracking-widest mb-4">Taxas Retidas (MDR)</p>
            <h3 className="text-4xl font-serif font-black text-white tracking-tight">
               R$ {totalFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
               <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Custo Operacional
            </div>
         </div>

         {/* PENDÊNCIAS / FIADO */}
         <div className="bg-[#080808] border-2 border-red-900/20 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <AlertCircle size={80} className="text-red-500" />
            </div>
            <p className="text-[10px] font-mono text-red-500/60 uppercase tracking-widest mb-4">Total Fiado (Pendência)</p>
            <h3 className="text-4xl font-serif font-black text-red-500 tracking-tight">
               R$ {pendingFiado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-red-700 uppercase tracking-widest">
               <AlertCircle size={12} /> {transactions?.filter(t => t.payment_method === 'FIADO').length} comandas abertas
            </div>
         </div>

      </div>

      {/* Lista de Transações Recentes */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-[2.5rem] overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-[#1a1a1a] flex items-center justify-between bg-black/40">
            <h4 className="text-white font-bold text-lg tracking-tight uppercase">Histórico Dinâmico de Caixa</h4>
            <div className="flex gap-2">
               <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-all"><Calendar size={18} /></button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-black/80 text-[10px] font-mono text-zinc-600 uppercase tracking-widest border-b border-[#1a1a1a]">
                     <th className="px-8 py-6">Data / Hora</th>
                     <th className="px-8 py-6">Tipo</th>
                     <th className="px-8 py-6">Operação / Bandeira</th>
                     <th className="px-8 py-6">Método</th>
                     <th className="px-8 py-6 text-right">Bruto / Líquido</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#151515]">
                  {transactions && transactions.length > 0 ? transactions.map((t) => (
                     <tr key={t.id} className="group hover:bg-zinc-950/40 transition-colors">
                        <td className="px-8 py-6">
                           <div className="text-[10px] font-mono text-zinc-500">
                              {format(new Date(t.created_at), "dd/MM/yyyy • HH:mm", { locale: ptBR })}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${t.type === 'INCOME' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-white font-bold text-sm tracking-tight flex items-center gap-3">
                              {t.description || t.category}
                              {t.card_brand && (
                                <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded border border-primary/20">{t.card_brand.toUpperCase()}</span>
                              )}
                           </p>
                           <p className="text-[10px] text-zinc-600 font-mono uppercase mt-1">Ref: #{t.id.substring(0,6)}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono uppercase">
                              {(t.payment_method === 'PIX' || t.payment_method === 'DINHEIRO') ? (
                                <>
                                  <QrCode size={12} className="text-zinc-500" />
                                  {t.payment_method}
                                </>
                              ) : (
                                <>
                                  <CreditCard size={12} className="text-primary" />
                                  {t.payment_method}
                                </>
                              )}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex flex-col items-end">
                              <span className={`text-zinc-600 text-[10px] font-mono line-through`}>
                                 R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className={`text-lg font-mono font-black ${t.type === 'INCOME' ? 'text-white' : 'text-red-500'}`}>
                                 R$ {Number(t.net_amount || t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                           </div>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={5} className="py-20 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">
                           O caixa está vazio. Comece a processar pagamentos!
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

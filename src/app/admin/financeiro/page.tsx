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

import { DateRangeFilter } from "../_components/DateRangeFilter";
import { FinanceHeaderActions } from "../_components/FinanceHeaderActions";

export const dynamic = "force-dynamic";

export default async function FinanceDashboardPage({ searchParams }: { searchParams: { startDate?: string, endDate?: string } }) {
  const { startDate, endDate } = await searchParams;
  const supabase = await createClient();

  // Buscar o tenant ativo
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Loja não encontrada.</div>;

  // Buscar transações com filtro de data
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });

  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate + 'T23:59:59');

  const { data: transactions } = await query;

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
          <div className="flex items-center gap-4">
            <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase">
              Fluxo de Caixa e Inteligência de Receita Líquida
            </p>
            {startDate && (
              <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                PERIODO_FILTRADO
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
           <DateRangeFilter />
           <FinanceHeaderActions />
        </div>
      </div>

      {/* Grid de Cards Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
         
         {/* SALDO EM CONTA (LÍQUIDO) */}
         <div className="lg:col-span-4 bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <DollarSign size={80} className="text-primary" />
            </div>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Saldo Real (Líquido)</p>
            <h3 className="text-4xl font-serif font-black text-white tracking-tight">
               R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-6 flex flex-col gap-3">
               <div className="flex items-center gap-2 text-[10px] font-mono text-green-500 uppercase tracking-widest">
                  <TrendingUp size={12} /> Atualizado Agora_
               </div>
               <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase">Ticket Médio (Líquido)</p>
                  <p className="text-sm font-bold text-white">R$ {(totalNet / (transactions?.filter(t => t.type === 'INCOME').length || 1)).toFixed(2)}</p>
               </div>
            </div>
         </div>

         {/* ANALYTICS: DISTRIBUIÇÃO MÉTODO (DONUT CSS) */}
         <div className="lg:col-span-4 bg-[#080808] border border-primary/20 p-8 rounded-[2rem] shadow-2xl relative">
            <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-8 text-center">Revenue_by_Method</p>
            
            <div className="flex flex-col items-center justify-center gap-8">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-900"/>
                    {/* Exemplo Simplificado de Pie Chart Híbrido */}
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (totalNet / (totalGross || 1)))} className="text-primary"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <p className="text-xs font-mono text-zinc-500 uppercase leading-none">Net_Ratio</p>
                     <p className="text-xl font-black text-white">{((totalNet / (totalGross || 1)) * 100).toFixed(0)}%</p>
                  </div>
               </div>

               <div className="w-full grid grid-cols-2 gap-4">
                  {['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO'].map((m) => {
                    const mTotal = transactions?.filter(t => t.payment_method === m && t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
                    const mCount = transactions?.filter(t => t.payment_method === m && t.type === 'INCOME').length || 0;
                    if (mTotal === 0) return null;
                    return (
                      <div key={m} className="bg-black/40 border border-white/5 p-3 rounded-xl">
                        <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1">{m}</p>
                        <p className="text-xs font-black text-white">R$ {mTotal.toFixed(0)}</p>
                        <p className="text-[8px] font-mono text-zinc-500">{mCount} Atend.</p>
                      </div>
                    );
                  })}
               </div>
            </div>
         </div>

         {/* PENDÊNCIAS / FIADO */}
         <div className="lg:col-span-4 bg-[#080808] border border-red-900/30 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <AlertCircle size={80} className="text-red-500" />
            </div>
            <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest mb-4">PENDÊNCIAS_FIADO</p>
            <h3 className="text-4xl font-serif font-black text-red-500 tracking-tight">
               R$ {pendingFiado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-8 bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
               <div className="flex items-center gap-2 text-[10px] font-mono text-red-700 uppercase tracking-widest mb-3">
                  <AlertCircle size={12} /> {transactions?.filter(t => t.payment_method === 'FIADO').length} comandas abertas
               </div>
               <button className="w-full bg-red-500 text-white font-black text-[9px] py-2 rounded-lg hover:brightness-110 transition-all uppercase tracking-widest">
                  Notificar Todos (Whats)
               </button>
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

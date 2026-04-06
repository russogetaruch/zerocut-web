"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTransaction(tenantId: string, data: {
  type: 'INCOME' | 'EXPENSE',
  amount: number,
  payment_method: 'PIX' | 'CARTAO' | 'DINHEIRO' | 'FIADO' | 'OUTRO',
  category: string,
  description?: string,
  appointment_id?: string
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('transactions')
    .insert([
      {
        tenant_id: tenantId,
        type: data.type,
        amount: data.amount,
        payment_method: data.payment_method,
        category: data.category,
        description: data.description,
        appointment_id: data.appointment_id
      }
    ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/financeiro');
  revalidatePath('/admin'); // Para o Command Center
  return { success: true };
}

/**
 * Finaliza o agendamento e já cria a transação de entrada (INCOME) de forma atômica.
 * Usa uma função RPC do Postgres para garantir que ou tudo acontece ou nada acontece.
 */
export async function finalizeAndPay(
  appointmentId: string, 
  tenantId: string, 
  amount: number, 
  method: 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO',
  cardBrand?: string,
  feeAmount?: number,
  netAmount?: number
) {
  const supabase = await createClient();

  // Chamada RPC Atômica V3: Suporta Bandeiras e Taxas
  const { error } = await supabase.rpc('finalize_appointment_with_transaction', {
    p_appointment_id: appointmentId,
    p_tenant_id: tenantId,
    p_payment_method: method,
    p_card_brand: cardBrand || null,
    p_fee_amount: feeAmount || 0,
    p_net_amount: netAmount || amount - (feeAmount || 0),
    p_description: `Pagamento de Atendimento #${appointmentId.substring(0, 5)}`
  });

  if (error) {
    console.error("Erro na transação atômica:", error);
    return { error: error.message };
  }

  revalidatePath('/admin/agenda');
  revalidatePath('/admin/financeiro');
  revalidatePath('/admin/clientes');
  revalidatePath('/admin');
  return { success: true };
}

export async function getFinancialStats(tenantId: string) {
  const supabase = await createClient();
  
  const today = new Date().toISOString().split('T')[0];

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('tenant_id', tenantId);

  const totalIncome = transactions?.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalExpense = transactions?.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  
  const todayIncome = transactions?.filter(t => t.type === 'INCOME' && t.created_at.startsWith(today)).reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  return {
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    todayIncome
  };
}

import { Tag, Search, Plus, MoreHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ComandaList from "./_components/ComandaList";

export default async function ComandasAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Buscar o tenant do usuário
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!tenant) return null;

  // Buscar todas as "Comandas" (Agendamentos) do tenant
  const [{ data: appointments }, { data: services }, { data: professionals }] = await Promise.all([
    supabase
      .from('appointments')
      .select(`
        *,
        services (name, price),
        professionals (name),
        transactions (payment_method)
      `)
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false }),
    supabase.from('services').select('*').eq('tenant_id', tenant.id).order('name', { ascending: true }),
    supabase.from('professionals').select('*').eq('tenant_id', tenant.id).eq('is_active', true).order('name', { ascending: true })
  ]);

  return (
    <div className="space-y-12">
      {/* Header Estilizado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full">
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
             <span className="text-[10px] font-mono font-black text-primary uppercase tracking-[0.4em]">FINANCEIRO_LIVE</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-white uppercase italic tracking-tighter leading-none">
            Central de <span className="text-primary tracking-normal">Comandas.</span>
          </h1>
          <p className="text-zinc-600 font-medium text-sm md:text-lg max-w-xl">
            Gerenciamento total de faturamento, fluxo de clientes e fechamento de caixa em tempo real.
          </p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-primary/30 to-transparent w-full" />

      {/* Lista Reativa de Comandas */}
      <ComandaList 
        initialAppointments={appointments || []} 
        tenantId={tenant.id} 
        services={services || []}
        professionals={professionals || []}
      />
    </div>
  );
}

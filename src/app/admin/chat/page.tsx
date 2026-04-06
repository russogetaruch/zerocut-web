import { createClient } from "@/lib/supabase/server";
import AdminChatClient from "./_components/AdminChatClient";

export const dynamic = "force-dynamic";

export default async function TenantAdminChat() {
  const supabase = await createClient();

  // MVP: Pega a tenant simulada (Deveria vir do Login JWT no futuro)
  const { data: tenantOwner } = await supabase.from('tenants').select('*').order('created_at', { ascending: false }).limit(1).single();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-mono font-bold text-white tracking-[0.2em] mb-2 flex items-center gap-3">
           <span className="text-primary">&gt;</span> CENTRAL_DE_ATENDIMENTO
        </h2>
        <p className="font-mono text-primary text-xs tracking-wider uppercase">SUPORTE EM TEMPO REAL: {tenantOwner?.name}</p>
      </div>

      <AdminChatClient tenantId={tenantOwner.id} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import ProfessionalManagement from "./_components/ProfessionalManagement";

export const dynamic = "force-dynamic";

export default async function AdminProfissionaisPage() {
  const supabase = await createClient();

  // Buscar o tenant ativo
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Tenant não encontrado.</div>;

  const { data: professionals } = await supabase
    .from('professionals')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-8 h-full">
      <ProfessionalManagement 
        initialProfessionals={professionals || []} 
        tenantId={tenant.id} 
      />
    </div>
  );
}

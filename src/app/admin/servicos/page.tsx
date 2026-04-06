import { createClient } from "@/lib/supabase/server";
import ServiceManagement from "./_components/ServiceManagement";

export const dynamic = "force-dynamic";

export default async function AdminServicosPage() {
  const supabase = await createClient();

  // Buscar o tenant ativo (Deveria vir do Login JWT futuramente)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Tenant não encontrado.</div>;

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('price', { ascending: false });

  return (
    <div className="space-y-8 h-full">
      <ServiceManagement 
        initialServices={services || []} 
        tenantId={tenant.id} 
      />
    </div>
  );
}

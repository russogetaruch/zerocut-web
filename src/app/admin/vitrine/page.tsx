import { createClient } from "@/lib/supabase/server";
import { VitrineEditor } from "./_components/VitrineEditor";

export const dynamic = "force-dynamic";

export default async function VitrinePage() {
  const supabase = await createClient();

  // Buscar o tenant logado (considerando o último para este MVP de localhost)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Barbearia não encontrada.</div>;

  return (
    <div className="max-w-6xl mx-auto py-10">
      <VitrineEditor tenant={tenant} />
    </div>
  );
}

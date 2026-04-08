import { createClient } from "@/lib/supabase/server";
import WorkingHoursManager from "./_components/WorkingHoursManager";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHorariosPage() {
  const supabase = await createClient();

  // Buscar o tenant ativo
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Tenant não encontrado.</div>;

  // Buscar horários existentes
  let { data: hours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('day_of_week', { ascending: true });

  // Se não houver horários, inicializa com padrão
  if (!hours || hours.length === 0) {
     const defaults = Array.from({ length: 7 }, (_, i) => ({
        tenant_id: tenant.id,
        day_of_week: i,
        open_time: '09:00',
        close_time: '19:00',
        is_closed: i === 0 // Domingo fechado por padrão
     }));
     
     const { data: inserted } = await supabase.from('working_hours').insert(defaults).select();
     hours = inserted;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
       {/* Header Premium */}
       <div className="flex flex-col gap-4 border-b border-[#1a1a1a] pb-10 pt-4">
        <div className="flex items-center gap-4 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#1a1a1a] w-fit shadow-xl group">
           <Clock size={18} className="text-primary" />
           <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono group-hover:text-primary transition-colors">
              ESCALA_HORARIOS
           </h2>
        </div>
        <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase">
           Configuração de Abertura e Fechamento Semanal
        </p>
      </div>

      <WorkingHoursManager 
        initialHours={hours || []} 
        tenantId={tenant.id} 
      />
      
    </div>
  );
}

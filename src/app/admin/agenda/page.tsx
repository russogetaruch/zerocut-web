import { createClient } from "@/lib/supabase/server";
import { MasterAgenda } from "./_components/MasterAgenda";
import { Calendar, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAgendaPage() {
  const supabase = await createClient();

  // Buscar o tenant ativo
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Tenant não encontrado.</div>;

  // Buscar profissionais, agendamentos e catálogo de serviços
  const [{ data: professionals }, { data: appointments }, { data: services }] = await Promise.all([
    supabase.from('professionals').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: true }),
    supabase.from('appointments').select('*, services(*)').eq('tenant_id', tenant.id).neq('status', 'CANCELED'),
    supabase.from('services').select('*').eq('tenant_id', tenant.id).order('name', { ascending: true })
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-10 pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#1a1a1a] w-fit shadow-xl group">
             <Calendar size={18} className="text-primary animate-pulse" />
             <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono group-hover:text-primary transition-colors">
                MASTER_AGENDA
             </h2>
          </div>
          <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase flex items-center gap-2">
             <Users size={10} className="text-primary" /> Visualização por: <span className="text-white bg-zinc-900 px-2 rounded">Equipe Completa</span>
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="hidden lg:flex items-center gap-10 px-8 border-x border-[#1a1a1a] mr-4 bg-[#080808]">
               <div className="text-right">
                  <p className="text-[9px] text-zinc-600 font-mono tracking-tighter uppercase mb-1">Filter.Mode</p>
                  <p className="text-[10px] text-primary font-mono font-bold tracking-widest uppercase">DAILY_VIEW</p>
               </div>
           </div>
        </div>
      </div>

      <MasterAgenda 
        professionals={professionals || []} 
        initialAppointments={appointments || []} 
        services={services || []}
      />
      
    </div>
  );
}

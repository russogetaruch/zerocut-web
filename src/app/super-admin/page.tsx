import { createClient } from "@/lib/supabase/server";
import TenantFormModal from "./_components/TenantFormModal";
import TenantListAnimated from "./_components/TenantListAnimated";
import { Database, Network, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const supabase = await createClient();
  
  const { data: tenants } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
  const activeTenants = tenants?.length || 0;

  return (
    <div className="space-y-12">
      
      {/* Header Block Minimalist */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1a1a1a] pb-6">
        <div>
          <h2 className="text-xl font-mono font-bold text-white tracking-[0.3em] uppercase mb-1">
            Gestão <span className="text-primary">Global</span>
          </h2>
          <p className="text-zinc-500 font-mono text-xs tracking-widest flex items-center gap-2">
            <Database size={12} /> DATACENTER: <span className="text-green-500">ONLINE</span>
          </p>
        </div>
        <TenantFormModal />
      </div>

      {/* Cyber/Minimalist Stat Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MinimalStat title="BARBEARIAS_ATIVAS" value={activeTenants.toString()} icon={<Network size={16}/>} trend="+2 ESTA SEMANA" />
        <MinimalStat title="REQUISIÇÕES_SEG" value="1.204" icon={<Cpu size={16}/>} trend="ESTÁVEL" />
        <MinimalStat title="RECEITA_GLOBAL" value="$0.00" icon={<Database size={16}/>} trend="AGUARDANDO STRIPE" isPrimary />
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
           <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest">&gt;&gt; BARBEARIAS_CONECTADAS</h3>
           <div className="h-[1px] flex-1 bg-gradient-to-r from-[#1a1a1a] to-transparent"></div>
        </div>
        
        {/* Animated Framer Motion Grid */}
        <TenantListAnimated tenants={tenants || []} />
      </div>

    </div>
  );
}

function MinimalStat({ title, value, icon, trend, isPrimary = false }: { title: string; value: string; icon: React.ReactNode; trend: string; isPrimary?: boolean }) {
  return (
    <div className={`p-5 rounded-lg border ${isPrimary ? 'border-primary/30 bg-primary/5' : 'border-[#1a1a1a] bg-[#0a0a0a]'}`}>
      <div className="flex justify-between items-center mb-4">
        <span className={`font-mono text-[10px] tracking-widest ${isPrimary ? 'text-primary' : 'text-zinc-500'}`}>{title}</span>
        <span className={`${isPrimary ? 'text-primary' : 'text-zinc-600'}`}>{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-mono text-3xl font-light text-white">{value}</span>
        <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase">{trend}</span>
      </div>
    </div>
  );
}

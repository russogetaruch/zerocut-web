import { createClient } from "@/lib/supabase/server";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Activity, 
  ShieldAlert,
  Zap,
  DollarSign,
  ArrowUpRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const supabase = await createClient();

  // 1. Total Tenants (Lojas)
  const { data: tenants } = await supabase.from('tenants').select('id, name, created_at');
  
  // 2. Total Transactions (Plataforma Global)
  const { data: globalTransactions } = await supabase.from('transactions').select('amount, type, created_at');

  const totalGlobalRevenue = globalTransactions
    ?.filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  // 3. New shops this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newShops = tenants?.filter(t => new Date(t.created_at) >= oneWeekAgo).length || 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      
      {/* Super Header */}
      <div className="flex flex-col gap-4 border-b border-[#1a1a1a] pb-12 pt-4">
        <div className="flex items-center gap-4 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 w-fit group">
           <ShieldAlert size={18} className="text-primary animate-pulse" />
           <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono">
              SYSTEM_OVERLORD
           </h2>
        </div>
        <p className="font-mono text-zinc-600 text-[10px] tracking-[0.5em] uppercase">
           Global Platform Performance & SaaS Analytics
        </p>
      </div>

      {/* SaaS High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricCard title="Total_Tenants" value={tenants?.length || 0} icon={<Building2 />} trend="+12%" />
         <MetricCard title="Global_GMV" value={`R$ ${totalGlobalRevenue.toLocaleString()}`} icon={<TrendingUp />} trend="+4.5%" />
         <MetricCard title="New_Units_Week" value={newShops} icon={<Zap />} trend="NEW" />
         <MetricCard title="Avg_Ticket" value={`R$ ${(totalGlobalRevenue / (globalTransactions?.filter(t => t.type === 'INCOME').length || 1)).toFixed(2)}`} icon={<Activity />} />
      </div>

      {/* Lojas Recentes & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         <div className="lg:col-span-8 bg-[#080808] border border-[#1a1a1a] rounded-[2.5rem] p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full"></div>
            
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h4 className="text-xl font-serif font-black text-white uppercase italic tracking-tighter">Últimas Lojas Ativadas_</h4>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">SaaS Onboarding Stream</p>
               </div>
               <button className="p-3 bg-white/5 text-zinc-500 rounded-xl hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">Ver Todas</button>
            </div>

            <div className="space-y-4">
               {tenants?.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-6 bg-black border border-white/5 rounded-2xl hover:border-primary/20 transition-all group">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center font-black text-xs text-zinc-600 group-hover:text-primary transition-colors uppercase">
                           {t.name.substring(0, 2)}
                        </div>
                        <div>
                           <h5 className="text-white font-bold tracking-tight">{t.name}</h5>
                           <p className="text-[9px] font-mono text-zinc-700 uppercase">Ativado em: {new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-full font-black uppercase tracking-widest">Ativo</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <DollarSign size={120} />
               </div>
               <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4 italic">Estimated_MRR</p>
               <h3 className="text-5xl font-serif font-black text-white tracking-tighter">R$ 1.150,00</h3>
               <div className="mt-8 flex items-center gap-2 text-[10px] font-mono text-primary font-black uppercase tracking-widest">
                  <ArrowUpRight size={14} /> SaaS Fee (15%)
               </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2rem]">
               <h5 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6">Health_Check_Status</h5>
               <div className="space-y-4">
                  <StatusRow label="Supabase Auth" status="OK" />
                  <StatusRow label="Vercel Deployment" status="OK" />
                  <StatusRow label="Worker RPC V6" status="OK" />
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: any, icon: any, trend?: string }) {
  return (
    <div className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-3xl hover:border-primary/30 transition-all group relative overflow-hidden">
       <div className="absolute top-0 right-0 p-4 text-zinc-800 group-hover:text-primary/20 transition-colors">
          {icon}
       </div>
       <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">{title}</p>
       <h3 className="text-3xl font-serif font-black text-white tracking-tight italic">{value}</h3>
       {trend && (
          <div className="mt-4 inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-widest font-mono">
             {trend}
          </div>
       )}
    </div>
  );
}

function StatusRow({ label, status }: { label: string, status: string }) {
   return (
      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
         <span className="text-zinc-500">{label}_</span>
         <span className="text-green-500 font-bold">{status}</span>
      </div>
   );
}

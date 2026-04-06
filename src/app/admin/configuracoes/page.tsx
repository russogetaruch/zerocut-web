import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./_components/SettingsForm";
import { Settings, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Buscar o tenant ativo
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!tenant) return <div>Loja não encontrada.</div>;

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Premium */}
      <div className="flex flex-col gap-4 border-b border-[#1a1a1a] pb-10 pt-4">
        <div className="flex items-center gap-4 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#1a1a1a] w-fit shadow-xl group">
           <Settings size={18} className="text-primary animate-spin-slow" />
           <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono group-hover:text-primary transition-colors">
              CONFIG_SISTEMA
           </h2>
        </div>
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] tracking-widest uppercase">
           <ShieldCheck size={12} className="text-green-500" /> 
           Ambiente Seguro: <span className="text-white">Admin da Unidade</span>
        </div>
      </div>

      <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
         {/* Efeito de decoracao */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
         
         <SettingsForm tenant={tenant} />
      </div>
      
    </div>
  );
}

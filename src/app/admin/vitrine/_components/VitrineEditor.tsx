"use client";

import { useState, useTransition } from "react";
import { 
  Monitor, 
  Layout, 
  Image as ImageIcon, 
  Type, 
  CheckCircle,
  Eye,
  RefreshCcw,
  Zap
} from "lucide-react";
import { updateTenant } from "../../agenda/actions";
import { createClient } from "@/lib/supabase/client";

export function VitrineEditor({ tenant }: { tenant: any }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: tenant.name || "",
    address: tenant.address || "",
    logo_url: tenant.logo_url || "",
    tagline: tenant.tagline || "",
    description: tenant.description || "",
    banner_url: tenant.banner_url || ""
  });

  const [message, setMessage] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'banner_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${tenant.id}-${field}-${Math.random()}.${fileExt}`;
    const filePath = `tenants/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('barbershop-assets')
      .upload(filePath, file);

    if (uploadError) {
       console.error(uploadError);
       return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('barbershop-assets')
      .getPublicUrl(filePath);

    setFormData(prev => ({ ...prev, [field]: publicUrl }));
  };

  const handleSave = () => {
    startTransition(async () => {
       const result = await updateTenant(tenant.id, formData);
       if (result.success) {
          setMessage("Vitrine atualizada com sucesso!");
          setTimeout(() => setMessage(""), 3000);
       }
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Layout size={20} className="text-primary" />
             </div>
             <h2 className="text-3xl font-black text-white tracking-tight uppercase font-mono">EDITOR_DE_VITRINE</h2>
          </div>
          <p className="font-mono text-zinc-500 text-[10px] tracking-[0.4em] uppercase">Controle Visual da sua Landing Page Pública</p>
        </div>

        <div className="flex gap-4">
           <a 
             href={`/b/${tenant.slug}`} 
             target="_blank"
             className="px-6 py-3 bg-zinc-900 text-zinc-400 font-bold text-[10px] tracking-widest uppercase rounded-xl border border-[#222] hover:text-white transition-all flex items-center gap-2"
           >
              <Eye size={14} /> Visualizar Site
           </a>
           <button 
             onClick={handleSave}
             disabled={isPending}
             className="px-8 py-3 bg-primary text-black font-black text-[10px] tracking-widest uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center gap-2"
           >
              {isPending ? <RefreshCcw size={14} className="animate-spin" /> : <Zap size={14} />} Salvar Alterações
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
         
         {/* Form de Edição */}
         <div className="space-y-8">
            
            <section className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] space-y-6">
               <div className="flex items-center gap-3 border-b border-[#1a1a1a] pb-4">
                  <Type size={18} className="text-zinc-500" />
                  <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest font-bold">Textos e Mensagens</h3>
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2 ml-1">Frase de Efeito (Tagline)</label>
                    <input 
                      value={formData.tagline}
                      onChange={e => setFormData(p => ({ ...p, tagline: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-2xl text-white focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="Ex: O melhor degradê da região"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2 ml-1">Descrição Curta</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-2xl text-white focus:outline-none focus:border-primary transition-colors text-sm min-h-[120px]"
                      placeholder="Fale um pouco sobre a experiência da sua barbearia..."
                    />
                  </div>
               </div>
            </section>

            <section className="bg-[#080808] border border-[#1a1a1a] p-8 rounded-[2rem] space-y-6">
               <div className="flex items-center gap-3 border-b border-[#1a1a1a] pb-4">
                  <ImageIcon size={18} className="text-zinc-500" />
                  <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest font-bold">Imagens e Identidade</h3>
               </div>

               <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3 ml-1">Banner Principal (Fundo)</label>
                    <div className="relative group">
                       <div className="w-full h-48 rounded-[2rem] bg-zinc-900/50 border border-[#1a1a1a] overflow-hidden">
                          {formData.banner_url ? (
                            <img src={formData.banner_url} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Banner Preview" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                               <ImageIcon size={40} className="mb-2" />
                               <p className="text-[10px] font-mono uppercase tracking-[0.3em]">SEM_BANNER</p>
                            </div>
                          )}
                       </div>
                       <input 
                         type="file" 
                         onChange={e => handleUpload(e, 'banner_url')}
                         className="absolute inset-0 opacity-0 cursor-pointer" 
                       />
                       <div className="absolute bottom-4 right-4 bg-primary text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                          <RefreshCcw size={12} /> Alterar Foto
                       </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3 ml-1">Logotipo (Square)</label>
                    <div className="flex items-center gap-6">
                       <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-[#1a1a1a] p-2 flex items-center justify-center relative group overflow-hidden">
                          {formData.logo_url ? (
                             <img src={formData.logo_url} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
                          ) : (
                             <Monitor size={24} className="text-zinc-700" />
                          )}
                          <input type="file" onChange={e => handleUpload(e, 'logo_url')} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                       <div className="flex-1 space-y-2">
                          <h4 className="text-white text-xs font-bold uppercase tracking-tight">Dica de Professional</h4>
                          <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                             Use um logotipo com fundo transparente (PNG) e formato quadrado para melhor encaixe no círculo flutuante.
                          </p>
                       </div>
                    </div>
                  </div>
               </div>
            </section>
         </div>

         {/* Simulação de Preview */}
         <div className="hidden xl:block">
            <div className="sticky top-24">
               <div className="bg-[#050505] border border-[#1a1a1a] rounded-[3rem] p-6 shadow-[0_0_100px_rgba(0,0,0,0.5)] h-[80vh] overflow-hidden relative group">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-black border border-[#1a1a1a] rounded-full z-20 flex items-center justify-center">
                     <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full mr-2" />
                     <div className="w-10 h-1 bg-zinc-800 rounded-full" />
                  </div>

                  <div className="w-full h-full bg-black rounded-[2.5rem] overflow-y-auto no-scrollbar border-4 border-zinc-900 shadow-inner">
                     <div className="relative h-60 w-full overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-all duration-700" 
                          style={{ backgroundImage: `url(${formData.banner_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70'})`, opacity: 0.4 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 text-center">
                           {formData.logo_url && <img src={formData.logo_url} className="w-12 h-12 mx-auto mb-3 border border-primary/30 rounded-xl bg-black/50 p-1" alt="" />}
                           <h2 className="text-xl font-serif font-black text-white uppercase tracking-tight leading-none mb-2">{formData.name}</h2>
                           <p className="text-[8px] text-primary font-mono uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20 w-fit mx-auto">{formData.tagline || 'SEU_TAGLINE'}</p>
                        </div>
                     </div>
                     <div className="p-6">
                        <div className="h-24 bg-zinc-900/50 rounded-2xl border border-[#1a1a1a] p-4 mb-4">
                           <div className="w-1/2 h-1 bg-zinc-800 rounded-full mb-3" />
                           <div className="w-full h-1 bg-zinc-800 rounded-full mb-2 opacity-50" />
                           <div className="w-3/4 h-1 bg-zinc-800 rounded-full opacity-30" />
                        </div>
                        <div className="h-10 bg-primary rounded-xl" />
                     </div>
                  </div>

                  <div className="absolute inset-0 pointer-events-none border-[12px] border-[#151515] rounded-[3rem] shadow-2xl" />
               </div>
               <p className="text-center mt-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Preview Digital Mobile</p>
            </div>
         </div>
      </div>

      {message && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-black font-black text-xs px-10 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
           <CheckCircle size={18} /> {message}
        </div>
      )}
    </div>
  );
}

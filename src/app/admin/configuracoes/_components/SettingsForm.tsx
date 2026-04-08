"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, Save, Globe, MapPin, Tag, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateTenant } from "../../agenda/actions";
import { useRouter } from "next/navigation";

export function SettingsForm({ tenant }: { tenant: any }) {
  const [formData, setFormData] = useState({
    name: tenant.name || "",
    slug: tenant.slug || "",
    tagline: tenant.tagline || "",
    address: tenant.address || "",
    logo_url: tenant.logo_url || "",
    banner_url: tenant.banner_url || "",
    loyalty_target_cuts: tenant.loyalty_target_cuts || 10
  });
  
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${tenant.id}-${type}-${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert("Erro ao subir imagem: " + uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setFormData(prev => ({ ...prev, [type === 'logo' ? 'logo_url' : 'banner_url']: publicUrl }));
    setIsUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
       const result = await updateTenant(tenant.id, formData);
       if (result.success) {
          alert("Configurações atualizadas com sucesso!");
          router.refresh();
       } else {
          alert("Erro: " + result.error);
       }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
       
       <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
          {/* Upload de Logo Premium */}
          <div className="relative group">
             <div className="w-32 h-32 rounded-3xl bg-zinc-900 border-2 border-[#1a1a1a] group-hover:border-primary transition-all overflow-hidden flex items-center justify-center relative shadow-2xl">
                {formData.logo_url ? (
                   <img src={formData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                   <div className="text-zinc-600 font-serif text-3xl font-black">{formData.name.charAt(0)}</div>
                )}
                
                <div onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                   <Camera className="text-white mb-2" size={24} />
                   <span className="text-[8px] font-mono font-bold text-white uppercase tracking-widest">Alterar Logo</span>
                </div>

                {isUploading && (
                   <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <RefreshCw size={24} className="text-primary animate-spin" />
                   </div>
                )}
             </div>
             <input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" />
             <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl text-black shadow-lg">
                <Tag size={14} />
             </div>
          </div>

          <div className="flex-1 space-y-4">
             <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                   <Globe size={10} className="text-primary" /> Identificação Pública
                </label>
                <div className="flex bg-black p-4 rounded-2xl border border-[#1a1a1a] focus-within:border-primary transition-colors">
                   <span className="text-zinc-700 font-mono text-xs pr-2 border-r border-[#1a1a1a]">zerocut.com/b/</span>
                   <input 
                      type="text" 
                      value={formData.slug}
                      readOnly
                      className="bg-transparent outline-none text-zinc-500 font-mono text-xs pl-2 flex-1 cursor-not-allowed"
                      placeholder="minha-barbearia"
                   />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Nome do Estabelecimento</label>
                <input 
                   type="text" 
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full bg-black p-4 rounded-2xl border border-[#1a1a1a] text-white font-bold tracking-tight outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary"
                />
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Tagline / Slogan de Impacto</label>
                <input 
                   type="text" 
                   value={formData.tagline}
                   onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                   placeholder="Ex: Onde a tradição encontra o luxo."
                   className="w-full bg-black p-4 rounded-2xl border border-[#1a1a1a] text-zinc-300 text-sm outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary"
                />
             </div>
          </div>
       </div>

       {/* Banner Customization */}
       <div className="space-y-4 pt-8 border-t border-[#1a1a1a]">
          <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Ambiente Visual (Banner Vitrine)</label>
          <div 
             className="relative w-full h-48 rounded-[2rem] bg-zinc-900 border-2 border-dashed border-[#1a1a1a] hover:border-primary/50 transition-all overflow-hidden flex items-center justify-center cursor-pointer group"
             onClick={() => {
                const bannerInput = document.createElement('input');
                bannerInput.type = 'file';
                bannerInput.accept = 'image/*';
                bannerInput.onchange = (e) => handleFileUpload(e as any, 'banner');
                bannerInput.click();
             }}
          >
             {formData.banner_url ? (
                <img src={formData.banner_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Banner" />
             ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-600">
                   <Camera size={24} />
                   <span className="text-[10px] font-mono uppercase tracking-widest">Escolher Banner de Fundo</span>
                </div>
             )}
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                <Camera className="text-white mb-2" size={24} />
                <span className="text-[10px] font-mono font-black text-white uppercase tracking-widest">Trocar Imagem de Fundo</span>
             </div>
          </div>
       </div>

       <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
          <div className="space-y-1">
             <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-2 text-zinc-500">
                <MapPin size={10} className="text-primary" /> Localização Física
             </label>
             <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Ex: Rua das Navalhas, 123 - Centro, São Paulo"
                className="w-full bg-black p-4 rounded-2xl border border-[#1a1a1a] text-zinc-300 text-sm outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary"
             />
          </div>

          <div className="space-y-1 mt-6">
             <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-2 text-primary">
                <Tag size={10} className="text-primary" /> Meta do Clube VIP (Fidelidade)
             </label>
             <div className="flex items-center gap-4">
                <input 
                   type="number" 
                   value={formData.loyalty_target_cuts}
                   onChange={(e) => setFormData({...formData, loyalty_target_cuts: parseInt(e.target.value)})}
                   className="w-32 bg-black p-4 rounded-2xl border border-[#1a1a1a] text-white font-bold text-lg outline-none focus:border-primary transition-colors text-center"
                   min="1"
                   max="100"
                />
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Cortes registrados para o benefício grátis</p>
             </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl mt-10">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-2xl">
                   <Save size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                   <h4 className="text-white font-bold text-lg mb-1 tracking-tight">Manter Dados Atualizados</h4>
                   <p className="text-zinc-500 text-xs leading-relaxed max-w-md">
                      Essas informações aparecem na sua Vitrine Pública e nas notificações enviadas aos clientes.
                   </p>
                </div>
                <button 
                   type="submit"
                   disabled={isPending}
                   className="px-10 py-5 bg-primary text-black font-black text-xs tracking-[0.2em] rounded-2xl hover:bg-primary/90 transition-all uppercase shadow-[0_0_30px_rgba(212,175,55,0.2)] disabled:opacity-50"
                >
                   {isPending ? "SALVANDO..." : "ATUALIZAR_DADOS"}
                </button>
             </div>
          </div>
       </div>

    </form>
  );
}

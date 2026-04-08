"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { Camera, Save, Globe, MapPin, Tag, RefreshCw, Smartphone, ShieldCheck, Zap, Award, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateTenant } from "../../agenda/actions";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* Lado Esquerdo: Formulário */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
         
         <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                     <Globe size={18} className="text-primary" />
                  </div>
                  <div>
                     <h3 className="text-white font-bold tracking-tight">Identidade Visual</h3>
                     <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Branding & Layout Vitrine</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
               {/* Logo Upload - Ajuste 1: Mais limpo e premium */}
               <div className="relative group">
                  <div className="w-40 h-40 rounded-[2rem] bg-black border border-[#1a1a1a] group-hover:border-primary transition-all overflow-hidden flex items-center justify-center relative shadow-2xl">
                     {formData.logo_url ? (
                        <img src={formData.logo_url} className="w-full h-full object-contain p-4" alt="Logo" />
                     ) : (
                        <div className="text-zinc-600 font-serif text-5xl font-black italic">{formData.name.charAt(0)}</div>
                     )}
                     
                     <div onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                        <Camera className="text-primary mb-2" size={24} />
                        <span className="text-[9px] font-mono font-black text-white uppercase tracking-widest">Alterar_Logo</span>
                     </div>

                     {isUploading && (
                        <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                           <RefreshCw size={24} className="text-primary animate-spin" />
                        </div>
                     )}
                  </div>
                  <input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" />
               </div>

               <div className="flex-1 space-y-6 w-full">
                  <div className="space-y-2">
                     <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Nome do Estabelecimento</label>
                     <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black p-4 rounded-xl border border-[#1a1a1a] text-white font-bold tracking-tight outline-none focus:border-primary transition-all focus:ring-1 focus:ring-primary"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Tagline (Slogan de Elite)</label>
                     <input 
                        type="text" 
                        value={formData.tagline}
                        onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                        placeholder="Ex: O Corte Perfeito para o Homem de Atitude"
                        className="w-full bg-black p-4 rounded-xl border border-[#1a1a1a] text-zinc-400 text-sm outline-none focus:border-primary transition-all font-medium"
                     />
                  </div>
               </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-[#1a1a1a]">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Endereço Público</label>
                     <div className="relative">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                        <input 
                           type="text" 
                           value={formData.address}
                           onChange={(e) => setFormData({...formData, address: e.target.value})}
                           placeholder="Rua das Tesouras, 123 - Centro"
                           className="w-full bg-black pl-12 pr-4 py-4 rounded-xl border border-[#1a1a1a] text-zinc-300 text-sm outline-none focus:border-primary transition-all"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Meta de Fidelidade (Cortes)</label>
                     <div className="relative">
                        <Zap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                        <input 
                           type="number" 
                           value={formData.loyalty_target_cuts}
                           onChange={(e) => setFormData({...formData, loyalty_target_cuts: parseInt(e.target.value)})}
                           className="w-full bg-black pl-12 pr-4 py-4 rounded-xl border border-[#1a1a1a] text-zinc-300 text-sm outline-none focus:border-primary transition-all"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest italic">/Banner de Fundo (90vh Overlay)</label>
                  <div 
                     className="relative w-full h-44 rounded-3xl bg-zinc-950 border-2 border-dashed border-[#1a1a1a] hover:border-primary/50 transition-all overflow-hidden flex items-center justify-center cursor-pointer group"
                     onClick={() => {
                        const bannerInput = document.createElement('input');
                        bannerInput.type = 'file';
                        bannerInput.accept = 'image/*';
                        bannerInput.onchange = (e) => handleFileUpload(e as any, 'banner');
                        bannerInput.click();
                     }}
                  >
                     {formData.banner_url ? (
                        <img src={formData.banner_url} className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Banner" />
                     ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-700">
                           <Camera size={24} />
                           <span className="text-[9px] font-mono uppercase tracking-widest font-black">Upload_Background</span>
                        </div>
                     )}
                     <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-4">
               <button 
                  type="submit"
                  disabled={isPending}
                  className="px-12 py-5 bg-primary text-black font-black text-[11px] tracking-[0.3em] rounded-2xl hover:bg-white transition-all uppercase shadow-[0_15px_40px_rgba(212,175,55,0.2)] disabled:opacity-50"
               >
                  {isPending ? "SINCRONIZANDO..." : "ATUALIZAR_SISTEMA"}
               </button>
            </div>
         </div>

      </form>

      {/* Lado Direito: Preview Mobile Elite (Ajuste 2) */}
      <div className="lg:col-span-5 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-1000">
         <div className="sticky top-10 w-full max-w-[340px] space-y-6">
            
            <div className="flex items-center justify-between px-6">
               <div className="flex items-center gap-2">
                  <Smartphone size={14} className="text-zinc-600" />
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black">PREVIEW_DIGITAL_MOBILE</span>
               </div>
            </div>

            {/* Mockup iPhone */}
            <div className="relative aspect-[9/19] w-full bg-[#050505] rounded-[3.5rem] border-[8px] border-[#151515] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
               {/* "Dynamic Island" */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#151515] rounded-b-2xl z-50"></div>

               {/* Banner Background */}
               <div 
                  className="absolute inset-0 h-1/2 bg-cover bg-center grayscale opacity-40 transition-all duration-700"
                  style={{ backgroundImage: `url(${formData.banner_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80'})` }}
               ></div>
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black to-black"></div>

               <div className="relative h-full flex flex-col items-center p-6 pt-20 text-center">
                  
                  {/* Floating Logo - Circular & Premium */}
                  <div className="relative mb-6">
                     <div className="w-24 h-24 p-0.5 rounded-full bg-gradient-to-tr from-primary/60 via-white/10 to-transparent shadow-2xl">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/5">
                           <img src={formData.logo_url || '/logo.png'} className="w-[85%] h-[85%] object-contain scale-110" alt="Logo" />
                        </div>
                     </div>
                  </div>

                  <h4 className="text-3xl font-serif font-black text-white italic tracking-tighter uppercase mb-2 leading-none">
                     {formData.name || "BARBEARIA_01"}
                  </h4>
                  
                  <div className="bg-primary px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 mb-4 inline-block">
                     <p className="text-[7px] font-mono text-black font-black uppercase tracking-[0.2em]">
                        {formData.tagline || "REDEFININDO_O_ESTILO"}
                     </p>
                  </div>

                  <div className="flex flex-col items-center gap-2 mb-10">
                     <div className="flex items-center gap-1.5 text-zinc-500">
                        <MapPin size={8} className="text-primary" />
                        <span className="text-[7px] font-mono uppercase tracking-widest">{formData.address || "Localização Prime"}</span>
                     </div>
                  </div>

                  <div className="w-full space-y-3 mt-4">
                     <div className="h-10 w-full bg-[#111] rounded-xl border border-white/5 flex items-center px-4 justify-between">
                        <div className="w-20 h-2 bg-zinc-800 rounded-full"></div>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20"></div>
                     </div>
                     <div className="h-10 w-full bg-[#111] rounded-xl border border-white/5 flex items-center px-4 justify-between">
                        <div className="w-24 h-2 bg-zinc-800 rounded-full"></div>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20"></div>
                     </div>
                     
                     <div className="pt-4">
                        <div className="w-full py-4 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                           AGENDAR_AGORA_
                        </div>
                     </div>
                  </div>

                  {/* Vibe Indicators */}
                  <div className="absolute bottom-10 left-0 right-0 px-8 flex justify-between items-center opacity-40">
                     <ShieldCheck size={12} className="text-primary" />
                     <Zap size={12} className="text-zinc-600" />
                     <Award size={12} className="text-zinc-600" />
                     <Star size={12} className="text-zinc-600" />
                  </div>
               </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-start gap-3">
               <Zap size={14} className="text-primary shrink-0 mt-0.5" />
               <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
                  Este mockup reflete a visão mobile dos seus clientes. Fotos com alta resolução (PNG/JPG) garantem uma melhor experiência sensorial.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}

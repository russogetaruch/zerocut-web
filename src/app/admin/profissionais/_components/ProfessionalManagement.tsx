"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, User, Briefcase, Image as ImageIcon, Upload, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveProfessional, deleteProfessional } from "../actions";
import { createClient } from "@/lib/supabase/client";

export default function ProfessionalManagement({ initialProfessionals, tenantId }: { initialProfessionals: any[], tenantId: string }) {
  const [professionals, setProfessionals] = useState(initialProfessionals);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({ name: "", specialty: "", avatarUrl: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  function openNew() {
    setEditingProf(null);
    setFormData({ name: "", specialty: "", avatarUrl: "" });
    setPreviewUrl("");
    setSelectedFile(null);
    setIsDrawerOpen(true);
  }

  function openEdit(prof: any) {
    setEditingProf(prof);
    setFormData({ name: prof.name, specialty: prof.specialty || "", avatarUrl: prof.avatar_url || "" });
    setPreviewUrl(prof.avatar_url || "");
    setSelectedFile(null);
    setIsDrawerOpen(true);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setIsSubmitting(true);

    let finalAvatarUrl = formData.avatarUrl;

    // 1. Se houver um novo arquivo, faz o UPLOAD primeiro
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${tenantId}/${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile);

      if (uploadError) {
        alert("Erro no upload: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      // 2. Pegar a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      finalAvatarUrl = publicUrl;
    }
    
    // 3. Salva os dados no Banco
    const result = await saveProfessional(tenantId, {
      id: editingProf?.id,
      name: formData.name,
      specialty: formData.specialty,
      avatarUrl: finalAvatarUrl
    });

    setIsSubmitting(false);
    if (!result.error) {
       setIsDrawerOpen(false);
       window.location.reload(); 
    } else {
       alert(result.error);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Deseja realmente remover este profissional da equipe?")) return;
    const result = await deleteProfessional(id);
    if (!result.error) window.location.reload();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Interativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] shadow-xl">
         <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-1 tracking-tight">Gestão de Equipe</h2>
            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Gerenciamento de Barbeiros
            </p>
         </div>
         <button 
           onClick={openNew}
           className="bg-primary text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95 text-xs tracking-widest"
         >
            <Plus size={16} /> ADICIONAR BARBEIRO
         </button>
      </div>

      {/* Listagem de Equipe (Cards de Perfil) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {professionals.map((prof) => (
            <motion.div 
               layoutId={prof.id}
               key={prof.id} 
               className="group bg-[#080808] border border-[#1a1a1a] p-6 rounded-3xl hover:border-primary/40 transition-all text-center flex flex-col items-center"
            >
               <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full border-2 border-[#1a1a1a] p-1 group-hover:border-primary transition-colors">
                     <img 
                        src={prof.avatar_url || `https://i.pravatar.cc/150?u=${prof.id}`} 
                        alt={prof.name}
                        className="w-full h-full rounded-full object-cover filter grayscale group-hover:grayscale-0 transition-all"
                     />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-black p-1.5 rounded-full border-4 border-black">
                     <Briefcase size={12} />
                  </div>
               </div>

               <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{prof.name}</h3>
               <p className="text-xs text-zinc-500 font-mono tracking-wide uppercase mb-6">{prof.specialty || "Profissional"}</p>
               
               <div className="flex gap-2 w-full pt-4 border-t border-[#151515]">
                  <button 
                    onClick={() => openEdit(prof)}
                    className="flex-1 py-2 bg-zinc-900/50 text-zinc-500 hover:text-white rounded-lg transition-colors border border-transparent hover:border-zinc-700 text-[10px] font-mono tracking-widest uppercase"
                  >
                     EDITAR
                  </button>
                  <button 
                    onClick={() => handleRemove(prof.id)}
                    className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>
            </motion.div>
         ))}
      </div>

      {/* DRAWER LATERAL PREMIUM */}
      <AnimatePresence>
        {isDrawerOpen && (
           <>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsDrawerOpen(false)}
               className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
             />
             <motion.div 
               initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-[#1a1a1a] z-[101] shadow-2xl flex flex-col"
             >
                <div className="p-8 border-b border-[#1a1a1a] flex justify-between items-center bg-black">
                   <div>
                      <h3 className="text-xl font-bold text-white font-serif">{editingProf ? "Editar Barbeiro" : "Contratar Profissional"}</h3>
                      <p className="text-xs text-primary font-mono tracking-widest uppercase">Portal de Equipe</p>
                   </div>
                   <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-900 transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-8 overflow-y-auto">
                   
                   {/* ÁREA DE FOTO PREMIUM */}
                   <div className="flex flex-col items-center gap-4">
                      <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#222] hover:border-primary transition-all cursor-pointer group flex items-center justify-center bg-[#0d0d0d] overflow-hidden"
                      >
                         {previewUrl ? (
                            <img src={previewUrl} className="w-full h-full object-cover" />
                         ) : (
                            <div className="flex flex-col items-center text-zinc-600 group-hover:text-primary transition-colors">
                               <Camera size={32} strokeWidth={1} />
                               <span className="text-[8px] font-mono tracking-tighter uppercase mt-2">Upload.Photo</span>
                            </div>
                         )}
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="text-white" size={24} />
                         </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[9px] font-mono text-zinc-500 hover:text-primary uppercase tracking-[0.2em] transition-colors"
                      >
                         Trocar Foto da Galeria
                      </button>
                   </div>

                   <div className="space-y-6 pt-4 border-t border-[#151515]">
                      <div className="space-y-2">
                         <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Nome do Barbeiro</label>
                         <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                            <input 
                              required
                              type="text" 
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="Ex: João Master" 
                              className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Especialidade</label>
                         <div className="relative">
                            <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                            <input 
                              required
                              type="text" 
                              value={formData.specialty}
                              onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                              placeholder="Ex: Barboterapia / Fade" 
                              className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 space-y-4">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                      >
                         {isSubmitting ? "ENVIANDO ARQUIVOS..." : editingProf ? "SALVAR ALTERAÇÕES" : "CADASTRAR EQUIPE"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        className="w-full bg-transparent text-zinc-500 border border-[#222] font-mono tracking-widest text-[10px] py-3 rounded-xl hover:text-white hover:border-zinc-700 transition-all uppercase"
                      >
                         Descartar
                      </button>
                   </div>
                </form>
             </motion.div>
           </>
        )}
      </AnimatePresence>
    </div>
  );
}

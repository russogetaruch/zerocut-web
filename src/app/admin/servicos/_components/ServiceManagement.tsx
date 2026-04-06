"use client";

import { useState } from "react";
import { Scissors, Plus, Pencil, Trash2, X, Clock, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveService, deleteService } from "../actions";

export default function ServiceManagement({ initialServices, tenantId }: { initialServices: any[], tenantId: string }) {
  const [services, setServices] = useState(initialServices);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: "", price: "", duration: "45" });

  function openNew() {
    setEditingService(null);
    setFormData({ name: "", price: "", duration: "45" });
    setIsDrawerOpen(true);
  }

  function openEdit(srv: any) {
    setEditingService(srv);
    setFormData({ name: srv.name, price: srv.price.toString(), duration: srv.duration_minutes.toString() });
    setIsDrawerOpen(true);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await saveService(tenantId, {
      id: editingService?.id,
      name: formData.name,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration)
    });

    setIsSubmitting(false);
    if (!result.error) {
       setIsDrawerOpen(false);
       // Refresh local (Simplified, since revalidatePath will handle real refresh)
       window.location.reload(); 
    } else {
       alert(result.error);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Deseja realmente excluir este serviço?")) return;
    const result = await deleteService(id);
    if (!result.error) window.location.reload();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Interativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] shadow-xl">
         <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-1 tracking-tight">Catálogo de Serviços</h2>
            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Gerenciamento de Portfólio
            </p>
         </div>
         <button 
           onClick={openNew}
           className="bg-primary text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95"
         >
            <Plus size={18} /> NOVO SERVIÇO
         </button>
      </div>

      {/* Grid de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {services.map((srv) => (
            <motion.div 
               layoutId={srv.id}
               key={srv.id} 
               className="group bg-[#080808] border border-[#1a1a1a] p-6 rounded-2xl hover:border-primary/40 transition-all relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-primary transition-colors"></div>
               
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                     <Scissors size={20} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openEdit(srv)} className="p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-zinc-700">
                        <Pencil size={14} />
                     </button>
                     <button onClick={() => handleRemove(srv.id)} className="p-2 bg-zinc-900 text-red-500/50 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                        <Trash2 size={14} />
                     </button>
                  </div>
               </div>

               <h3 className="text-lg font-bold text-white mb-4 group-hover:text-primary transition-colors">{srv.name}</h3>
               
               <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Investimento</span>
                     <span className="text-xl font-bold text-white tracking-tight">R$ {srv.price}</span>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Duração</span>
                     <span className="text-sm font-mono text-zinc-400 flex items-center gap-1">
                        <Clock size={12} className="text-primary" /> {srv.duration_minutes}m
                     </span>
                  </div>
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
                      <h3 className="text-xl font-bold text-white font-serif">{editingService ? "Editar Serviço" : "Cadastrar Novo"}</h3>
                      <p className="text-xs text-primary font-mono tracking-widest uppercase">Portal de Catálogo</p>
                   </div>
                   <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-900 transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Nome do Serviço</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Skin Fade Platinum" 
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all shadow-inner"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Preço (R$)</label>
                         <div className="relative">
                            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                            <input 
                              required
                              type="number" 
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({...formData, price: e.target.value})}
                              placeholder="0.00" 
                              className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all shadow-inner"
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Minutos</label>
                         <div className="relative">
                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                            <input 
                              required
                              type="number" 
                              value={formData.duration}
                              onChange={(e) => setFormData({...formData, duration: e.target.value})}
                              placeholder="45" 
                              className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all shadow-inner"
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
                         {isSubmitting ? "SALVANDO..." : editingService ? "SALVAR ALTERAÇÕES" : "CADASTRAR AGORA"}
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

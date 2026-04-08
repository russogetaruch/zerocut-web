"use client";

import { useState } from "react";
import { Search, Plus, MoreHorizontal, Clock, User, Scissors, X, Calendar as CalendarIcon, MessageCircle } from "lucide-react";
import CheckoutModal from "../../_components/CheckoutModal";
import { finalizeAndPay } from "../../financeiro/actions";
import { createManualAppointment } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

export default function ComandaList({ 
  initialAppointments, 
  tenantId,
  services,
  professionals
}: { 
  initialAppointments: any[], 
  tenantId: string,
  services: any[],
  professionals: any[]
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'Abertas' | 'Pagas' | 'Canceladas'>('Abertas');
  
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  // State para Nova Comanda
  const [newComanda, setNewComanda] = useState({
    clientName: "",
    clientPhone: "",
    serviceId: "",
    professionalId: "",
    status: "WAITING"
  });

  const filtered = appointments.filter(app => {
    const matchesSearch = app.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.services?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'Abertas') return matchesSearch && app.status !== 'COMPLETED' && app.status !== 'CANCELED';
    if (filter === 'Pagas') return matchesSearch && app.status === 'COMPLETED';
    if (filter === 'Canceladas') return matchesSearch && app.status === 'CANCELED';
    return matchesSearch;
  });

  async function handleFinalizeConfirm(
    method: 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO', 
    brand: string, 
    fee: number, 
    net: number
  ) {
    if (!selectedAppointment) return;

    setIsUpdating(selectedAppointment.id);
    const result = await finalizeAndPay(
      selectedAppointment.id, 
      tenantId, 
      selectedAppointment.services?.price || 0, 
      method, 
      brand, 
      fee, 
      net
    );
    
    setIsUpdating(null);

    if (result?.error) {
       alert("Erro ao finalizar: " + result.error);
    } else {
       // Atualiza cache local para feedback instantâneo
       setAppointments(prev => prev.map(a => 
         a.id === selectedAppointment.id ? { ...a, status: 'COMPLETED' } : a
       ));
       setSelectedAppointment(null);
    }
  }

  async function handleCreateManual() {
    if (!newComanda.clientName || !newComanda.serviceId) {
      alert("Preencha ao menos o nome do cliente e o serviço.");
      return;
    }

    setIsUpdating("new");
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('pt-BR', { hour12: false }).substring(0, 5);

    const result = await createManualAppointment(tenantId, {
      ...newComanda,
      appointmentDate: today,
      appointmentTime: now
    });

    setIsUpdating(null);

    if (result.error) {
      alert("Erro ao criar: " + result.error);
    } else {
      setIsNewModalOpen(false);
      setNewComanda({ clientName: "", clientPhone: "", serviceId: "", professionalId: "", status: "WAITING" });
      window.location.reload();
    }
  }

  const sendWhatsApp = (app: any) => {
    if (!app.client_phone || app.client_phone === 'Não Informado') {
      alert("Telefone não cadastrado para este cliente.");
      return;
    }

    const cleanPhone = app.client_phone.replace(/\D/g, "");
    const message = `Olá ${app.client_name}! Aqui é da barbearia. Confirmando seu horário hoje às ${app.appointment_time.substring(0, 5)} para ${app.services?.name}. Te esperamos!`;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-primary hover:bg-white text-black font-black py-4 px-8 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-primary/10 uppercase text-xs tracking-widest"
        >
          <Plus size={18} /> Criar Nova Comanda
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou serviço..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-[#1a1a1a] rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
            />
         </div>
         <div className="flex bg-black border border-border rounded-xl p-1 shrink-0">
            {(['Abertas', 'Pagas', 'Canceladas'] as const).map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {f}
              </button>
            ))}
         </div>
      </div>

      {/* Grid de Comandas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((app) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={app.id} 
                className={`bg-[#080808] border border-border rounded-3xl p-6 transition-all group relative ${isUpdating === app.id ? 'opacity-50 pointer-events-none' : ''} ${app.status === 'COMPLETED' ? 'border-green-500/20' : 'hover:border-primary/40'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-1 rounded w-fit uppercase tracking-widest border border-white/5">
                      #{app.id.substring(0, 4).toUpperCase()}
                    </span>
                    <h3 className="font-serif font-black text-white text-xl mt-2 tracking-tight group-hover:text-primary transition-colors">{app.client_name}</h3>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">
                       <Scissors size={12} className="text-primary" /> {app.services?.name || 'Serviço s/ Nome'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {app.client_phone && app.client_phone !== 'Não Informado' && (
                      <button 
                        onClick={() => sendWhatsApp(app)}
                        className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black rounded-lg transition-all"
                        title="Notificar via WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}
                    <button className="p-2 text-zinc-600 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                   <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                         <User size={14} className="text-zinc-500" />
                      </div>
                      <span className="font-medium">Profissional: <span className="text-zinc-200">{app.professionals?.name || 'Não atribuído'}</span></span>
                   </div>
                   <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                         <Clock size={14} className="text-zinc-500" />
                      </div>
                      <span className="font-medium">Criada em: <span className="text-zinc-200">{app.appointment_date} às {app.appointment_time.substring(0, 5)}</span></span>
                   </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                   <div>
                      <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1">VALOR_TOTAL</p>
                      <p className="font-serif font-black text-primary text-2xl tracking-tighter">R$ {app.services?.price?.toFixed(2) || '0.00'}</p>
                   </div>
                   
                   {app.status !== 'COMPLETED' && (
                     <button 
                       onClick={() => setSelectedAppointment(app)}
                       className="bg-primary hover:bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-primary/10 active:scale-95"
                     >
                        Finalizar
                     </button>
                   )}

                   {app.status === 'COMPLETED' && (
                     <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        Pago via {app.transactions?.[0]?.payment_method || '---'}
                     </div>
                   )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem]">
               <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">Nenhuma comanda localizada nesta categoria.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {selectedAppointment && (
        <CheckoutModal 
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onConfirm={handleFinalizeConfirm}
          amount={selectedAppointment.services?.price || 0}
          clientName={selectedAppointment.client_name}
        />
      )}

      {/* Modal de Nova Comanda */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
              onClick={() => setIsNewModalOpen(false)} 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-[#151515] flex justify-between items-center bg-black/40">
                <h3 className="text-xl font-serif font-black text-white uppercase italic tracking-tighter">Gerar Comanda_Manual</h3>
                <button onClick={() => setIsNewModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500"><X size={20}/></button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Nome do Cliente */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Nome do Cliente *</label>
                  <input 
                    type="text" 
                    value={newComanda.clientName}
                    onChange={(e) => setNewComanda({...newComanda, clientName: e.target.value})}
                    placeholder="Ex: Carlos Andrade"
                    className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">WhatsApp (Opcional)</label>
                  <input 
                    type="tel" 
                    value={newComanda.clientPhone}
                    onChange={(e) => setNewComanda({...newComanda, clientPhone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Serviço */}
                   <div className="space-y-2">
                     <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Serviço *</label>
                     <select 
                       value={newComanda.serviceId}
                       onChange={(e) => setNewComanda({...newComanda, serviceId: e.target.value})}
                       className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all text-xs appearance-none"
                     >
                       <option value="">Selecionar Serviço</option>
                       {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                     </select>
                   </div>

                   {/* Profissional */}
                   <div className="space-y-2">
                     <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Atendido por</label>
                     <select 
                       value={newComanda.professionalId}
                       onChange={(e) => setNewComanda({...newComanda, professionalId: e.target.value})}
                       className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all text-xs appearance-none"
                     >
                       <option value="">Qualquer Barbeiro</option>
                       {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                   </div>
                </div>

                {/* Status Inicial */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Status Operacional</label>
                  <div className="flex bg-black border border-[#1a1a1a] rounded-xl p-1">
                    {['WAITING', 'INCOMING', 'SCHEDULED'].map((s) => (
                      <button 
                        key={s}
                        onClick={() => setNewComanda({...newComanda, status: s})}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${newComanda.status === s ? 'bg-primary text-black' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        {s === 'WAITING' ? 'Aguardando' : s === 'INCOMING' ? 'No Local' : 'Agendado'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/60">
                 <button 
                   disabled={isUpdating === "new"}
                   onClick={handleCreateManual}
                   className="w-full bg-primary hover:bg-white text-black font-black py-5 rounded-[2rem] uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl shadow-primary/20"
                 >
                    {isUpdating === "new" ? "SINCRONIZANDO..." : "ABRIR COMANDA_"}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

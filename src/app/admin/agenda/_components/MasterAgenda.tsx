"use client";

import { useState, useTransition, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Clock, 
  Scissors, 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  List,
  X,
  CheckCircle,
  XCircle,
  Phone,
  Plus,
  Save,
  Loader2,
  AlertCircle
} from "lucide-react";
import { format, addDays, subDays, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { updateAppointmentStatus, createAdminBooking } from "../actions";
import { finalizeAndPay } from "../../financeiro/actions";
import CheckoutModal from "../../_components/CheckoutModal";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export function MasterAgenda({ 
  initialAppointments, 
  professionals,
  services 
}: { 
  initialAppointments: any[], 
  professionals: any[],
  services: any[]
}) {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [appointments, setAppointments] = useState(initialAppointments);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualFormData, setManualFormData] = useState({
     professionalId: "",
     time: "",
     clientName: "",
     serviceId: ""
  });
  
  const [finalizingStep, setFinalizingStep] = useState<'details' | 'payment'>('details');
  const [isPending, startTransition] = useTransition();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const supabase = createClient();
  const tenantId = professionals[0]?.tenant_id;

  // 1. REAL-TIME ENGINE
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase.channel(`agenda-realtime-${tenantId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'appointments', 
        filter: `tenant_id=eq.${tenantId}` 
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
           const { data: newApt } = await supabase
             .from('appointments')
             .select('*, services(*)')
             .eq('id', payload.new.id)
             .single();
           if (newApt) setAppointments(prev => [newApt, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
           setAppointments(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a));
        } else if (payload.eventType === 'DELETE') {
           setAppointments(prev => prev.filter(a => a.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tenantId]);

  const handleFinalize = (method: 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO', brand: string, fee: number, net: number) => {
    if (!selectedAppointment || !tenantId) return;

    startTransition(async () => {
       const result = await finalizeAndPay(
         selectedAppointment.id, 
         tenantId, 
         selectedAppointment.services?.price || 50, 
         method,
         brand,
         fee,
         net
       );
       
       if (result.success) {
          toast.success("Pagamento processado!");
          setIsCheckoutOpen(false);
          setFinalizingStep('details');
          setSelectedAppointment(null);
       }
    });
  };

  const handleManualSubmit = async () => {
    if (!manualFormData.clientName || !manualFormData.serviceId) {
       toast.error("Preencha todos os campos.");
       return;
    }

    startTransition(async () => {
      const result = await createAdminBooking({
         tenantId,
         professionalId: manualFormData.professionalId,
         serviceId: manualFormData.serviceId,
         clientName: manualFormData.clientName,
         appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
         appointmentTime: `${manualFormData.time}:00`
      });

      if (result.success) {
         toast.success("Agendamento criado!");
         setIsManualBookingOpen(false);
         setManualFormData({ professionalId: "", time: "", clientName: "", serviceId: "" });
      } else {
         toast.error("Erro: " + result.error);
      }
    });
  };

  const standardSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const dailyAppointments = appointments
    .filter(a => {
      const aptDate = typeof a.appointment_date === 'string' 
        ? a.appointment_date.split('T')[0] 
        : format(new Date(a.appointment_date), 'yyyy-MM-dd');
      return aptDate === dateStr && a.status !== 'CANCELED';
    })
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  function getAppointmentsForSlot(profId: string, slotTime: string) {
    return dailyAppointments.filter(a => {
      if (!a.appointment_time) return false;
      const aptTime = a.appointment_time.substring(0, 5).trim();
      const normalizeSlot = slotTime.trim();
      if (aptTime !== normalizeSlot) return false;
      
      const aProfId = a.professional_id ? String(a.professional_id) : null;
      const targetProfId = String(profId);
      
      // Regra de Órfãos: Se nulo, vai para o primeiro barbeiro
      const isFirstProf = professionals[0] && String(professionals[0].id) === targetProfId;
      return aProfId === targetProfId || (!aProfId && isFirstProf);
    });
  }

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá ${name}, aqui é da Barbearia. Tudo bem? Temos um agendamento hoje às...`);
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Data e Toggle */}
      <div className="flex flex-col lg:flex-row items-center justify-between bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 shadow-2xl gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-3 bg-zinc-900/50 hover:bg-primary hover:text-black rounded-2xl transition-all"><ChevronLeft size={20} /></button>
          <div className="text-center min-w-[220px]">
             <h3 className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] mb-1">{format(selectedDate, "EEEE", { locale: ptBR })}</h3>
             <p className="text-2xl font-serif font-black text-white tracking-tight uppercase italic">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</p>
          </div>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-3 bg-zinc-900/50 hover:bg-primary hover:text-black rounded-2xl transition-all"><ChevronRight size={20} /></button>
        </div>

        <div className="flex bg-black p-1.5 rounded-2xl border border-white/5 shadow-inner">
           <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all ${viewMode === 'grid' ? 'bg-primary text-black font-black' : 'text-zinc-600 hover:text-zinc-300'}`}><LayoutGrid size={14} /> Grelha</button>
           <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all ${viewMode === 'list' ? 'bg-primary text-black font-black' : 'text-zinc-600 hover:text-zinc-300'}`}><List size={14} /> Lista</button>
        </div>

        <button onClick={() => setSelectedDate(startOfToday())} className="px-8 py-3 bg-white/5 text-zinc-400 hover:text-white rounded-2xl text-[10px] font-mono tracking-widest uppercase border border-white/5 transition-all hover:bg-primary hover:text-black">Hoje</button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-black/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-950/80 border-b border-white/5">
                    <th className="p-6 w-24 border-r border-white/5"><Clock size={16} className="text-primary mx-auto" /></th>
                    {professionals.map(prof => (
                      <th key={prof.id} className="p-8 text-center min-w-[240px] border-r border-white/5 last:border-0">
                         <p className="text-white font-black text-sm uppercase tracking-wide italic">{prof.name}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standardSlots.map(time => (
                    <tr key={time} className="border-b border-white/5 group transition-colors">
                      <td className="p-6 text-center border-r border-white/5 bg-white/[0.02]">
                        <span className="text-[12px] font-mono font-black text-zinc-500 group-hover:text-primary transition-colors">{time}</span>
                      </td>
                      {professionals.map(prof => {
                        const cellApts = getAppointmentsForSlot(prof.id, time);
                        return (
                          <td key={prof.id} className="p-2 border-r border-white/5 last:border-0 relative h-36 group/cell">
                            {cellApts.length > 0 ? (
                              <div className="h-full flex flex-col gap-1 overflow-y-auto pr-1">
                                {cellApts.map(apt => (
                                  <motion.div 
                                    key={apt.id}
                                    onClick={() => setSelectedAppointment(apt)}
                                    className="min-h-[70px] flex-shrink-0 rounded-2xl p-4 flex flex-col justify-between border border-primary/20 bg-primary/10 text-primary shadow-xl cursor-pointer hover:scale-[1.02]"
                                  >
                                     <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black uppercase truncate leading-tight w-full">{apt.client_name}</span>
                                        <button onClick={(e) => { e.stopPropagation(); openWhatsApp(apt.client_phone || '', apt.client_name); }} className="p-1 hover:bg-emerald-500/20 rounded text-emerald-500"><Phone size={10} /></button>
                                     </div>
                                     <span className="text-[8px] font-mono opacity-60 uppercase">{apt.services?.name || 'Vip Experience'}</span>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div 
                                onClick={() => { setManualFormData({ ...manualFormData, professionalId: prof.id, time }); setIsManualBookingOpen(true); }}
                                className="h-full w-full rounded-3xl border border-dashed border-white/5 group-hover/cell:border-primary/20 group-hover/cell:bg-primary/5 transition-all flex items-center justify-center cursor-pointer"
                              >
                                 <Plus size={20} className="text-zinc-900 group-hover/cell:text-primary/40 transition-all" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
             {dailyAppointments.length > 0 ? dailyAppointments.map((apt) => (
                <div key={apt.id} onClick={() => setSelectedAppointment(apt)} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[32px] flex items-center justify-between hover:bg-white/[0.03] transition-all cursor-pointer group">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-primary font-black italic border border-white/5 shadow-inner">{apt.appointment_time.substring(0, 5)}</div>
                      <div>
                        <h4 className="text-white font-black uppercase italic tracking-tighter text-xl">{apt.client_name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] font-mono text-primary flex items-center gap-1"><Scissors size={10} /> {apt.services?.name}</span>
                        </div>
                      </div>
                   </div>
                   <ChevronRight size={20} className="text-zinc-700 group-hover:text-primary transition-all" />
                </div>
             )) : (
               <div className="py-32 text-center bg-black/40 rounded-[40px] border border-white/5 border-dashed">
                  <CalendarIcon size={48} className="mx-auto text-zinc-800 mb-6" />
                  <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Nenhum agendamento para este dia</p>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: CHECKOUT / DETALHES */}
      <AnimatePresence>
        {selectedAppointment && !isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-10 pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAppointment(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-lg h-full bg-black border-l border-white/10 rounded-[40px] shadow-2xl p-10 flex flex-col pointer-events-auto overflow-y-auto">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif font-black text-white italic uppercase tracking-tight">Comanda <span className="text-primary tracking-widest">#{selectedAppointment.id.substring(0,4)}</span></h3>
                  <button onClick={() => setSelectedAppointment(null)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-zinc-400 transition-all"><X size={20} /></button>
               </div>
               
               <div className="space-y-8">
                  <div className="bg-zinc-950 p-8 rounded-[40px] border border-white/5">
                     <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] mb-2">Cliente</p>
                     <p className="text-3xl font-black text-white uppercase italic">{selectedAppointment.client_name}</p>
                     <p className="text-primary font-mono text-xs mt-3 flex items-center gap-2" onClick={() => openWhatsApp(selectedAppointment.client_phone || '', selectedAppointment.client_name)}><Phone size={14} /> {selectedAppointment.client_phone || 'S/ CONTATO'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase mb-2">Horário</p>
                        <p className="text-xl font-black text-white">{selectedAppointment.appointment_time.substring(0, 5)}</p>
                     </div>
                     <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 text-right">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase mb-2">Valor</p>
                        <p className="text-xl font-black text-primary italic">R${selectedAppointment.services?.price || '0'}</p>
                     </div>
                  </div>

                  <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5">
                     <p className="text-[9px] text-zinc-500 font-mono uppercase mb-3">Serviço & Barbeiro</p>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-300 uppercase">{selectedAppointment.services?.name}</span>
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{professionals.find(p => p.id === selectedAppointment.professional_id)?.name || 'NÃO ATRIBUÍDO'}</span>
                     </div>
                  </div>
               </div>

               <div className="mt-auto pt-10 space-y-4">
                  {selectedAppointment.status !== 'COMPLETED' && (
                     <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-primary text-black font-black py-6 rounded-3xl flex items-center justify-center gap-3 hover:bg-white transition-all uppercase tracking-widest">
                        <CheckCircle size={20} /> Fechar & Receber
                     </button>
                  )}
                  <button onClick={() => updateAppointmentStatus(selectedAppointment.id, 'CANCELED')} className="w-full bg-zinc-900/50 text-rose-500/50 font-bold py-5 rounded-3xl border border-white/5 hover:text-rose-500 transition-all uppercase tracking-widest text-[10px]">
                     Cancelar Agendamento
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: AGENDAMENTO MANUAL (ENCAIXE) - COMPACTO */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsManualBookingOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[40px] shadow-2xl p-10 overflow-hidden">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-serif font-black text-white italic uppercase tracking-tighter">Encaixe <span className="text-primary italic underline decoration-primary/20 underline-offset-8">Rápido</span></h3>
                <button onClick={() => setIsManualBookingOpen(false)} className="text-zinc-600 hover:text-white"><X size={24} /></button>
             </div>
             
             <div className="space-y-6">
                {/* Alerta de Conflito */}
                {getAppointmentsForSlot(manualFormData.professionalId, manualFormData.time).length > 0 && (
                   <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-3xl flex items-start gap-3">
                      <AlertCircle className="text-red-500 shrink-0" size={16} />
                      <p className="text-[10px] text-red-500/80 font-bold uppercase leading-relaxed">
                        Horário ocupado para <span className="text-red-500">{professionals.find(p => p.id === manualFormData.professionalId)?.name}</span>.
                      </p>
                   </div>
                )}

                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-2 italic">Cliente</label>
                   <input type="text" autoFocus placeholder="Nome do Cliente" value={manualFormData.clientName} onChange={(e) => setManualFormData({...manualFormData, clientName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white outline-none focus:border-primary transition-all text-sm" />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-2 italic">Serviço</label>
                   <select value={manualFormData.serviceId} onChange={(e) => setManualFormData({...manualFormData, serviceId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white outline-none focus:border-primary appearance-none transition-all text-sm">
                      <option value="" className="bg-black">Escolha o serviço</option>
                      {services.map(s => <option key={s.id} value={s.id} className="bg-black">{s.name} (R${s.price})</option>)}
                   </select>
                </div>

                {getAppointmentsForSlot(manualFormData.professionalId, manualFormData.time).length > 0 && (
                   <div className="space-y-3">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest text-center italic">Alternativas Livres agora:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                         {professionals.filter(p => getAppointmentsForSlot(p.id, manualFormData.time).length === 0).map(p => (
                            <button key={p.id} onClick={() => setManualFormData({...manualFormData, professionalId: p.id})} className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl text-[9px] font-black text-primary uppercase hover:bg-primary hover:text-black transition-all">Atribuir a {p.name.split(' ')[0]}</button>
                         ))}
                      </div>
                   </div>
                )}

                <button disabled={isPending || !manualFormData.clientName || !manualFormData.serviceId} onClick={handleManualSubmit} className="w-full bg-primary text-black font-black py-6 rounded-3xl flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl disabled:opacity-50 uppercase tracking-widest text-sm mt-4">
                  {isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />} CONCLUIR ENCAIXE
                </button>
             </div>
          </motion.div>
        </div>
      )}

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onConfirm={handleFinalize}
        amount={selectedAppointment?.services?.price || 50}
        clientName={selectedAppointment?.client_name || ''}
      />
    </div>
  );
}

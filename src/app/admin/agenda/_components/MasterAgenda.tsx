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
  Loader2
} from "lucide-react";
import { format, addDays, subDays, startOfToday, parse, isAfter } from "date-fns";
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
           toast.success("Novo agendamento recebido!", { icon: "📅" });
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

  const handleManualBooking = async () => {
    if (!manualFormData.clientName || !manualFormData.serviceId) {
       toast.error("Preencha o nome do cliente e o serviço.");
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
         toast.success("Agendamento manual criado!");
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
    .filter(a => a.appointment_date === dateStr && a.status !== 'CANCELED')
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const timeSlots = Array.from(new Set([
    ...standardSlots,
    ...dailyAppointments.map(a => a.appointment_time.substring(0, 5))
  ])).sort();

  function getAppointment(profId: string, slotTime: string) {
    return appointments.find(a => {
      if (!a.appointment_time) return false;
      const aptTime = a.appointment_time.substring(0, 5);
      return a.professional_id === profId && 
             aptTime === slotTime &&
             a.appointment_date === dateStr &&
             a.status !== 'CANCELED';
    });
  }

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
                        <div className="flex flex-col items-center gap-4">
                           <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-1 ring-4 ring-primary/5 overflow-hidden"><img src={prof.avatar_url || `https://i.pravatar.cc/150?u=${prof.id}`} className="w-full h-full rounded-full object-cover grayscale brightness-50 group-hover:grayscale-0 transition-all" alt={prof.name} /></div>
                           <div>
                              <p className="text-white font-black text-sm uppercase tracking-wide italic">{prof.name}</p>
                              <p className="text-[9px] text-primary/60 font-mono uppercase tracking-[0.2em]">{prof.specialty || 'Elite'}</p>
                           </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time} className="border-b border-white/5 group transition-colors">
                      <td className="p-6 text-center border-r border-white/5 bg-white/[0.02]">
                        <span className="text-[12px] font-mono font-black text-zinc-500 group-hover:text-primary transition-colors">{time}</span>
                      </td>
                      {professionals.map(prof => {
                        const apt = getAppointment(prof.id, time);
                        return (
                          <td key={prof.id} onClick={() => {
                            if (apt) {
                              setSelectedAppointment(apt);
                              setFinalizingStep('details');
                            } else {
                              setManualFormData({ ...manualFormData, professionalId: prof.id, time });
                              setIsManualBookingOpen(true);
                            }
                          }} className="p-2 border-r border-white/5 last:border-0 relative h-32 cursor-pointer group/cell">
                            {apt ? (
                              <motion.div className={`h-full rounded-3xl p-5 flex flex-col justify-between border shadow-2xl transition-all hover:scale-[1.02] ${apt.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                 <div className="flex justify-between items-start">
                                    <span className="text-xs font-black uppercase tracking-tight truncate">{apt.client_name}</span>
                                    <Scissors size={12} className="opacity-40" />
                                 </div>
                                 <div className="flex items-center justify-between opacity-60">
                                    <p className="text-[9px] font-mono uppercase tracking-widest">{apt.services?.name || '---'}</p>
                                    <p className="text-[10px] font-mono font-black">R${apt.services?.price || '0'}</p>
                                 </div>
                              </motion.div>
                            ) : (
                              <div className="h-full w-full rounded-3xl border border-dashed border-white/5 group-hover/cell:border-primary/20 group-hover/cell:bg-primary/5 transition-all flex items-center justify-center">
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
          <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             {dailyAppointments.length > 0 ? dailyAppointments.map((apt) => (
                <div key={apt.id} onClick={() => setSelectedAppointment(apt)} className="bg-zinc-950 border border-white/5 p-6 rounded-3xl flex items-center gap-8 hover:border-primary/40 hover:bg-zinc-900/50 transition-all cursor-pointer group">
                   <div className="min-w-[80px] text-center border-r border-white/5 pr-8">
                      <span className="text-2xl font-black text-primary font-mono">{apt.appointment_time.substring(0, 5)}</span>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-white font-black text-lg uppercase tracking-tight mb-1 italic">{apt.client_name}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                         <span className="flex items-center gap-2"><Scissors size={12} className="text-primary"/> {apt.services?.name}</span>
                         <span className={`px-2 py-0.5 rounded ${apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>{apt.status}</span>
                      </div>
                   </div>
                   <ChevronRight className="text-zinc-800 group-hover:text-primary transition-all" />
                </div>
             )) : (
               <div className="py-32 text-center bg-zinc-950/50 border border-dashed border-white/5 rounded-[40px]">
                  <Clock size={48} className="text-zinc-900 mx-auto mb-6" />
                  <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.3em]">Agenda Limpa para este dia.</p>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Modal de Detalhes / Checkout */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAppointment(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-lg h-full bg-zinc-950 border-l border-white/5 rounded-[40px] shadow-2xl p-10 flex flex-col overflow-y-auto">
               <div className="flex justify-between items-center mb-12">
                  <h3 className="text-3xl font-serif font-black text-white italic uppercase tracking-tight">Comanda <span className="text-primary">#{selectedAppointment.id.substring(0,4)}</span></h3>
                  <button onClick={() => setSelectedAppointment(null)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-zinc-400 transition-all"><X size={24} /></button>
               </div>
               
               <div className="flex-1 space-y-10">
                  <section className="space-y-4">
                     <p className="text-[10px] font-mono text-primary font-black uppercase tracking-[0.4em]">Proprietário do Horário</p>
                     <div className="bg-white/5 p-8 rounded-[30px] border border-white/5">
                        <p className="text-3xl font-black text-white uppercase italic">{selectedAppointment.client_name}</p>
                        <p className="text-zinc-500 font-mono text-xs mt-2">{selectedAppointment.client_phone || 'SEM_CONTATO_REGISTRADO'}</p>
                     </div>
                  </section>

                  <section className="grid grid-cols-2 gap-6">
                     <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-primary/20 transition-all">
                        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Início</p>
                        <p className="text-xl font-mono font-black text-white">{selectedAppointment.appointment_time.substring(0, 5)}</p>
                     </div>
                     <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Estado Atual</p>
                        <p className={`text-xs font-mono font-black uppercase ${selectedAppointment.status === 'COMPLETED' ? 'text-emerald-500' : 'text-primary'}`}>{selectedAppointment.status}</p>
                     </div>
                  </section>

                  <section className="bg-white/5 p-6 rounded-[30px] border border-white/5 space-y-4">
                     <div className="flex items-center gap-4">
                        <Scissors className="text-primary" size={20} />
                        <div>
                           <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Serviço Pretendido</p>
                           <p className="text-lg font-black text-white uppercase italic">{selectedAppointment.services?.name || 'Vazio'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <User className="text-primary" size={20} />
                        <div>
                           <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Executor Designado</p>
                           <p className="text-lg font-black text-zinc-300 uppercase italic">{professionals.find(p => p.id === selectedAppointment.professional_id)?.name}</p>
                        </div>
                     </div>
                  </section>
               </div>

               <div className="pt-10 space-y-4 mt-auto">
                  {selectedAppointment.status !== 'COMPLETED' && (
                     <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-primary text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all shadow-[0_20px_50px_rgba(212,175,55,0.2)] uppercase tracking-widest text-sm">
                        <CheckCircle size={20} /> Fechar & Receber R${selectedAppointment.services?.price || '0'}
                     </button>
                  )}
                  {selectedAppointment.status === 'SCHEDULED' && (
                     <button onClick={() => updateAppointmentStatus(selectedAppointment.id, 'CANCELED')} className="w-full bg-zinc-900 text-rose-500 font-bold py-5 rounded-2xl border border-rose-500/10 hover:bg-rose-500/10 transition-all uppercase tracking-widest text-xs">
                        Anular Comanda
                     </button>
                  )}
               </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Agendamento Manual (Walk-in) */}
        {isManualBookingOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsManualBookingOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[40px] shadow-2xl p-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <h3 className="text-2xl font-serif font-black text-white italic mb-10 uppercase tracking-tight">Agendamento <span className="text-primary">Na Hora</span></h3>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Nome do Cliente</label>
                      <input 
                        type="text" 
                        placeholder="Ex: João da Silva" 
                        value={manualFormData.clientName}
                        onChange={(e) => setManualFormData({...manualFormData, clientName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary transition-all font-medium"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Serviço</label>
                      <select 
                        value={manualFormData.serviceId}
                        onChange={(e) => setManualFormData({...manualFormData, serviceId: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary appearance-none transition-all font-medium"
                      >
                         <option value="" className="bg-black">Selecione o Serviço</option>
                         {services.map(s => <option key={s.id} value={s.id} className="bg-black">{s.name} - R${s.price}</option>)}
                      </select>
                   </div>

                   <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex flex-col gap-2">
                      <p className="text-[9px] font-mono text-primary uppercase tracking-widest">Resumo do Encaixe</p>
                      <p className="text-white font-black text-lg italic uppercase">{timeSlots.includes(manualFormData.time) ? manualFormData.time : 'Selecionando...'}</p>
                      <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">{professionals.find(p => p.id === manualFormData.professionalId)?.name}</p>
                   </div>

                   <button 
                     disabled={isPending}
                     onClick={handleManualBooking}
                     className="w-full bg-primary text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl disabled:opacity-50 uppercase tracking-widest text-xs"
                   >
                     {isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />} SALVAR AGENDAMENTO
                   </button>
                   <button onClick={() => setIsManualBookingOpen(false)} className="w-full text-zinc-600 font-mono text-[10px] uppercase tracking-widest py-2">Cancelar</button>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

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

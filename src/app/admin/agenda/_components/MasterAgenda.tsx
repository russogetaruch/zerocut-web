"use client";

import { useState, useTransition } from "react";
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
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle
} from "lucide-react";
import { format, addDays, subDays, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { updateAppointmentStatus } from "../actions";
import { finalizeAndPay } from "../../financeiro/actions";
import CheckoutModal from "../../_components/CheckoutModal";

export function MasterAgenda({ initialAppointments, professionals }: { initialAppointments: any[], professionals: any[] }) {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [appointments, setAppointments] = useState(initialAppointments);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [finalizingStep, setFinalizingStep] = useState<'details' | 'payment'>('details');
  const [isPending, startTransition] = useTransition();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const tenantId = professionals[0]?.tenant_id;

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
          setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? { ...a, status: 'COMPLETED' } : a));
          setSelectedAppointment(null);
          setIsCheckoutOpen(false);
          setFinalizingStep('details');
       }
    });
  };

  const handleStatusUpdate = (id: string, status: 'COMPLETED' | 'CANCELED') => {
    startTransition(async () => {
       const result = await updateAppointmentStatus(id, status);
       if (result.success) {
          setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
          setSelectedAppointment(null);
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

  // Gerar slots dinâmicos: slots padrão + horários reais dos agendamentos
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

  function getProfessional(profId: string) {
    return professionals.find(p => p.id === profId);
  }

  return (
    <div className="space-y-6">
      
      {/* Seletor de Data e Toggle de Visão */}
      <div className="flex flex-col lg:flex-row items-center justify-between bg-[#0a0a0a] p-5 rounded-2xl border border-[#1a1a1a] shadow-lg gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-primary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center min-w-[200px]">
             <h3 className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] mb-1">
               {format(selectedDate, "EEEE", { locale: ptBR })}
             </h3>
             <p className="text-xl font-serif font-bold text-white tracking-tight">
               {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
             </p>
          </div>
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-primary transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex bg-black/50 p-1.5 rounded-xl border border-[#1a1a1a]">
           <button 
             onClick={() => setViewMode('grid')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all ${viewMode === 'grid' ? 'bg-primary text-black font-black' : 'text-zinc-600 hover:text-zinc-300'}`}
           >
              <LayoutGrid size={14} /> Grelha
           </button>
           <button 
             onClick={() => setViewMode('list')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all ${viewMode === 'list' ? 'bg-primary text-black font-black' : 'text-zinc-600 hover:text-zinc-300'}`}
           >
              <List size={14} /> Lista
           </button>
        </div>

        <button 
          onClick={() => setSelectedDate(startOfToday())}
          className="px-6 py-2.5 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-[10px] font-mono tracking-widest uppercase border border-[#222] transition-all hover:bg-zinc-800"
        >
          Voltar pra Hoje
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-[#080808] border border-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black/50 border-b border-[#1a1a1a]">
                    <th className="p-4 w-20 border-r border-[#1a1a1a]">
                      <Clock size={16} className="text-primary mx-auto" />
                    </th>
                    {professionals.map(prof => (
                      <th key={prof.id} className="p-6 text-center min-w-[200px] border-r border-[#1a1a1a] last:border-0">
                        <div className="flex flex-col items-center gap-3">
                           <div className="w-12 h-12 rounded-full border border-primary/20 p-0.5 ring-2 ring-primary/5">
                              <img 
                                src={prof.avatar_url || `https://i.pravatar.cc/150?u=${prof.id}`}
                                className="w-full h-full rounded-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all" 
                                alt={prof.name}
                              />
                           </div>
                           <div>
                              <p className="text-white font-bold text-sm tracking-wide">{prof.name}</p>
                              <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.2em]">{prof.specialty || 'Profissional'}</p>
                           </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time} className="border-b border-[#151515] group hover:bg-zinc-950/30 transition-colors">
                      <td className="p-4 text-center border-r border-[#1a1a1a] bg-black/10">
                        <span className="text-[10px] font-mono font-bold text-zinc-600 group-hover:text-primary transition-colors">{time}</span>
                      </td>
                      {professionals.map(prof => {
                        const apt = getAppointment(prof.id, time);
                        return (
                          <td key={prof.id} onClick={() => {
                            if (apt) {
                              setSelectedAppointment(apt);
                              setFinalizingStep('details');
                            }
                          }} className="p-2 border-r border-[#1a1a1a] last:border-0 relative h-24">
                            {apt ? (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className={`h-full rounded-2xl p-4 flex flex-col justify-center border shadow-xl ${
                                  apt.status === 'COMPLETED' 
                                  ? 'bg-green-500/5 border-green-500/10 text-green-500/60' 
                                  : 'bg-primary/5 border-primary/10 text-primary'
                                } group/card cursor-pointer hover:scale-[1.03] transition-all hover:bg-opacity-10`}
                              >
                                 <div className="flex justify-between items-start">
                                    <span className="text-[11px] font-bold uppercase tracking-wide truncate max-w-[130px]">{apt.client_name}</span>
                                    <div className="bg-black/40 p-1 rounded-md">
                                       <Scissors size={10} />
                                    </div>
                                 </div>
                                 <div className="mt-2 flex items-center justify-between">
                                    <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{apt.status}</p>
                                    <p className="text-[10px] font-mono text-zinc-400">#{apt.id.substring(0,4)}</p>
                                 </div>
                              </motion.div>
                            ) : (
                              <div className="h-full w-full rounded-xl border border-dashed border-[#151515] group-hover:border-[#222] transition-all hover:bg-white/[0.01]" />
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
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
             {dailyAppointments.length > 0 ? dailyAppointments.map((apt) => {
                const prof = getProfessional(apt.professional_id);
                return (
                     <div 
                       key={apt.id} 
                       onClick={() => {
                          setSelectedAppointment(apt);
                          setFinalizingStep('details');
                       }}
                       className="group bg-[#080808] border border-[#1a1a1a] p-4 rounded-2xl flex items-center gap-6 hover:border-primary/40 transition-all hover:translate-x-2 cursor-pointer"
                     >
                        <div className="flex flex-col items-center justify-center min-w-[70px] border-r border-[#1a1a1a] pr-6">
                           <span className="text-lg font-mono font-black text-primary">{apt.appointment_time.substring(0, 5)}</span>
                           <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Horário</span>
                        </div>
                        
                        <div className="flex-1">
                           <h4 className="text-white font-bold text-lg tracking-tight mb-0.5">{apt.client_name}</h4>
                           <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-0.5 rounded text-[10px] text-zinc-500 font-mono">
                                 <User size={10} className="text-primary" /> {prof?.name || '---'}
                              </div>
                              <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-0.5 rounded text-[10px] text-zinc-500 font-mono">
                                 <span className={`w-1.5 h-1.5 rounded-full ${apt.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}`}></span> {apt.status}
                              </div>
                           </div>
                        </div>

                        <div className="text-right hidden md:block">
                           <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest mb-1">Gerenciar</p>
                           <button className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg font-mono tracking-widest hover:bg-primary hover:text-black transition-all">
                              ABRIR COMANDA
                           </button>
                        </div>
                     </div>
                )
             }) : (
               <div className="py-20 text-center bg-[#080808] border border-dashed border-[#1a1a1a] rounded-3xl">
                  <Clock size={40} className="text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Nenhum agendamento para este dia.</p>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedAppointment(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-[#050505] border-l border-[#1a1a1a] shadow-2xl p-8 flex flex-col"
            >
               <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <User size={20} className="text-primary" />
                     </div>
                     <h3 className="text-xl font-serif font-black text-white tracking-tight uppercase">Detalhes</h3>
                  </div>
                  <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-white">
                    <X size={24} />
                  </button>
               </div>

               <div className="flex-1 space-y-8">
                  <div className="space-y-1">
                     <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Cliente</p>
                     <p className="text-2xl font-bold text-white uppercase tracking-tight">{selectedAppointment.client_name}</p>
                     <div className="flex items-center gap-2 text-zinc-400 text-xs mt-2">
                        <Phone size={12} className="text-primary" /> {selectedAppointment.client_phone || 'Não informado'}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-2xl">
                        <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1 leading-none">Horário</p>
                        <p className="text-lg font-mono font-bold text-white">{selectedAppointment.appointment_time.substring(0, 5)}</p>
                     </div>
                     <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-2xl">
                        <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1 leading-none">Status</p>
                        <p className={`text-xs font-mono font-bold uppercase ${selectedAppointment.status === 'COMPLETED' ? 'text-green-500' : 'text-primary'}`}>
                           {selectedAppointment.status}
                        </p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-[#1a1a1a]">
                        <Scissors size={20} className="text-primary" />
                        <div>
                           <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none mb-1">Serviço</p>
                           <p className="text-sm font-bold text-white uppercase tracking-wide">{selectedAppointment.services?.name || 'S/ Serviço'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-[#1a1a1a]">
                        <User size={20} className="text-primary" />
                        <div>
                           <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none mb-1">Profissional</p>
                           <p className="text-sm font-bold text-white uppercase tracking-wide">
                              {getProfessional(selectedAppointment.professional_id)?.name || 'Profissional'}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-3 pt-6 border-t border-[#1a1a1a]">
                  {selectedAppointment.status !== 'COMPLETED' ? (
                    finalizingStep === 'details' ? (
                      <button 
                        onClick={() => setFinalizingStep('payment')}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                      >
                        <CheckCircle size={20} /> FINALIZAR ATENDIMENTO
                      </button>
                    ) : (
                      <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase text-center tracking-widest mb-2">Selecione o Método de Pagamento</p>
                        <button 
                          onClick={() => setIsCheckoutOpen(true)}
                          className="w-full bg-primary text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20"
                        >
                          <CreditCard size={20} /> SELECIONAR MÉTODO & PAGAR
                        </button>
                        <button onClick={() => setFinalizingStep('details')} className="w-full text-[10px] font-mono text-zinc-600 uppercase tracking-widest py-2 hover:text-white transition-colors">
                           {"< Voltar"}
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
                       <p className="text-green-500 font-mono text-[10px] uppercase tracking-widest font-bold">Atendimento Concluído</p>
                    </div>
                  )}
                  
                  {selectedAppointment.status === 'SCHEDULED' && finalizingStep === 'details' && (
                    <button 
                      disabled={isPending}
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'CANCELED')}
                      className="w-full bg-transparent border border-red-900/30 text-red-500 hover:bg-red-500/10 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <XCircle size={20} /> CANCELAR AGENDAMENTO
                    </button>
                  )}
                  <button className="w-full bg-zinc-900 text-zinc-400 font-mono text-[10px] tracking-widest py-3 rounded-xl hover:text-white transition-colors uppercase">
                     Ver Histórico de Cortes do Cliente
                  </button>
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

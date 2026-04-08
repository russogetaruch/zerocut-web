"use client";

import { useState } from "react";
import { X, ChevronRight, User, Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createBooking } from "../actions";
import { getAvailableSlots } from "../_lib/availability";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BookingClientFlow({ tenantId, services, professionals }: { tenantId: string, services: any[], professionals: any[] }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // States do Agendamento
  const [selection, setSelection] = useState({
     serviceId: "",
     serviceName: "",
     professionalId: "",
     professionalName: "",
     date: format(new Date(), 'yyyy-MM-dd'),
     time: "",
     clientName: "",
     clientPhone: ""
  });

  async function selectProfessional(profId: string, profName: string) {
    setSelection({ ...selection, professionalId: profId, professionalName: profName });
    setBookingStep(3);
  }

  async function selectDate(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    setIsLoadingSlots(true);
    setSelection({ ...selection, date: dateStr, time: "" });
    
    const slots = await getAvailableSlots(tenantId, selection.professionalId, dateStr);
    setAvailableSlots(slots);
    setIsLoadingSlots(false);
  }

  async function handleFinishBooking() {
    if (!selection.clientName) {
      alert("Por favor insira seu nome para identificarmos o agendamento.");
      return;
    }
    setIsSubmitting(true);
    const result = await createBooking(tenantId, {
      serviceId: selection.serviceId,
      serviceName: selection.serviceName,
      professionalId: selection.professionalId,
      date: selection.date, // Agora passamos a data real
      time: selection.time,
      clientName: selection.clientName,
      clientPhone: selection.clientPhone
    });
    setIsSubmitting(false);
    if (result?.error) {
      alert(result.error);
    } else {
      setSuccess(true);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsBookingOpen(true)}
        className="bg-primary hover:bg-white text-black font-black py-4 px-10 rounded-2xl shadow-[0_15px_40px_rgba(212,175,55,0.3)] transition-all transform hover:scale-105 active:scale-95 w-full md:w-auto text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 group"
      >
        <CalendarDays size={16} className="group-hover:rotate-12 transition-transform" /> 
        Reservar_Agora
      </button>

      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-[#080808] w-full max-w-xl rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <div className="p-5 border-b border-border flex justify-between items-center bg-[#0a0a0a] z-10 text-white">
                <h3 className="font-serif font-bold text-lg text-primary tracking-wide">
                  {success ? "Agendamento Confirmado" :
                    bookingStep === 1 ? "1. Selecione o Estilo" :
                      bookingStep === 2 ? "2. Escolha o Especialista" :
                        "3. Data e Horário"}
                </h3>
                <button onClick={() => setIsBookingOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-[#050505]">
                {success ? (
                  <div className="space-y-4 text-center py-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-white uppercase italic tracking-tighter">Vaga Garantida!</h4>
                    <p className="text-zinc-500 text-sm">Tudo certo, {selection.clientName.split(' ')[0]}!</p>
                    <div className="bg-black/50 border border-white/5 p-6 rounded-[2rem] text-left mt-4 space-y-2">
                      <p className="text-zinc-400 text-xs">Procedimento: <span className="text-white font-black">{selection.serviceName}</span></p>
                      <p className="text-zinc-400 text-xs">Artista: <span className="text-white font-black">{selection.professionalName}</span></p>
                      <p className="text-zinc-400 text-xs">Agenda: <span className="text-primary font-mono">{format(new Date(selection.date), "dd/MM")} às {selection.time}</span></p>
                    </div>
                    <button onClick={() => { setIsBookingOpen(false); setSuccess(false); setBookingStep(1); }} className="block w-full mt-8 bg-primary text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase tracking-widest text-[10px]">
                      CONCLUIR_FLUXO
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Step 1: Services */}
                    {bookingStep === 1 && (
                      <div className="grid grid-cols-1 gap-4">
                        {services?.map((srv) => (
                          <div key={srv.id} onClick={() => { setSelection({ ...selection, serviceName: srv.name, serviceId: srv.id }); setBookingStep(2); }} className="p-5 border border-[#1a1a1a] bg-[#0a0a0a] rounded-2xl cursor-pointer hover:border-primary transition-all flex justify-between items-center group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-primary transition-colors"></div>
                            <div>
                              <p className="font-bold text-white text-lg tracking-tight group-hover:text-primary transition-colors">{srv.name}</p>
                              <p className="text-zinc-600 text-[10px] mt-1 font-mono uppercase tracking-widest">{srv.duration_minutes} MINUTOS</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-white whitespace-nowrap text-sm">R$ {srv.price}</span>
                              <ChevronRight className="text-zinc-800 group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step 2: Professionals */}
                    {bookingStep === 2 && (
                      <div className="space-y-4">
                        <button onClick={() => setBookingStep(1)} className="text-[9px] font-mono tracking-widest text-zinc-600 hover:text-white mb-2 uppercase flex items-center gap-2">
                           <ChevronRight size={10} className="rotate-180" /> Recuar para Serviços
                        </button>

                        <div className="grid grid-cols-1 gap-4">
                          {professionals?.map((prof) => (
                            <div key={prof.id} onClick={() => selectProfessional(prof.id, prof.name)} className="p-5 border border-[#1a1a1a] bg-[#0a0a0a] rounded-2xl cursor-pointer hover:border-primary transition-all flex items-center gap-5 group">
                              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 group-hover:border-primary/40 overflow-hidden transition-all grayscale group-hover:grayscale-0">
                                <img src={prof.avatar_url || `https://i.pravatar.cc/150?u=${prof.id}`} alt={prof.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-white text-md tracking-tight">{prof.name}</p>
                                <p className="text-zinc-600 text-[10px] font-mono tracking-widest uppercase italic">{prof.specialty || "Mestre Barbeiro"}</p>
                              </div>
                              <ChevronRight className="text-zinc-800 group-hover:text-primary transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Date & Time */}
                    {bookingStep === 3 && (
                      <div className="space-y-8">
                        <button onClick={() => setBookingStep(2)} className="text-[9px] font-mono tracking-widest text-zinc-600 hover:text-white mb-2 uppercase flex items-center gap-2">
                           <ChevronRight size={10} className="rotate-180" /> Recuar para Equipe
                        </button>

                        {/* Date Scroller */}
                        <div className="space-y-4">
                           <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic">/01. Selecione o dia_</p>
                           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                              {next7Days.map((day) => {
                                 const isSelected = isSameDay(day, new Date(selection.date));
                                 return (
                                    <button 
                                       key={day.toISOString()}
                                       onClick={() => selectDate(day)}
                                       className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl border transition-all ${isSelected ? 'bg-primary border-primary text-black' : 'bg-[#0a0a0a] border-white/5 text-zinc-500 hover:border-zinc-700'}`}
                                    >
                                       <span className="text-[9px] font-mono uppercase tracking-widest mb-1">{format(day, "EEE", { locale: ptBR })}</span>
                                       <span className="text-xl font-black font-serif italic tracking-tighter">{format(day, "dd")}</span>
                                    </button>
                                 );
                              })}
                           </div>
                        </div>

                        {/* Times Grid */}
                        <div className="space-y-4">
                           <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic">/02. Horários disponíveis_</p>
                           {isLoadingSlots ? (
                              <div className="py-12 flex flex-col items-center justify-center gap-4">
                                 <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                              </div>
                           ) : (
                              <div className="grid grid-cols-4 gap-3">
                                 {availableSlots.map((time) => (
                                    <button 
                                       key={time}
                                       onClick={() => setSelection({ ...selection, time })}
                                       className={`py-3 rounded-xl border font-mono text-[10px] font-bold transition-all ${selection.time === time ? 'bg-primary/20 border-primary text-primary' : 'bg-[#0a0a0a] border-white/5 text-zinc-600 hover:border-zinc-700'}`}
                                    >
                                       {time}
                                    </button>
                                 ))}
                                 {availableSlots.length === 0 && (
                                    <p className="col-span-full text-center py-6 text-zinc-600 font-mono text-[9px] uppercase tracking-widest">Sem disponibilidade para este dia.</p>
                                 )}
                              </div>
                           )}
                        </div>

                        {/* Confirm Form */}
                        {selection.time && (
                           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8 border-t border-white/5 space-y-6">
                              <div className="space-y-3">
                                 <div className="relative">
                                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                                    <input 
                                       type="text" 
                                       placeholder="COMO SE CHAMA?_"
                                       value={selection.clientName}
                                       onChange={(e) => setSelection({ ...selection, clientName: e.target.value })}
                                       className="w-full bg-[#050505] border border-white/5 rounded-2xl px-12 py-4 text-xs font-mono text-white focus:border-primary outline-none transition-all"
                                    />
                                 </div>
                                 <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                                    <input 
                                       type="tel" 
                                       placeholder="WHATSAPP (OPCIONAL)_"
                                       value={selection.clientPhone}
                                       onChange={(e) => setSelection({ ...selection, clientPhone: e.target.value })}
                                       className="w-full bg-[#050505] border border-white/5 rounded-2xl px-12 py-4 text-xs font-mono text-white focus:border-primary outline-none transition-all"
                                    />
                                 </div>
                              </div>

                              <button 
                                 onClick={handleFinishBooking}
                                 disabled={isSubmitting || !selection.clientName}
                                 className="w-full bg-primary text-black font-black py-5 rounded-[2rem] shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:bg-white transition-all uppercase tracking-[0.3em] text-[10px] disabled:opacity-50"
                              >
                                 {isSubmitting ? "REGISTRANDO AGORA..." : "CONFIRMAR_RESERVA_DE_ELITE"}
                              </button>
                           </motion.div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Smartphone(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}

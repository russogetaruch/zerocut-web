"use client";

import { useState } from "react";
import { X, ChevronRight, User, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createBooking } from "../actions";
import { getAvailableSlots } from "../_lib/availability";

export default function BookingClientFlow({ tenantId, services, professionals }: { tenantId: string, services: any[], professionals: any[] }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // States do Agendamento
  const [selection, setSelection] = useState({
     serviceId: "",
     serviceName: "",
     professionalId: "",
     professionalName: "",
     time: "",
     clientName: ""
  });

  async function selectProfessional(profId: string, profName: string) {
    setIsLoadingSlots(true);
    setSelection({ ...selection, professionalId: profId, professionalName: profName });
    const today = new Date().toISOString().split('T')[0];
    const slots = await getAvailableSlots(tenantId, profId, today);
    setAvailableSlots(slots);
    setBookingStep(3);
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
      time: selection.time,
      clientName: selection.clientName
    });
    setIsSubmitting(false);
    if (result?.error) {
      alert(result.error);
      // Se for erro de duplicidade, volta para o passo de horário para tentar outro
      if (result.error.includes("ocupado")) {
         setBookingStep(3);
         setSelection({ ...selection, time: "" });
      }
    } else {
      setSuccess(true);
    }
  }

  function renderSuccess() {
    return (
      <div className="space-y-4 text-center py-8 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
          <Clock size={32} />
        </div>
        <h4 className="text-xl font-bold text-white relative inline-block">Agendado com Sucesso!</h4>
        <p className="text-zinc-500 text-sm">Te esperamos lá, {selection.clientName}!</p>
        <div className="bg-black border border-border p-4 rounded-xl inline-block text-left mt-4">
          <p className="text-zinc-400 text-xs">Corte: <span className="text-white font-medium">{selection.serviceName}</span></p>
          <p className="text-zinc-400 text-xs">Barbeiro: <span className="text-white font-medium">{selection.professionalName}</span></p>
          <p className="text-zinc-400 text-xs">Dia: <span className="text-white font-medium">Hoje às {selection.time}</span></p>
        </div>
        <button onClick={() => { setIsBookingOpen(false); setSuccess(false); setBookingStep(1); }} className="block w-full mt-6 bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors">
          Fechar
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsBookingOpen(true)}
        className="bg-primary hover:bg-primary/90 text-black font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform hover:scale-105 active:scale-95 w-full md:w-auto text-lg"
      >
        Agendar Agora
      </button>

      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-surface w-full max-w-lg rounded-3xl border border-border flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-5 border-b border-border flex justify-between items-center bg-[#0a0a0a] z-10 text-white">
                <h3 className="font-serif font-bold text-lg text-primary tracking-wide">
                  {success ? "Agendamento Confirmado" :
                    bookingStep === 1 ? "1. Escolha o Serviço" :
                      bookingStep === 2 ? "2. Escolha o Profissional" :
                        "3. Data e Confirmação"}
                </h3>
                <button onClick={() => setIsBookingOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-[#050505]">
                {success && renderSuccess()}

                {/* Step 1: Services (LENDO DO BANCO) */}
                {!success && bookingStep === 1 && (
                  <div className="space-y-3">
                    {services?.length > 0 ? services.map((srv) => (
                      <div key={srv.id} onClick={() => { setSelection({ ...selection, serviceName: srv.name, serviceId: srv.id }); setBookingStep(2); }} className="p-4 border border-[#1a1a1a] bg-[#0a0a0a] rounded-xl cursor-pointer hover:border-primary transition-all flex justify-between items-center group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-primary transition-colors"></div>
                        <div className="pl-3">
                          <p className="font-bold text-white text-md md:text-lg tracking-wide truncate max-w-[200px]">{srv.name}</p>
                          <p className="text-zinc-500 text-xs mt-1 font-mono uppercase tracking-widest">Estimativa: {srv.duration_minutes} min</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-primary whitespace-nowrap">R$ {srv.price}</span>
                          <ChevronRight className="text-zinc-700 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-zinc-500 font-mono text-xs uppercase tracking-widest">Catalogo sendo montado. Volte em breve.</div>
                    )}
                    
                    <div className="pt-6 border-t border-[#1a1a1a] text-center">
                       <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">Já é cliente ZERØCUT?</p>
                       <a 
                         href={`/auth?next=${window.location.pathname}`}
                         className="text-xs font-bold text-primary hover:text-white transition-colors"
                       >
                         ENTRAR PARA AGENDAR_RÁPIDO
                       </a>
                    </div>
                  </div>
                )}

                {/* Step 2: Professionals (DINÂMICO) */}
                {!success && bookingStep === 2 && (
                  <div className="space-y-3">
                    <button onClick={() => setBookingStep(1)} className="text-xs font-mono tracking-widest text-zinc-500 hover:text-primary mb-3">{"< RECUE PARA SERVIÇOS"}</button>

                    {isLoadingSlots ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Consultando Agenda...</p>
                      </div>
                    ) : (
                      professionals && professionals.length > 0 ? professionals.map((prof, idx) => (
                        <div key={prof.id} onClick={() => selectProfessional(prof.id, prof.name)} className="p-4 border border-[#1a1a1a] bg-[#0a0a0a] rounded-xl cursor-pointer hover:border-primary transition-all flex items-center gap-5 group">

                          <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-zinc-900 border-2 border-[#1a1a1a] group-hover:border-primary flex items-center justify-center text-xl font-serif text-white transition-all shadow-inner overflow-hidden">
                              {prof.avatar_url ? (
                                <img src={prof.avatar_url} alt={prof.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="relative z-10">{prof.name.charAt(0)}</span>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            </div>
                            {idx === 0 && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-black"></span>}
                          </div>

                          <div className="flex-1">
                            <p className="font-bold text-white text-md tracking-wide">{prof.name}</p>
                            <p className="text-zinc-500 text-xs font-mono tracking-wide">{prof.specialty || "Profissional"}</p>
                          </div>
                          <ChevronRight className="text-zinc-700 group-hover:text-primary transition-colors" />
                        </div>
                      )) : (
                        <div className="text-center py-6 text-zinc-500 font-mono text-xs uppercase tracking-widest">Equipe em treinamento. Volte em breve.</div>
                      )
                    )}
                  </div>
                )}

                {/* Step 3: Rigid Time Blocks & Name Input */}
                {!success && bookingStep === 3 && (
                  <div className="space-y-6">
                    <button onClick={() => setBookingStep(2)} className="text-xs font-mono tracking-widest text-zinc-500 hover:text-primary mb-1">{"< RECUE PARA BARBEIRO"}</button>

                    <div>
                      <p className="text-sm text-zinc-400 mb-3 font-medium">Horários disponíveis para Hoje:</p>
                      {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {availableSlots.map((hr) => (
                            <button
                              key={hr}
                              onClick={() => setSelection({ ...selection, time: hr })}
                              className={`py-3 rounded-lg border font-mono text-center transition-all ${selection.time === hr
                                  ? 'bg-primary/10 border-primary text-primary font-bold scale-105'
                                  : 'bg-[#111] border-[#222] text-zinc-400 hover:border-zinc-500'
                                }`}
                            >
                              {hr}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-[#0a0a0a] border border-dashed border-[#222] rounded-2xl">
                           <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">Agenda Lotada</p>
                           <p className="text-[10px] text-zinc-600">Não há mais horários para hoje com este profissional.</p>
                        </div>
                      )}
                    </div>

                    {selection.time && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-[#1a1a1a]">
                        <label className="block text-sm text-zinc-400 mb-2">Quase lá! Como se chama?</label>
                        <input
                          type="text"
                          placeholder="Digite seu nome (Ex: João Silva)"
                          className="w-full bg-black border border-[#222] focus:border-primary rounded-xl px-4 py-3 text-white outline-none font-medium mb-4 transition-colors"
                          onChange={(e) => setSelection({ ...selection, clientName: e.target.value })}
                        />

                        <button disabled={isSubmitting} onClick={handleFinishBooking} className="w-full bg-primary text-black font-bold py-4 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50">
                          {isSubmitting ? "Sincronizando sua vaga..." : "CONFIRMAR CORTE"}
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

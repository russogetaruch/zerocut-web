"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Star, CheckCircle2, QrCode, Smartphone, Gift, ArrowRight, User, Phone, Calendar as CalendarIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoyaltyRegistrationPage({ params }: { params: { slug: string } }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    birthday: ""
  });
  const [target, setTarget] = useState(15);
  const [tenantName, setTenantName] = useState(params.slug.toUpperCase());

  const supabase = createClient();

  useState(() => {
    async function loadTenant() {
       const { data } = await supabase
         .from('tenants')
         .select('name, loyalty_target_cuts')
         .eq('slug', params.slug)
         .single();
       if (data) {
          setTarget(data.loyalty_target_cuts || 15);
          setTenantName(data.name);
       }
    }
    loadTenant();
  });

  async function handleSubmit(e: any) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Buscar o Tenant pelo Slug
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, loyalty_target_cuts')
        .eq('slug', params.slug)
        .single();

      if (!tenant) throw new Error("Unidade não encontrada.");

      // 2. Inserir ou buscar cliente (Fidelidade)
      const { error } = await supabase
        .from('customers')
        .upsert([
          { 
            tenant_id: tenant.id, 
            name: formData.name, 
            phone: formData.phone,
            birthday: formData.birthday || null
          }
        ], { onConflict: 'tenant_id, phone' });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      alert("Erro ao cadastrar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }} 
           animate={{ scale: 1, opacity: 1 }}
           className="bg-[#0a0a0a] border border-primary/20 p-12 rounded-[40px] max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.1)]"
         >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
               <Star size={40} className="text-primary animate-pulse" />
            </div>
            <h1 className="text-3xl font-serif font-black text-white uppercase italic mb-4">Bem-vindo ao Clube!</h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
               Seu cadastro foi realizado com sucesso. A partir de agora, cada corte que você fizer na **{params.slug.toUpperCase()}** acumula pontos automaticamente.
            </p>
            <div className="bg-black/50 border border-white/5 p-6 rounded-2xl mb-8">
               <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 text-center">Próximo objetivo:</p>
               <p className="text-lg font-serif font-bold text-primary">{target} CORTES = 1 CORTE GRÁTIS</p>
            </div>
            <Link 
              href={`/b/${params.slug}`}
              className="block w-full bg-primary text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl"
            >
               Ver Unidade
            </Link>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
         <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
         
         {/* Left Side: Copy */}
         <motion.div 
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           className="space-y-10"
         >
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
               <Star size={14} className="text-primary fill-primary" />
               <span className="text-[10px] font-mono font-black tracking-[0.3em] text-primary uppercase">Membro_Exclusivo_VIP</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter uppercase leading-[0.85]">
               O Clube dos <br /> 
               <span className="text-primary italic">Impecáveis.</span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
               Faça parte do programa de fidelidade da **{tenantName}**. Ganhe benefícios exclusivos e cortes gratuitos conforme você cuida do seu estilo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <BenefitItem icon={<CheckCircle2 className="text-primary"/>} text="Acumule pontos em cada visita" />
               <BenefitItem icon={<Gift className="text-primary"/>} text={`${target} Cortes = 1 Corte Grátis`} />
               <BenefitItem icon={<QrCode className="text-primary"/>} text="Check-in rápido via Celular" />
               <BenefitItem icon={<Smartphone className="text-primary"/>} text="Notificações de Horários Luxo" />
            </div>
         </motion.div>

         {/* Right Side: Form Card */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="relative"
         >
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <Scissors size={200} />
               </div>

               <h2 className="text-2xl font-serif font-black mb-8 uppercase tracking-wide">Ficha de Inscrição_</h2>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Seu Nome_</label>
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                        <input 
                           required
                           type="text" 
                           placeholder="Ex: João da Silva"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-black/40 border border-[#222] focus:border-primary rounded-2xl px-12 py-4 outline-none transition-all placeholder:text-zinc-700 font-medium"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">WhatsApp_Phone</label>
                     <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                        <input 
                           required
                           type="tel" 
                           placeholder="(11) 99999-9999"
                           value={formData.phone}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                           className="w-full bg-black/40 border border-[#222] focus:border-primary rounded-2xl px-12 py-4 outline-none transition-all placeholder:text-zinc-700 font-medium"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">AnIVERSÁRIO (Opcional)</label>
                     <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                        <input 
                           type="date" 
                           value={formData.birthday}
                           onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                           className="w-full bg-black/40 border border-[#222] focus:border-primary rounded-2xl px-12 py-4 outline-none transition-all font-medium text-zinc-400"
                        />
                     </div>
                  </div>

                  <button 
                     disabled={isSubmitting}
                     type="submit" 
                     className="w-full bg-primary hover:bg-white text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-[10px] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95 disabled:opacity-50 mt-10"
                  >
                     {isSubmitting ? "Sincronizando Dados..." : "Confirmar Minha Vaga no Clube"}
                  </button>
               </form>

               <div className="mt-8 text-center">
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                     Proteção de Dados ZERØCUT. <br />
                     Seus dados estão seguros e criptografados.
                  </p>
               </div>
            </div>
         </motion.div>
      </div>

      {/* Brand Watermark */}
      <div className="fixed bottom-12 right-0 rotate-90 origin-right p-4 opacity-5 pointer-events-none">
         <span className="text-[120px] font-black uppercase text-white font-serif">ZEROCUT</span>
      </div>
    </div>
  );
}

function BenefitItem({ icon, text }: any) {
   return (
      <div className="flex items-center gap-3">
         <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            {icon}
         </div>
         <span className="text-zinc-300 font-medium text-sm">{text}</span>
      </div>
   );
}

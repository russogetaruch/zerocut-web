"use client";

import Link from "next/link";
import { 
  Scissors, 
  ShieldCheck, 
  Zap, 
  Globe, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  BarChart3, 
  Smartphone,
  LayoutDashboard,
  Users,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [plans, setPlans] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPlans() {
      const { data } = await supabase.from('pricing_plans').select('*').order('price', { ascending: true });
      if (data && data.length > 0) {
        setPlans(data);
      } else {
        // Fallback plans if DB is not seeded yet
        setPlans([
          {
            name: "Starter",
            price: 49.90,
            description: "Essencial para barbeiros autônomos.",
            features: ["Agenda Ilimitada", "CRM Básico", "Vitrine Digital", "Checkout Manual"],
            is_popular: false,
            button_text: "Começar Starter"
          },
          {
            name: "Pro (Recomendado)",
            price: 99.90,
            description: "O poder da automação para sua barbearia.",
            features: ["Tudo no Starter", "Notificações Real-time", "Pagamento PIX Integrado", "Gestão de Financeiro"],
            is_popular: true,
            button_text: "Virar Pro"
          },
          {
            name: "Master / Rede",
            price: 199.90,
            description: "Para barbearias com grandes equipes.",
            features: ["Tudo no Pro", "Múltiplos Barbeiros", "Relatórios Avançados", "Suporte VIP 24h"],
            is_popular: false,
            button_text: "Falar com Consultor"
          }
        ]);
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black font-sans scroll-smooth overflow-x-hidden">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
              <Scissors className="text-primary" size={20} />
            </div>
            <h1 className="text-xl font-black tracking-[0.2em] uppercase font-serif">ZERØ<span className="text-primary">CUT</span></h1>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10">
            {["Recursos", "Planos", "Sobre", "Contato"].map((item) => (
               <Link key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 hover:text-primary transition-all uppercase">
                 {item}
               </Link>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <Link href="/auth" className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 hover:text-white transition-colors uppercase hidden sm:block">
               Acessar Painel
            </Link>
            <Link href="/auth" className="bg-primary text-black px-6 py-3 rounded-full font-black text-[11px] uppercase tracking-wider hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
               Criar Barbearia
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full mb-10 backdrop-blur-sm">
             <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
             <span className="text-[10px] font-mono font-black tracking-[0.4em] text-primary uppercase">Infraestrutura_SaaS_2026</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-serif font-black tracking-[-0.04em] mb-10 leading-[0.85] uppercase">
            Domine o Luxo <br /> 
            <span className="text-primary italic">da sua Arte.</span>
          </h1>
          
          <p className="text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto mb-16 font-medium leading-relaxed tracking-tight">
            A ferramenta definitiva para barbearias de alto padrão. Agendamento em 3 cliques, métricas financeiras ao vivo e CRM inteligente integrado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link href="/auth" className="group w-full sm:w-auto bg-primary text-black px-12 py-6 rounded-2xl font-black text-lg tracking-widest uppercase hover:bg-white transition-all shadow-[0_0_50px_rgba(212,175,55,0.15)] flex items-center gap-3">
                Começar agora <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </Link>
             <button className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-12 py-6 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md">
                Ver demonstração
             </button>
          </div>
        </motion.div>

        {/* Floating Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-32 w-full max-w-6xl relative z-20 group"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl p-4 md:p-8">
             <div className="flex items-center gap-2 mb-6 ml-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                <div className="ml-4 h-6 w-64 bg-white/5 rounded-full border border-white/5"></div>
             </div>
             
             {/* Mock Dashboard UI */}
             <div className="grid grid-cols-12 gap-6 h-[400px] md:h-[600px]">
                <div className="col-span-3 hidden md:flex flex-col gap-4 bg-white/5 rounded-3xl p-6 border border-white/5">
                   {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-white/5 rounded-full w-full"></div>)}
                </div>
                <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                   <div className="grid grid-cols-3 gap-6">
                      <div className="h-40 bg-primary/5 rounded-3xl border border-primary/10 p-6 flex flex-col justify-end gap-2">
                         <div className="h-4 w-12 bg-primary/20 rounded-full"></div>
                         <div className="h-8 w-24 bg-primary/30 rounded-full"></div>
                      </div>
                      <div className="h-40 bg-zinc-900/50 rounded-3xl border border-white/5"></div>
                      <div className="h-40 bg-zinc-900/50 rounded-3xl border border-white/5"></div>
                   </div>
                   <div className="flex-1 bg-gradient-to-br from-zinc-900/50 to-black rounded-3xl border border-white/5 p-8 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=')] opacity-50"></div>
                      <div className="relative z-10 space-y-4">
                         <div className="h-6 w-48 bg-white/10 rounded-full"></div>
                         <div className="h-4 w-full bg-white/5 rounded-full"></div>
                         <div className="h-4 w-[80%] bg-white/5 rounded-full"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-32 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col items-center">
            <h2 className="text-[10px] font-mono font-black text-primary uppercase tracking-[0.6em] mb-4 text-center">Protocolos_Elite</h2>
            <h3 className="text-4xl md:text-6xl font-serif font-black text-center max-w-2xl leading-[0.95] uppercase">Engenharia pensada no sucesso da sua marca.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck size={32}/>} 
              title="Privacidade Blindada" 
              desc="Isolamento total de dados entre barbearias em infraestrutura cloud segura." 
            />
            <FeatureCard 
              icon={<Zap size={32}/>} 
              title="Velocidade Absurda" 
              desc="Agendamento otimizado para mobile-first que converte clientes em segundos." 
            />
            <FeatureCard 
              icon={<Globe size={32}/>} 
              title="Multitenancy Nativa" 
              desc="Gerencie 1 ou 100 barbearias no mesmo painel com isolamento de slugs." 
            />
            <FeatureCard 
              icon={<BarChart3 size={32}/>} 
              title="Finanças ao Vivo" 
              desc="Acompanhe o faturamento da sua equipe em tempo real com gráficos dinâmicos." 
            />
            <FeatureCard 
              icon={<Smartphone size={32}/>} 
              title="PWA Experience" 
              desc="Instale o painel no seu celular e receba push notifications sem precisar de app store." 
            />
            <FeatureCard 
              icon={<Users size={32}/>} 
              title="Gestão de CRM" 
              desc="Entenda o comportamento do seu cliente e crie fidelidade com histórico detalhado." 
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-mono font-black text-primary uppercase tracking-[0.6em] mb-4">Investimento_Escalável</h2>
            <h3 className="text-5xl md:text-7xl font-serif font-black uppercase">Planos Adaptáveis.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <motion.div 
                key={plan.name}
                whileHover={{ y: -10 }}
                className={`relative flex flex-col p-8 md:p-12 rounded-[40px] border ${plan.is_popular ? 'bg-primary/5 border-primary shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'bg-white/5 border-white/10'} backdrop-blur-md`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[9px] font-black uppercase tracking-widest py-2 px-6 rounded-full shadow-lg">
                    Mais Escolhido
                  </div>
                )}
                
                <h4 className="text-2xl font-serif font-black mb-2 uppercase">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-zinc-500 text-lg">R$</span>
                  <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-zinc-500 text-sm font-mono tracking-widest">/mês</span>
                </div>
                
                <p className="text-zinc-400 text-sm mb-10 font-medium leading-relaxed">{plan.description}</p>
                
                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-center gap-3 text-sm font-medium text-zinc-300">
                      <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 ${plan.is_popular ? 'bg-primary text-black hover:bg-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {plan.button_text || 'Selecionar Plano'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Trust */}
      <section className="py-32 px-6 bg-[#050505] border-t border-white/5">
         <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-serif font-black mb-8 uppercase tracking-tight">Pronto para elevar o nível?</h3>
            <p className="text-zinc-500 mb-12 max-w-xl mx-auto font-medium">Junte-se às +500 barbearias que já estão digitalizando seu atendimento e multiplicando seus lucros com o ZERØCUT.</p>
            <Link href="/auth" className="inline-block bg-primary text-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
               Começar Teste Grátis
            </Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
             <Scissors className="text-primary" size={24} />
             <span className="text-xl font-black tracking-widest uppercase">ZERØCUT</span>
           </div>
           
           <div className="flex gap-10 text-[9px] font-mono font-black text-zinc-600 uppercase tracking-widest">
              <span>Termos</span>
              <span>Privacidade</span>
              <span>Blog</span>
              <span>API_Docs</span>
           </div>

           <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
             © 2026 Vittalix Engineering. Todos os direitos reservados.
           </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-10 flex flex-col gap-6 bg-white/5 border border-white/10 rounded-[40px] hover:bg-white/[0.08] hover:border-white/20 transition-all group"
    >
       <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all">
         {icon}
       </div>
       <div>
         <h4 className="text-xl font-serif font-black mb-3 uppercase tracking-tight text-white">{title}</h4>
         <p className="text-zinc-500 text-sm font-medium leading-relaxed">{desc}</p>
       </div>
    </motion.div>
  );
}


import Link from "next/link";
import { Scissors, ShieldCheck, Zap, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scissors className="text-primary" size={24} />
            <h1 className="text-2xl font-black tracking-tighter uppercase font-serif">ZERØCUT</h1>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href="/auth" className="text-sm font-mono font-bold tracking-widest text-zinc-400 hover:text-white transition-colors uppercase">
               Login_Gateway
            </Link>
            <Link href="/auth" className="bg-primary text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
               Crie sua Barbearia
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none">
          <div className="absolute top-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-1.5 rounded-full mb-8">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
             <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-zinc-500 uppercase">SaaS_Infrastructure_Online</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tight mb-8 leading-[0.9]">
            ELEVE O PADRÃO DA SUA <span className="text-primary">BARBEARIA.</span>
          </h1>
          
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            A plataforma multi-tenant definitiva para gestão de barbearias de luxo. 
            Agendamento real-time, CRM inteligente e finanças blindadas em um único lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link href="/auth" className="w-full sm:w-auto bg-primary text-black px-12 py-5 rounded-2xl font-black text-lg tracking-widest uppercase hover:bg-white transition-all shadow-2xl">
                Começar agora
             </Link>
             <button className="w-full sm:w-auto bg-[#0a0a0a] border border-[#1a1a1a] text-white px-12 py-5 rounded-2xl font-bold text-lg hover:border-zinc-700 transition-all">
                Ver demonstração
             </button>
          </div>
        </div>
      </section>

      {/* Features Minimalist Bar */}
      <section className="border-y border-[#1a1a1a] bg-[#050505]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#1a1a1a]">
          <FeatureItem icon={<ShieldCheck size={20}/>} title="RLS_Security" desc="Isolamento total de dados por tenant." />
          <FeatureItem icon={<Zap size={20}/>} title="Realtime_Engine" desc="Agenda sincronizada instantaneamente." />
          <FeatureItem icon={<Globe size={20}/>} title="Multi-tenant" desc="Gestão global de múltiplas lojas." />
          <FeatureItem icon={<Scissors size={20}/>} title="Zero_Friction" desc="Experience de agendamento em 3 cliques." />
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-10 flex flex-col gap-4 group">
       <div className="text-primary group-hover:scale-110 transition-transform">{icon}</div>
       <h3 className="font-mono text-xs font-bold tracking-[0.3em] text-white uppercase">{title}</h3>
       <p className="text-zinc-500 text-sm font-medium">{desc}</p>
    </div>
  );
}

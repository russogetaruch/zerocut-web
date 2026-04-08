import { 
  Scissors, 
  Star, 
  Clock, 
  MapPin, 
  X, 
  ChevronRight, 
  User, 
  CalendarDays,
  ShieldCheck,
  Zap,
  Award,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingClientFlow from "./_components/BookingClientFlow";
import ChatWidget from "./_components/ChatWidget";
import { AnimatedLogo, AnimatedBarberCard } from "./_components/MotionWrappers";

export default async function TenantPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!tenant) notFound();

  const [{ data: catalog }, { data: staff }] = await Promise.all([
    supabase.from('services').select('*').eq('tenant_id', tenant.id).order('price', { ascending: false }),
    supabase.from('professionals').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: true })
  ]);

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-zinc-300 selection:bg-primary selection:text-black">
      
        {/* 1. HERO SECTION - NEO-LUXURY IMMERSIVE */}
      <section className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-black">
        {/* Cinematic Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-110 grayscale"
          style={{ backgroundImage: `url(${tenant.banner_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80'})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60"></div>

        {/* Floating Glass Header (Address + Info) */}
        <div className="absolute top-10 inset-x-0 z-50 px-6">
           <div className="max-w-6xl mx-auto flex justify-between items-center bg-white/[0.03] backdrop-blur-2xl border border-white/5 px-8 py-4 rounded-[2rem] shadow-2xl">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    <span className="text-[9px] font-mono text-white uppercase tracking-widest">{tenant.address || 'Localização Prime'}</span>
                 </div>
                 <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                 <div className="hidden md:flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Seg - Sab / 09h - 19h</span>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <ShieldCheck size={16} className="text-primary" />
                 <span className="text-[10px] font-mono text-white font-black uppercase tracking-[0.3em]">AUTHENTIC_CERTIFIED_ZERØ</span>
              </div>
           </div>
        </div>

        <div className="relative z-10 text-center flex flex-col items-center max-w-7xl animate-in fade-in zoom-in duration-1000">
          
          {/* Logo Circular Elite */}
          <div className="mb-12 relative">
             <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-125 animate-pulse"></div>
             <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border border-primary/40 p-1 relative z-10 bg-black/50 overflow-hidden shadow-2xl">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-black">
                   <img src={tenant.logo_url || '/logo.png'} className="w-3/4 h-3/4 object-contain" alt={tenant.name} />
                </div>
             </div>
          </div>

          {/* Typography Overdose */}
          <div className="space-y-2 mb-12">
             <p className="text-primary font-mono text-[10px] tracking-[0.6em] uppercase font-black opacity-80 mb-4 animate-in slide-in-from-top-4 duration-1200">/REDEFININDO_O_ESTILO_MASCULINO</p>
             <h1 className="text-6xl md:text-[11rem] font-serif font-black text-white italic tracking-tighter leading-none uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,1)]">
                {tenant.name}
             </h1>
             <h2 className="text-zinc-500 font-serif text-lg md:text-3xl italic tracking-tight font-medium opacity-60">
                {tenant.tagline || 'Excelência em cada detalhe.'}
             </h2>
          </div>

          {/* Refined CTA Container */}
          <div className="flex flex-col items-center gap-10">
             <div className="scale-110">
                <BookingClientFlow 
                   tenantId={tenant.id} 
                   services={catalog || []} 
                   professionals={staff || []}
                />
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 pt-16 border-t border-white/5 w-full max-w-4xl px-6">
                <MiniStat value="08+" label="SERVIÇOS_ELITE" />
                <MiniStat value="5.0" label="SATISFAÇÃO_VIP" />
                <MiniStat value="15+" label="ANOS_PRÁTICA" />
                <MiniStat value="FREE" label="WIFI_&_CAFÉ" />
             </div>
          </div>
        </div>

        {/* Aesthetic Scroll Trigger */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
           <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.5em]">Scroll_Down</span>
           <div className="w-px h-16 bg-gradient-to-b from-primary/30 to-transparent"></div>
        </div>
      </section>

      {/* 2. MENU DE SERVIÇOS (REIMAGINADO) */}
      <section className="bg-[#030303] py-40 border-y border-white/5 relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/[0.02] filter blur-[150px] rounded-full"></div>
        
        <div className="max-w-6xl mx-auto px-6 space-y-32">
           <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
              <div className="space-y-6">
                 <h3 className="text-primary font-mono text-[10px] tracking-[0.5em] uppercase font-black">/PORTFÓLIO_DE_ESTILO</h3>
                 <h2 className="text-5xl md:text-7xl font-serif font-black text-white italic uppercase tracking-tighter leading-none">Serviços_Curados</h2>
              </div>
              <p className="max-w-xs text-zinc-500 font-mono text-[10px] uppercase leading-relaxed tracking-widest text-right">
                 Trabalhamos apenas com as melhores técnicas mundiais de visagismo e acabamento.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {catalog?.map((srv) => (
                 <div key={srv.id} className="group relative space-y-6 flex flex-col">
                    <div className="flex justify-between items-start border-b border-white/5 pb-4 group-hover:border-primary/40 transition-colors">
                       <div>
                          <p className="text-primary font-mono text-[8px] tracking-widest uppercase mb-1">{srv.category || "Master"}</p>
                          <h4 className="text-2xl font-serif font-black text-white uppercase italic group-hover:text-primary transition-colors">{srv.name}</h4>
                       </div>
                       <span className="text-xl font-serif font-black text-white group-hover:translate-x-2 transition-transform italic">R${srv.price}</span>
                    </div>
                    <p className="text-zinc-600 text-[11px] leading-relaxed line-clamp-2 h-8">{srv.description || "Técnica apurada de corte e acabamento premium."}</p>
                    <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                       <Clock size={12} className="text-primary/40" /> {srv.duration_minutes} MINUTOS_
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. NOSSA EQUIPE - GRID ESTÉTICO */}
      <section className="bg-black py-32 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto px-6">
           <div className="flex justify-between items-end mb-20">
              <div className="space-y-4">
                 <h3 className="text-primary font-mono text-[10px] tracking-[0.5em] uppercase font-black">/ARTISTAS_DO_ESTILO</h3>
                 <h2 className="text-4xl md:text-6xl font-serif font-black text-white italic uppercase tracking-tighter leading-none">A Equipe_</h2>
              </div>
              <div className="text-right hidden md:block group cursor-default">
                 <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Reserva Imediata</p>
                 <p className="text-sm font-black text-primary italic transition-all group-hover:tracking-widest">/FULL_SERVICE</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {staff && staff.length > 0 ? staff.map((prof) => (
                <div key={prof.id} className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
                   <img 
                      src={prof.avatar_url || `https://i.pravatar.cc/400?u=${prof.id}`} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
                      alt={prof.name} 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                   <div className="absolute bottom-0 inset-x-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-primary font-mono text-[9px] tracking-widest uppercase mb-1">{prof.specialty || 'Master Barber'}</p>
                      <h4 className="text-2xl font-serif font-black text-white uppercase italic tracking-tighter">{prof.name}</h4>
                      <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                         {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" className="text-primary" />)}
                      </div>
                   </div>
                </div>
              )) : (
                <p className="col-span-full text-center text-zinc-600 font-mono text-xs uppercase py-10">Artistas escalando em breve.</p>
              )}
           </div>
        </div>
      </section>

      {/* 5. LOCALIZAÇÃO E CONTATO - GLASS CARD */}
      <section className="max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
         <div className="md:col-span-7 space-y-10">
            <div className="space-y-4">
               <h3 className="text-primary font-mono text-[10px] tracking-[0.5em] uppercase font-black">/ONDE_ESTAMOS</h3>
               <h2 className="text-4xl md:text-6xl font-serif font-black text-white italic uppercase tracking-tighter">Nosso Espaço_</h2>
            </div>
            
            <div className="bg-[#080808] border border-white/5 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <MapPin size={120} className="text-primary" />
               </div>
               
               <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/20">
                     <MapPin size={20} className="text-primary" />
                  </div>
                  <div>
                     <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">Localização</p>
                     <p className="text-white font-bold text-lg leading-relaxed">{tenant.address || 'Consultar Localização de Elite'}</p>
                  </div>
               </div>

               <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/20">
                     <Clock size={20} className="text-primary" />
                  </div>
                  <div>
                     <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">Funcionamento</p>
                     <p className="text-white font-bold text-lg leading-relaxed">Segunda a Sábado • 08h às 20h</p>
                  </div>
               </div>
               
               <button className="w-full py-5 bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 text-white font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                  <MapPin size={16} className="text-primary" /> Ver no Google Maps
               </button>
            </div>
         </div>

         <div className="md:col-span-5 h-[500px] bg-zinc-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative group">
            <img src={tenant.banner_url || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80"} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               <p className="text-primary font-mono text-[10px] tracking-[0.5em] uppercase font-black mb-2">Ambiente</p>
               <h3 className="text-3xl font-serif font-black text-white uppercase italic">Sinta o Vibe_</h3>
            </div>
         </div>
      </section>

      {/* Floating Chat Engine UI */}
      <ChatWidget tenantId={tenant.id} />

      {/* Footer Minimalist */}
      <footer className="py-20 border-t border-white/5 bg-[#030303]">
         <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-xl font-mono text-white font-black tracking-[0.3em] uppercase mb-6 italic">/ZERØCUT</h2>
            <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-[0.4em] leading-relaxed">
               PLATAFORMA DE GESTÃO PARA BARBEARIAS DE ALTA PERFORMANCE.<br/>
               © 2026 TODOS OS DIREITOS RESERVADOS. VITTALIX_CORP
            </p>
         </div>
      </footer>

    </div>
  );
}

function MiniStat({ value, label }: { value: string, label: string }) {
   return (
      <div className="flex flex-col items-center gap-1 group">
         <span className="text-xl font-serif font-black text-white italic tracking-tighter group-hover:text-primary transition-colors">{value}</span>
         <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest leading-none">{label}</span>
      </div>
   );
}

function StatItem({ icon, value, title }: any) {
   return (
      <div className="flex flex-col items-center text-center space-y-4 group">
         <div className="w-14 h-14 bg-[#0a0a0a] rounded-2xl flex items-center justify-center text-zinc-500 border border-white/5 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-xl group-hover:shadow-primary/5">
            {icon}
         </div>
         <div className="space-y-1">
            <p className="text-white font-serif font-black italic tracking-tighter text-xl">{value}</p>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{title}</p>
         </div>
      </div>
   );
}

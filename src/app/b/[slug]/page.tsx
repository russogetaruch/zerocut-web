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
      
       {/* 1. HERO SECTION - IMMERSIVE OVERLAY */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Banner with Deep Parallax Look */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
          style={{ backgroundImage: `url(${tenant.banner_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80'})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black"></div>
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black to-transparent"></div>
        
        {/* Glowing Accents */}
        <div className="absolute top-[30%] left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[180px] rounded-full"></div>

        <div className="relative z-10 text-center px-6 max-w-6xl w-full flex flex-col items-center">
          
          {/* Logo - Ajuste 1: Circular Elite Frame */}
          <div className="relative mb-12 group cursor-default">
             <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
             <div className="w-32 h-32 md:w-44 md:h-44 p-1 rounded-full bg-gradient-to-tr from-primary/40 via-white/10 to-transparent relative z-10 shadow-2xl">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                   <img src={tenant.logo_url || '/logo.png'} className="w-[85%] h-[85%] object-contain scale-110 group-hover:scale-125 transition-transform duration-1000" alt={tenant.name} />
                </div>
             </div>
          </div>

          <div className="space-y-4 mb-10">
             <div className="flex items-center justify-center gap-4 mb-2">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50"></span>
                <span className="text-primary font-mono text-[9px] tracking-[0.5em] uppercase font-black">EST. 2026</span>
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50"></span>
             </div>
             
             <h1 className="text-7xl md:text-[10rem] font-serif font-black text-white tracking-tighter leading-[0.85] uppercase italic drop-shadow-2xl">
               {tenant.name}
             </h1>
             
             <div className="inline-flex items-center gap-4 bg-primary/5 backdrop-blur-sm border border-primary/20 px-8 py-3 rounded-2xl">
                <p className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase font-black">
                   {tenant.tagline || 'REDEFININDO O CONCEITO DE ESTILO'}
                </p>
             </div>
          </div>

          <div className="flex flex-col items-center gap-8 max-w-xl">
             <div className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors cursor-default">
                <MapPin size={16} className="text-primary" />
                <p className="text-xs font-medium uppercase tracking-[0.2em]">{tenant.address || 'Localização Prime'}</p>
             </div>

             <div className="w-full scale-110 md:scale-125">
                <BookingClientFlow 
                   tenantId={tenant.id} 
                   services={catalog || []} 
                   professionals={staff || []}
                />
             </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 flex flex-col items-center gap-4 group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
           <span className="text-[9px] font-mono text-white uppercase tracking-[0.6em] animate-pulse">Explore_Excellence</span>
           <div className="w-px h-16 bg-gradient-to-b from-primary via-primary/20 to-transparent"></div>
        </div>
      </section>

      {/* 2. STATS & VIBE CROSSHATCH */}
      <section className="bg-black py-20 relative border-y border-white/5">
         <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatItem icon={<Zap size={20}/>} value="FAST" title="RESERVA RÁPIDA" />
            <StatItem icon={<Award size={20}/>} value="PREMIUM" title="ESTILO DE ELITE" />
            <StatItem icon={<Smartphone size={20}/>} value="SMART" title="GESTÃO DIGITAL" />
            <StatItem icon={<MapPin size={20}/>} value="PRIME" title="LOCALIZAÇÃO" />
         </div>
      </section>

      {/* 3. MENU DE SERVIÇOS (CATÁLOGO DE LUXO) */}
      <section className="max-w-6xl mx-auto px-6 py-32 space-y-20 relative">
        <div className="flex flex-col items-center text-center space-y-4">
           <h3 className="text-primary font-mono text-[10px] tracking-[0.5em] uppercase font-black">/MENU_DE_ESTILO</h3>
           <h2 className="text-4xl md:text-6xl font-serif font-black text-white italic uppercase tracking-tighter">Nossos Portfólios_</h2>
           <div className="w-24 h-1 bg-primary/30 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {catalog && catalog.length > 0 ? (
             catalog.map((srv) => (
                <div key={srv.id} className="group bg-[#080808] border border-white/5 p-10 rounded-[2.5rem] hover:border-primary/40 transition-all relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Scissors size={64} className="text-primary" />
                   </div>
                   
                   <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                         <Zap size={20} />
                      </div>
                      <span className="text-primary font-serif font-black text-2xl group-hover:translate-x-2 transition-transform">R$ {srv.price}</span>
                   </div>

                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-primary font-mono text-[8px] bg-primary/5 border border-primary/10 px-2 py-0.5 rounded tracking-[0.4em] uppercase font-black uppercase tracking-widest">{srv.category || "Cabelo"}</span>
                   </div>
                   <h4 className="text-xl font-serif font-bold text-white mb-4 uppercase italic group-hover:text-primary transition-colors tracking-tight">{srv.name}</h4>
                   <p className="text-zinc-500 text-sm mb-8 leading-relaxed font-medium line-clamp-3 h-20">{srv.description || "Técnica apurada de corte e acabamento, respeitando o seu perfil."}</p>
                   
                   <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest pt-6 border-t border-white/5">
                      <Clock size={12} className="text-primary" /> {srv.duration_minutes} MINUTOS_
                      <CheckCircle2 size={12} className="text-primary ml-auto" /> ÉLITE SERVICE
                   </div>
                </div>
             ))
           ) : (
             <p className="col-span-full text-center text-zinc-600 font-mono text-xs uppercase italic py-20">Nossos serviços estão em atualização.</p>
           )}
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

import { Scissors, Star, Clock, MapPin, X, ChevronRight, User, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingClientFlow from "./_components/BookingClientFlow";
import ChatWidget from "./_components/ChatWidget";
import { AnimatedLogo, AnimatedBarberCard } from "./_components/MotionWrappers";

export default async function TenantPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  // Buscar a barbearia no banco real!
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!tenant) {
    notFound();
  }

  // BUSCA OS SERVIÇOS REAIS DO BANCO!
  const [{ data: catalog }, { data: staff }] = await Promise.all([
    supabase.from('services').select('*').eq('tenant_id', tenant.id).order('price', { ascending: false }),
    supabase.from('professionals').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: true })
  ]);

  return (
    <div className="min-h-screen bg-black font-sans text-zinc-300">
      
      {/* Dynamic Header */}
      <header className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url(${tenant.banner_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80'})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          {tenant.logo_url && (
            <AnimatedLogo>
               <img src={tenant.logo_url} className="w-full h-full object-cover rounded-2xl" alt={tenant.name} />
            </AnimatedLogo>
          )}

          <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tight mb-4 uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
             {tenant.name}
          </h1>
          
          <div className="flex flex-col items-center gap-4">
             <p className="text-primary font-mono tracking-[0.3em] text-xs md:text-sm uppercase bg-primary/10 px-6 py-2 rounded-full border border-primary/20 backdrop-blur-sm">
               {tenant.tagline || 'Estilo sob medida. Reserva em 30 segundos.'}
             </p>
             <p className="text-zinc-400 font-medium text-sm flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> {tenant.address || 'Localização de Elite'}
             </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="max-w-4xl mx-auto px-4 py-12 -mt-24 relative z-20">
        
        {/* Descrição e CTA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
           <div className="md:col-span-8 bg-[#0a0a0a]/80 backdrop-blur-xl p-10 border border-[#1a1a1a] rounded-[2.5rem] shadow-2xl flex flex-col justify-center">
              <h3 className="text-white font-serif text-3xl font-bold mb-4">A Experiência ZERØ</h3>
              <p className="text-zinc-400 leading-relaxed text-lg">
                 {tenant.description || 'Elevando o padrão da barbearia com técnica, estilo e conforto.'}
              </p>
              <div className="mt-8 flex gap-6">
                 <div className="text-center bg-zinc-900/50 p-4 rounded-2xl border border-[#1a1a1a] flex-1">
                    <p className="text-primary font-black text-2xl mb-1">5.0</p>
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Avaliação</p>
                 </div>
                 <div className="text-center bg-zinc-900/50 p-4 rounded-2xl border border-[#1a1a1a] flex-1">
                    <p className="text-primary font-black text-2xl mb-1">9+</p>
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Serviços</p>
                 </div>
              </div>
           </div>

           <div className="md:col-span-4 flex items-stretch">
              <BookingClientFlow 
                tenantId={tenant.id} 
                services={catalog || []} 
                professionals={staff || []}
              />
           </div>
        </div>

        {/* Nossa Equipe Dinâmica */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-3xl font-serif font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                <User size={28} className="text-primary" /> Nossa Equipe
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent ml-8 hidden md:block" />
           </div>

           <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
             {staff && staff.length > 0 ? staff.map((prof) => (
               <AnimatedBarberCard key={prof.id}>
                 <div className="w-24 h-24 bg-zinc-900 rounded-full mb-4 flex items-center justify-center p-1 border border-zinc-800 group-hover:border-primary/40 transition-colors overflow-hidden">
                    {prof.avatar_url ? (
                      <img src={prof.avatar_url} alt={prof.name} className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <User size={32} className="text-zinc-700" />
                    )}
                 </div>
                 <p className="font-serif font-bold text-white text-lg tracking-tight uppercase">{prof.name}</p>
                 <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1 mb-3">{prof.specialty || 'Master Barber'}</p>
                 <div className="text-primary flex gap-0.5 scale-90">
                    <Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" />
                 </div>
               </AnimatedBarberCard>
             )) : (
               <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest italic py-4">Equipe disponível em breve.</p>
             )}
           </div>
        </div>
      </section>

      {/* Floating Chat Engine UI */}
      <ChatWidget tenantId={tenant.id} />
    </div>
  );
}

function ServiceCard({ name, price, time }: { name: string; price: string; time: string }) {
  return (
    <div className="bg-surface border border-border p-4 rounded-2xl flex justify-between items-center hover:border-primary/50 transition-colors cursor-pointer group">
      <div>
        <h3 className="font-medium text-white group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
          <Clock size={12} /> {time}
        </p>
      </div>
      <div className="font-bold text-white bg-surface-hover px-3 py-1.5 rounded-lg border border-border flex items-center gap-1">
        {price}
      </div>
    </div>
  );
}

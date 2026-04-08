import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronRight, Calendar, User, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false });

  return (
    <div className="min-h-screen bg-black text-white font-sans">
       
       {/* Hero Premium */}
       <header className="py-32 px-6 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full"></div>
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-6">
             <div className="flex items-center gap-4 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 animate-pulse">
                <Newspaper size={18} className="text-primary" />
                <span className="text-primary font-mono text-[10px] tracking-[0.5em] uppercase font-black">/RECURSOS_E_INSIGHTS</span>
             </div>
             <h1 className="text-5xl md:text-8xl font-serif font-black italic uppercase tracking-tighter leading-none">
                Blog_Oficial<br /><span className="text-primary">ZeroCut</span>
             </h1>
             <p className="max-w-2xl text-zinc-500 text-sm md:text-lg leading-relaxed font-medium">
                Tendências do mercado barbery, dicas de gestão para barbearias e as últimas novidades da plataforma que está revolucionando o estilo masculino.
             </p>
          </div>
       </header>

       {/* Blog Listing */}
       <main className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
             {posts && posts.length > 0 ? (
               posts.map((post) => (
                 <Link 
                   href={`/blog/${post.slug}`} 
                   key={post.id}
                   className="group flex flex-col space-y-6 hover:-translate-y-2 transition-transform duration-500"
                 >
                    <div className="aspect-[16/10] bg-zinc-900 rounded-[2.5rem] overflow-hidden relative border border-white/5 group-hover:border-primary/40 transition-colors">
                       <img 
                         src={post.cover_url || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80"} 
                         className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" 
                         alt={post.title} 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                       <div className="absolute bottom-6 left-6">
                          <span className="bg-primary text-black font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-full shadow-2xl">
                             Tendência_2026
                          </span>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.published_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><User size={12} /> {post.author_name}</span>
                       </div>
                       <h3 className="text-2xl font-serif font-black italic uppercase group-hover:text-primary transition-colors leading-tight">
                          {post.title}
                       </h3>
                       <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                          {post.excerpt || "Confira os detalhes sobre como elevar o nível da sua barbearia com as melhores práticas do mercado mundial."}
                       </p>
                       <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest pt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                          Ler Artigo Completo <ChevronRight size={14} />
                       </div>
                    </div>
                 </Link>
               ))
             ) : (
               <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[4rem] text-center flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-700">
                     <Newspaper size={32} />
                  </div>
                  <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.5em] italic">Estamos preparando insights épicos_</p>
               </div>
             )}
          </div>
       </main>

    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, User, Clock, Share2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) notFound();

  // Buscar outros posts para sugestão no final
  const { data: relatedPosts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, cover_url, published_at")
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3);

  // Calcular tempo de leitura estimado
  const words = post.content?.split(" ").length || 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-[-10%] w-[40%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-18 py-5 flex justify-between items-center">
          <Link href="/blog" className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors text-sm font-mono uppercase tracking-widest group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Blog
          </Link>
          <Link href="/" className="text-lg font-black tracking-[0.2em] uppercase font-serif">
            ZERØ<span className="text-primary">CUT</span>
          </Link>
          <div className="w-28 hidden md:block" />
        </div>
      </nav>

      {/* Hero do Post */}
      <header className="relative pt-28 pb-0 overflow-hidden">
        {/* Cover Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={post.cover_url || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80"}
            alt={post.title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 flex flex-col items-center text-center space-y-8">
          <div className="flex items-center gap-6 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-primary" />
              {new Date(post.published_at).toLocaleDateString("pt-BR", { 
                day: "numeric", month: "long", year: "numeric" 
              })}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center gap-1.5">
              <User size={12} className="text-primary" />
              {post.author_name}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-primary" />
              {readTime} min de leitura
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-serif font-black tracking-[-0.03em] leading-[0.9] uppercase">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="max-w-2xl text-zinc-400 text-base md:text-xl leading-relaxed font-medium">
              {post.excerpt}
            </p>
          )}
        </div>
      </header>

      {/* Imagem de Capa */}
      {post.cover_url && (
        <div className="max-w-5xl mx-auto px-6 -mt-4 relative z-10">
          <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-black">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Corpo do Artigo */}
      <main className="max-w-3xl mx-auto px-6 py-24 relative z-10">
        
        {/* Linha separadora decorativa */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-white/5" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Conteúdo do Post */}
        <div className="space-y-6 text-zinc-300 leading-relaxed text-base md:text-lg">
          {post.content.split("\n").filter(Boolean).map((paragraph: string, index: number) => (
            <p key={index} className={`${index === 0 ? "first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-primary" : ""}`}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Share / CTA */}
        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Escrito por</p>
            <p className="text-white font-bold text-lg">{post.author_name}</p>
            <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Equipe Editorial ZERØCUT</p>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-full text-zinc-400 hover:text-primary hover:border-primary/30 transition-all text-xs font-mono uppercase tracking-widest"
          >
            <Share2 size={14} /> Compartilhar
          </button>
        </div>
      </main>

      {/* CTA de Conversão */}
      <section className="py-20 px-6 bg-[#040404] border-y border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-[10px] font-mono text-primary uppercase tracking-[0.5em]">Pronto para transformar sua barbearia?</span>
          <h2 className="text-3xl md:text-5xl font-serif font-black uppercase tracking-tight">
            A ferramenta que barbeiros<br /><span className="text-primary italic">de elite</span> usam.
          </h2>
          <Link
            href="/auth"
            className="inline-flex items-center gap-3 bg-primary text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-primary/20"
          >
            Criar conta grátis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Posts Relacionados */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-white/5" />
              <h3 className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest whitespace-nowrap">
                Leia também
              </h3>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <Link
                  href={`/blog/${related.slug}`}
                  key={related.id}
                  className="group flex flex-col space-y-4 hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="aspect-[16/10] bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 group-hover:border-primary/30 transition-colors">
                    <img
                      src={related.cover_url || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80"}
                      alt={related.title}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                      {new Date(related.published_at).toLocaleDateString("pt-BR")}
                    </p>
                    <h4 className="text-white font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {related.title}
                    </h4>
                    {related.excerpt && (
                      <p className="text-zinc-500 text-xs line-clamp-2">{related.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer minimal */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
          © 2026 Vittalix Engineering · ZERØCUT Platform
        </p>
      </footer>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil, Trash2, Globe, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminBlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 w-fit">
             <Newspaper size={18} className="text-primary" />
             <h2 className="text-2xl font-black text-white tracking-widest uppercase font-mono">
                BLOG_MANAGER
             </h2>
          </div>
          <p className="font-mono text-zinc-600 text-[10px] tracking-[0.5em] uppercase">
             Publicações e Insights Institucionais
          </p>
        </div>
        
        <button className="px-8 py-4 bg-primary text-black font-black text-[10px] tracking-widest uppercase rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
           <Plus size={14} /> NOVA_PUBLICAÇÃO
        </button>
      </div>

      {/* Grid de Posts */}
      <div className="grid grid-cols-1 gap-4">
         {posts?.map((post) => (
            <div key={post.id} className="group bg-[#080808] border border-[#1a1a1a] p-6 rounded-3xl flex items-center justify-between hover:border-primary/30 transition-all">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
                     <img src={post.cover_url || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80"} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                  <div>
                     <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{post.title}</h3>
                     <div className="flex items-center gap-4 mt-2">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                           <Globe size={10} /> /{post.slug}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                           {new Date(post.created_at).toLocaleDateString()}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <button className="p-3 bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10">
                     <Pencil size={18} />
                  </button>
                  <button className="p-3 bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                     <Trash2 size={18} />
                  </button>
               </div>
            </div>
         ))}

         {(!posts || posts.length === 0) && (
            <div className="py-20 text-center border-2 border-dashed border-[#1a1a1a] rounded-[3rem]">
               <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.5em]">Nenhum artigo publicado_</p>
            </div>
         )}
      </div>

    </div>
  );
}

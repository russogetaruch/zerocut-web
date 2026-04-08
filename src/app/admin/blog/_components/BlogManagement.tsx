"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  User,
  AlignLeft,
  Link2,
  Calendar,
  Eye,
  Newspaper,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { savePost, deletePost } from "../actions";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  author_name: string | null;
  published_at: string;
  created_at: string;
};

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  content: "",
  cover_url: "",
  author_name: "Equipe ZERØCUT",
  published_at: new Date().toISOString().split("T")[0],
};

export default function BlogManagement({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  function openNew() {
    setEditingPost(null);
    setFormData(EMPTY_FORM);
    setIsPreview(false);
    setIsDrawerOpen(true);
  }

  function openEdit(post: Post) {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      cover_url: post.cover_url || "",
      author_name: post.author_name || "Equipe ZERØCUT",
      published_at: post.published_at.split("T")[0],
    });
    setIsPreview(false);
    setIsDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await savePost({
      id: editingPost?.id,
      ...formData,
    });

    setIsSubmitting(false);

    if (!result.error) {
      setIsDrawerOpen(false);
      window.location.reload();
    } else {
      alert("Erro: " + result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja apagar este artigo permanentemente?")) return;
    const result = await deletePost(id);
    if (!result.error) window.location.reload();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] shadow-xl">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white mb-1 tracking-tight">
            Blog Editorial
          </h2>
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            {posts.length} artigo{posts.length !== 1 ? "s" : ""} publicado{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/blog"
            target="_blank"
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-[10px] py-3 px-5 rounded-xl transition-all uppercase tracking-widest"
          >
            <ExternalLink size={14} /> Ver Blog
          </a>
          <button
            onClick={openNew}
            className="bg-primary text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95 text-xs tracking-widest"
          >
            <Plus size={16} /> NOVO ARTIGO
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              layoutId={post.id}
              className="group bg-[#080808] border border-[#1a1a1a] rounded-3xl overflow-hidden hover:border-primary/30 transition-all"
            >
              {/* Cover Image */}
              <div className="aspect-[16/9] relative overflow-hidden bg-zinc-900">
                <img
                  src={
                    post.cover_url ||
                    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800"
                  }
                  alt={post.title}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="bg-primary text-black font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full">
                    Publicado
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(post.published_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={10} />
                    {post.author_name}
                  </span>
                </div>

                <h3 className="text-white font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                <div className="pt-3 border-t border-[#151515] flex items-center gap-2">
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-[9px] font-mono text-zinc-600 hover:text-primary transition-colors uppercase tracking-widest"
                  >
                    <Eye size={12} /> Ver Post
                  </a>
                  <div className="flex-1" />
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 bg-zinc-900/60 text-zinc-500 hover:text-white rounded-lg transition-colors border border-transparent hover:border-zinc-700"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-red-500/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 border-2 border-dashed border-white/5 rounded-[4rem] text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-zinc-700">
            <Newspaper size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-zinc-400 font-bold text-lg">Nenhum artigo ainda</p>
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.5em]">
              Comece criando o primeiro conteúdo do blog
            </p>
          </div>
          <button
            onClick={openNew}
            className="bg-primary text-black font-black text-xs py-4 px-10 rounded-2xl uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/20"
          >
            Criar Primeiro Artigo
          </button>
        </div>
      )}

      {/* DRAWER - Editor de Post */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#0a0a0a] border-l border-[#1a1a1a] z-[101] shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center bg-black shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif">
                    {editingPost ? "Editar Artigo" : "Novo Artigo"}
                  </h3>
                  <p className="text-xs text-primary font-mono tracking-widest uppercase mt-1">
                    Blog Editorial · ZERØCUT
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPreview(!isPreview)}
                    className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${isPreview ? "border-primary text-primary bg-primary/10" : "border-zinc-800 text-zinc-500 hover:text-white"}`}
                  >
                    <Eye size={12} />
                    {isPreview ? "Editar" : "Preview"}
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-900 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Form / Preview */}
              {isPreview ? (
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  <h1 className="text-4xl font-serif font-black text-white leading-tight">
                    {formData.title || "Título do Artigo"}
                  </h1>
                  {formData.excerpt && (
                    <p className="text-zinc-400 text-lg leading-relaxed border-l-2 border-primary pl-4">
                      {formData.excerpt}
                    </p>
                  )}
                  {formData.cover_url && (
                    <img
                      src={formData.cover_url}
                      alt="Cover"
                      className="w-full rounded-2xl object-cover max-h-60"
                    />
                  )}
                  <div className="prose prose-invert prose-sm max-w-none">
                    {formData.content.split("\n").map((line, i) => (
                      <p key={i} className="text-zinc-300 leading-relaxed mb-4">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6 overflow-y-auto">

                  {/* Título */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                      Título do Artigo *
                    </label>
                    <div className="relative">
                      <FileText
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                      />
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: 10 Cortes que dominam 2026"
                        className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                      Resumo / Excerpt *
                    </label>
                    <div className="relative">
                      <AlignLeft
                        size={14}
                        className="absolute left-3 top-3 text-primary"
                      />
                      <textarea
                        required
                        value={formData.excerpt}
                        onChange={(e) =>
                          setFormData({ ...formData, excerpt: e.target.value })
                        }
                        placeholder="Um breve resumo que aparecerá nos cards do blog..."
                        rows={2}
                        className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                      Conteúdo Completo *
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Escreva o artigo completo aqui. Separe em parágrafos com Enter..."
                      rows={10}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm resize-none font-mono leading-relaxed"
                    />
                  </div>

                  {/* URL da Capa */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                      URL da Imagem de Capa
                    </label>
                    <div className="relative">
                      <Link2
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                      />
                      <input
                        type="url"
                        value={formData.cover_url}
                        onChange={(e) =>
                          setFormData({ ...formData, cover_url: e.target.value })
                        }
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm"
                      />
                    </div>
                    {formData.cover_url && (
                      <img
                        src={formData.cover_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-xl border border-zinc-800 mt-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  {/* Author + Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                        Nome do Autor
                      </label>
                      <div className="relative">
                        <User
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                        />
                        <input
                          type="text"
                          value={formData.author_name}
                          onChange={(e) =>
                            setFormData({ ...formData, author_name: e.target.value })
                          }
                          className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                        Data de Publicação
                      </label>
                      <div className="relative">
                        <Calendar
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                        />
                        <input
                          type="date"
                          value={formData.published_at}
                          onChange={(e) =>
                            setFormData({ ...formData, published_at: e.target.value })
                          }
                          className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 space-y-3 border-t border-[#151515]">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-widest"
                    >
                      {isSubmitting
                        ? "PUBLICANDO..."
                        : editingPost
                        ? "SALVAR ALTERAÇÕES"
                        : "PUBLICAR ARTIGO"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="w-full bg-transparent text-zinc-500 border border-[#222] font-mono tracking-widest text-[10px] py-3 rounded-xl hover:text-white hover:border-zinc-700 transition-all uppercase"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

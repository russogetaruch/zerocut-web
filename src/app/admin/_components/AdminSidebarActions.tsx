"use client";

import { useState } from "react";
import { LogOut, X, Globe, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function AdminSidebarActions({ publicUrl }: { publicUrl: string }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <>
      <div className="p-6 border-t border-[#151515]">
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 w-full p-4 rounded-xl text-zinc-500 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-xs font-mono tracking-wider uppercase group"
        >
          <LogOut size={16} className="group-hover:text-red-500" />
          Sair da Conta
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0a0a0a] border border-white/10 rounded-[30px] p-10 max-w-sm w-full shadow-2xl"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-8 mx-auto border border-red-500/20">
                 <LogOut size={32} className="text-red-500" />
              </div>

              <h3 className="text-2xl font-serif font-black text-white text-center mb-4 uppercase italic">Deseja Sair?</h3>
              <p className="text-zinc-500 text-sm text-center mb-10 font-medium">
                 Você pode encerrar sua sessão ou voltar para sua Vitrine Pública.
              </p>

              <div className="space-y-4">
                 <button 
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                   <LogIn size={14} /> Sair_Agora
                 </button>
                 
                 <button 
                    onClick={() => {
                        setShowModal(false);
                        window.open(publicUrl, '_blank');
                    }}
                    className="w-full bg-zinc-900 text-zinc-300 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest border border-white/5 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                   <Globe size={14} /> Ir para Vitrine
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

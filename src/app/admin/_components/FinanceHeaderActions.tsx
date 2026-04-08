"use client";

import { useState } from "react";
import { Plus, Download, X, DollarSign, Tag, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FinanceHeaderActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReport = () => {
    alert("Gerando relatório PDF consolidado... (Funcionalidade de Exportação em Processamento)");
  };

  return (
    <>
      <div className="flex gap-3">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-primary text-black font-black text-[10px] tracking-widest uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center gap-2"
        >
          <Plus size={14} /> LANÇAR_DESPESA
        </button>
        <button 
          onClick={handleReport}
          className="px-6 py-3 bg-zinc-900 text-white font-black text-[10px] tracking-widest uppercase rounded-xl border border-[#222] hover:bg-zinc-800 transition-all flex items-center gap-2"
        >
          <Download size={14} /> GERAR_RELATORIO
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0a0a0a] border border-white/10 rounded-[30px] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-serif font-black text-white uppercase italic">Novo Lançamento_</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Lançamento registrado com sucesso (Simulado)'); setIsModalOpen(false); }}>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Descrição / Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
                    <input type="text" placeholder="Ex: Aluguel, Produtos, Energia" className="w-full bg-black border border-[#222] rounded-xl px-12 py-3 text-white outline-none focus:border-primary transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Valor da Despesa (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
                    <input type="number" placeholder="0,00" className="w-full bg-black border border-[#222] rounded-xl px-12 py-3 text-white outline-none focus:border-primary transition-all" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-red-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-red-500/20">
                  Confirmar Saída de Caixa
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useState } from "react";
import { Menu, X, LayoutDashboard, Calendar, Scissors, Users, Wallet, TrendingUp, Monitor, Settings, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function MobileNav({ tenant, publicUrl }: { tenant: any, publicUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-black border-b border-[#151515] sticky top-0 z-[60]">
      <Link href="/admin" className="flex items-center gap-2">
         <h1 className="text-lg font-mono text-white font-bold tracking-tighter uppercase italic">/ZERØCUT</h1>
      </Link>

      <button onClick={() => setIsOpen(true)} className="p-2 text-zinc-400">
         <Menu size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="fixed inset-0 bg-black/95 z-[100] backdrop-blur-md"
            />
            <motion.div 
               initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
               className="fixed right-0 top-0 bottom-0 w-[80%] bg-[#080808] border-l border-white/5 z-[101] p-8 flex flex-col"
            >
               <div className="flex justify-between items-center mb-10">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">NAVEGAÇÃO_CONTROL</span>
                  <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-600"><X size={24} /></button>
               </div>

               <div className="flex-1 overflow-y-auto space-y-8">
                  <div className="space-y-4">
                     <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest border-b border-white/5 pb-2">Principal</p>
                     <MobileItem href="/admin" icon={<LayoutDashboard size={18}/>} label="INSIGHTS_CENTER" onClick={() => setIsOpen(false)} />
                     <MobileItem href="/admin/chat" icon={<MessageSquare size={18}/>} label="MENSAGENS" onClick={() => setIsOpen(false)} />
                  </div>
                  <div className="space-y-4">
                     <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest border-b border-white/5 pb-2">Operação</p>
                     <MobileItem href="/admin/agenda" icon={<Calendar size={18}/>} label="AGENDA_LIVE" onClick={() => setIsOpen(false)} />
                     <MobileItem href="/admin/clientes" icon={<Users size={18}/>} label="CRM_FIDELIDADE" onClick={() => setIsOpen(false)} />
                  </div>
                  <div className="space-y-4">
                     <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest border-b border-white/5 pb-2">Financeiro</p>
                     <MobileItem href="/admin/financeiro" icon={<Wallet size={18}/>} label="REVENUE_CAIXA" onClick={() => setIsOpen(false)} />
                  </div>
               </div>

               <div className="mt-auto border-t border-white/5 pt-8">
                  <Link 
                     href={publicUrl}
                     className="w-full bg-primary text-black font-black text-[10px] py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                     Ver Vitrine Pública
                  </Link>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileItem({ href, icon, label, onClick }: any) {
   return (
      <Link href={href} onClick={onClick} className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors">
         <span className="text-primary">{icon}</span>
         <span className="text-xs font-mono uppercase tracking-widest font-black leading-none">{label}</span>
      </Link>
   );
}

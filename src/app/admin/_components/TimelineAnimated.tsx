"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { finalizeAndPay } from "../financeiro/actions";
import CheckoutModal from "./CheckoutModal";

export function TimelineBlockAnimated({ 
  id, 
  tenantId,
  time, 
  client, 
  service, 
  price,
  status, 
  delay = 0 
}: any) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  async function handleFinalizeConfirm(
    method: 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO', 
    brand: string, 
    fee: number, 
    net: number
  ) {
    setIsUpdating(true);
    const result = await finalizeAndPay(
      id, 
      tenantId, 
      price, 
      method, 
      brand, 
      fee, 
      net
    );
    setIsUpdating(false);

    if (result?.error) {
       alert("Erro ao finalizar: " + result.error);
    } else {
       setIsCheckoutOpen(false);
    }
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        onClick={() => status !== 'COMPLETED' && setIsCheckoutOpen(true)}
        className={`flex flex-col md:flex-row bg-[#080808] border border-[#1a1a1a] hover:border-primary/50 transition-all rounded-lg overflow-hidden group cursor-pointer ${isUpdating ? 'opacity-50 pointer-events-none' : ''} ${status === 'COMPLETED' ? 'border-green-500/20 bg-green-500/[0.02]' : ''}`}
      >
        <div className={`bg-[#111] px-6 py-4 flex items-center justify-center border-r border-[#1a1a1a] group-hover:border-primary/30 transition-colors ${status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/20' : ''}`}>
          <span className={`font-mono font-bold text-lg ${status === 'COMPLETED' ? 'text-green-500' : 'text-primary'}`}>{time}</span>
        </div>
        
        <div className="flex-1 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
           <div>
              <h4 className={`font-serif tracking-wide ${status === 'COMPLETED' ? 'text-green-500/70 line-through' : 'text-white'}`}>{client}</h4>
              <p className="font-mono text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{service}</p>
           </div>

           <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded text-[10px] font-mono tracking-widest ${
                 status === 'WAITING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                 status === 'INCOMING' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                 status === 'COMPLETED' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                 [{status}]
              </span>
              {status === 'COMPLETED' ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <ChevronRight size={16} className="text-zinc-700 group-hover:text-primary transition-colors" />
              )}
           </div>
        </div>
      </motion.div>

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleFinalizeConfirm}
        amount={price}
        clientName={client}
      />
    </>
  );
}

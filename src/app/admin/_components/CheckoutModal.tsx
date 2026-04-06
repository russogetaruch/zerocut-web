"use client";

import { useState, useMemo } from "react";
import { X, CreditCard, Banknote, QrCode, Percent, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CARD_BRANDS = [
  { id: 'visa', name: 'Visa' },
  { id: 'mastercard', name: 'Mastercard' },
  { id: 'elo', name: 'Elo' },
  { id: 'amex', name: 'Amex' },
  { id: 'hipercard', name: 'Hipercard' },
  { id: 'outra', name: 'Outra' }
];

const DEFAULT_FEES = {
  PIX: 0,
  DINHEIRO: 0,
  DEBITO: 1.5,
  CREDITO: 3.0
};

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  amount, 
  clientName 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (method: any, brand: string, fee: number, net: number) => void,
  amount: number,
  clientName: string
}) {
  const [method, setMethod] = useState<'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO'>('PIX');
  const [brand, setBrand] = useState('visa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculadora de Taxas em tempo real
  const feeInfo = useMemo(() => {
    const rate = DEFAULT_FEES[method] || 0;
    const feeAmount = (amount * rate) / 100;
    const netAmount = amount - feeAmount;
    return { rate, feeAmount, netAmount };
  }, [method, amount]);

  async function handleConfirm() {
    setIsSubmitting(true);
    await onConfirm(method, (method === 'CREDITO' || method === 'DEBITO') ? brand : '', feeInfo.feeAmount, feeInfo.netAmount);
    setIsSubmitting(false);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="p-8 border-b border-[#151515] flex justify-between items-center bg-black/40">
             <div>
                <h3 className="text-xl font-serif font-black text-white uppercase tracking-tighter">Fechar Comanda</h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Cliente: {clientName}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500"><X size={20}/></button>
          </div>

          <div className="p-8 space-y-8">
             {/* Valor de Destaque */}
             <div className="text-center py-6 bg-primary/5 border border-primary/20 rounded-3xl">
                <p className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] mb-2 font-black">VALOR_BRUTO</p>
                <h4 className="text-5xl font-serif font-black text-white">R$ {amount.toFixed(2)}</h4>
             </div>

             {/* Seletor de Métodos */}
             <div className="grid grid-cols-2 gap-3">
                <MethodButton active={method === 'PIX'} onClick={() => setMethod('PIX')} icon={<QrCode size={18}/>} label="PIX" />
                <MethodButton active={method === 'DINHEIRO'} onClick={() => setMethod('DINHEIRO')} icon={<Banknote size={18}/>} label="DINHEIRO" />
                <MethodButton active={method === 'CREDITO'} onClick={() => setMethod('CREDITO')} icon={<CreditCard size={18}/>} label="CRÉDITO" />
                <MethodButton active={method === 'DEBITO'} onClick={() => setMethod('DEBITO')} icon={<Wallet size={18}/>} label="DÉBITO" />
             </div>

             {/* Picker de Bandeira (Apenas se for Cartão) */}
             <AnimatePresence>
                {(method === 'CREDITO' || method === 'DEBITO') && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                     <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">Selecionar Bandeira_</p>
                     <div className="grid grid-cols-3 gap-2">
                        {CARD_BRANDS.map(b => (
                          <button 
                            key={b.id} 
                            onClick={() => setBrand(b.id)}
                            className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase transition-all border ${brand === b.id ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-[#1a1a1a] hover:border-zinc-700'}`}
                          >
                            {b.name}
                          </button>
                        ))}
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>

             {/* Calculadora Resultante */}
             <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-zinc-500 font-mono uppercase tracking-widest flex items-center gap-2">
                     <Percent size={12}/> Taxa Maquininha ({feeInfo.rate.toFixed(1)}%)
                   </span>
                   <span className="text-red-500 font-mono font-bold">- R$ {feeInfo.feeAmount.toFixed(2)}</span>
                </div>
                <div className="h-px bg-[#151515] w-full" />
                <div className="flex justify-between items-center">
                   <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-[0.2em] font-black">LÍQUIDO_REAL</span>
                   <span className="text-2xl font-serif font-black text-green-500">R$ {feeInfo.netAmount.toFixed(2)}</span>
                </div>
             </div>

             <button 
               disabled={isSubmitting}
               onClick={handleConfirm}
               className="w-full bg-primary hover:bg-white text-black font-black py-5 rounded-[2rem] uppercase tracking-[0.3em] text-xs transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50"
             >
                {isSubmitting ? 'PROCESSANDO_CONEXÃO...' : 'CONFIRMAR_RECEBIMENTO'}
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function MethodButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${active ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' : 'bg-transparent border-[#1a1a1a] text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'}`}
    >
       {icon}
       <span className="text-[10px] font-mono font-black tracking-widest">{label}</span>
    </button>
  );
}

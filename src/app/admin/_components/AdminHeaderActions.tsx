"use client";

import { Star, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminHeaderActions({ tenantSlug, tenantName }: { tenantSlug: string, tenantName: string }) {
  const router = useRouter();

  const copyLoyaltyLink = () => {
    const link = `${window.location.origin}/b/${tenantSlug}/fidelidade`;
    navigator.clipboard.writeText(link);
    alert("Link do Clube VIP copiado! Agora é só mandar para o cliente.");
  };

  const goToNewBooking = () => {
    router.push("/admin/agenda?action=new");
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button 
        onClick={copyLoyaltyLink}
        className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-primary px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-primary/20 shadow-lg group"
      >
        <Star size={14} className="group-hover:scale-125 transition-transform fill-primary" /> 
        LINK_DO_CLUBE_VIP
      </button>
      
      <button 
        onClick={goToNewBooking}
        className="flex items-center gap-2 bg-primary hover:bg-white text-black px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(212,175,55,0.15)] active:scale-95 group"
      >
        <Plus size={14} className="group-hover:rotate-90 transition-transform" /> 
        Novo Agendamento
      </button>
    </div>
  );
}

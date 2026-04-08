"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const handleFilter = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams);
    if (start) params.set("startDate", start); else params.delete("startDate");
    if (end) params.set("endDate", end); else params.delete("endDate");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-[#0a0a0a] border border-[#1a1a1a] p-2 rounded-2xl shadow-xl">
      <div className="flex items-center gap-2 px-4 py-2 border-r border-[#1a1a1a]">
        <Calendar size={14} className="text-primary" />
        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Período_Análise</span>
      </div>
      
      <div className="flex items-center gap-3 px-4">
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => handleFilter(e.target.value, endDate)}
          className="bg-transparent text-white font-mono text-[10px] outline-none border-b border-zinc-800 focus:border-primary transition-colors py-1"
        />
        <span className="text-zinc-600 font-mono text-[10px]">até</span>
        <input 
          type="date" 
          value={endDate}
          onChange={(e) => handleFilter(startDate, e.target.value)}
          className="bg-transparent text-white font-mono text-[10px] outline-none border-b border-zinc-800 focus:border-primary transition-colors py-1"
        />
      </div>

      <button 
        onClick={() => {
          router.push(window.location.pathname);
        }}
        className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-500 hover:text-white rounded-xl transition-all uppercase tracking-widest"
      >
        Limpar
      </button>
    </div>
  );
}

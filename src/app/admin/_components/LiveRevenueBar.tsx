"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp } from "lucide-react";

export function LiveRevenueBar({ tenantId }: { tenantId: string }) {
  const [revenue, setRevenue] = useState(0);
  const supabase = createClient();

  // Load initial daily revenue
  useEffect(() => {
    async function loadDaily() {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const { data } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('tenant_id', tenantId)
        .gte('created_at', today.toISOString());

      if (data) {
        const total = data.reduce((acc, curr) => {
           if (curr.type === 'INCOME') return acc + Number(curr.amount);
           if (curr.type === 'EXPENSE') return acc - Number(curr.amount);
           return acc;
        }, 0);
        setRevenue(total);
      }
    }
    loadDaily();

    // Subscribe to new transactions
    const channel = supabase
       .channel(`revenue-${tenantId}`)
       .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `tenant_id=eq.${tenantId}`
       }, (payload) => {
          const newTx = payload.new;
          if (newTx.type === 'INCOME') {
             setRevenue(prev => prev + Number(newTx.amount));
          } else if (newTx.type === 'EXPENSE') {
             setRevenue(prev => prev - Number(newTx.amount));
          }
       })
       .subscribe();

    return () => {
       supabase.removeChannel(channel);
    }
  }, [tenantId, supabase]);

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 font-mono text-xs tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
      <TrendingUp size={14} className="animate-pulse" />
      <span>HOJE: </span>
      <span className="font-bold text-emerald-300">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue)}
      </span>
    </div>
  );
}

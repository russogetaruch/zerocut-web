"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast, { Toaster } from "react-hot-toast";

export function GlobalRealtimeProvider({ tenantId }: { tenantId: string }) {
  const supabase = createClient();

  useEffect(() => {
    if (!tenantId) return;

    // Supabase Real-time para Agendamentos do Lojista
    const channel = supabase
      .channel(`global-notifications-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          // Blink Tab
          const originalTitle = document.title;
          let isAlert = true;
          const intervalId = setInterval(() => {
            document.title = isAlert ? "🔥 Novo Agendamento!" : originalTitle;
            isAlert = !isAlert;
          }, 1000);
          
          setTimeout(() => {
            clearInterval(intervalId);
            document.title = originalTitle;
          }, 10000);

          // Play a generic beep (using browser Audio, though might be blocked if no user interaction, but works well for active dashboards)
          try {
            const audio = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3");
            audio.play().catch(() => {});
          } catch(e) {}
          
          toast.success("Novo agendamento recebido!", {
            icon: '🔥',
            style: {
               background: '#111',
               color: '#fff',
               border: '1px solid #333',
               fontFamily: 'monospace',
            },
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, supabase]);

  return <Toaster position="top-right" reverseOrder={false} />;
}

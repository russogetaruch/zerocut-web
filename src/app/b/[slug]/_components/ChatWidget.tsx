"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function ChatWidget({ tenantId }: { tenantId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null); // { id: string, name: string }
  const [clientName, setClientName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    // Escutando mensagens realtime
    if (chatSession?.id) {
       const channel = supabase.channel(`chat-${chatSession.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatSession.id}` }, (payload) => {
             setMessages((prev) => [...prev, payload.new]);
          })
          .subscribe();

       return () => {
          supabase.removeChannel(channel);
       };
    }
  }, [chatSession]);

  useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleStartChat() {
     if (!clientName) return;
     
     const { data, error } = await supabase.from('chats').insert([
        { tenant_id: tenantId, client_name: clientName }
     ]).select().single();

     if (!error && data) {
        setChatSession(data);
        // Mensagem inicial de boas vindas local (opcional)
        setMessages([{ id: 'welcome', sender_type: 'admin', content: `Olá ${clientName}! Como podemos ajudar?` }]);
     }
  }

  async function handleSendMessage(e: any) {
     e.preventDefault();
     if (!messageText.trim() || !chatSession) return;
     
     const text = messageText;
     setMessageText(""); // Limpa imediatamente o input
     
     // Enviar localmente otimista (opcional) e depois pro Supabase
     await supabase.from('messages').insert([
        { chat_id: chatSession.id, sender_type: 'client', content: text }
     ]);
  }

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 active:scale-95 transition-all z-40"
      >
         {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:right-6 w-[340px] h-[500px] max-h-[70vh] bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-40"
          >
             {/* Header */}
             <div className="bg-black p-4 border-b border-[#222] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                   <MessageSquare size={16} className="text-primary" />
                </div>
                <div>
                   <h4 className="font-serif font-bold text-white text-sm">Central de Ajuda</h4>
                   <p className="text-[10px] uppercase font-mono tracking-widest text-green-500 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse block"></span> Online
                   </p>
                </div>
             </div>

             {/* Dynamic Body */}
             {!chatSession ? (
                // Tela Inicial: Pede o Nome
                <div className="flex-1 bg-[#050505] flex flex-col justify-center items-center p-6 text-center">
                   <MessageSquare size={32} className="text-zinc-600 mb-4" />
                   <h3 className="text-white font-serif font-bold mb-2">Iniciar Conversa</h3>
                   <p className="text-xs text-zinc-500 mb-6">Como podemos te chamar?</p>
                   
                   <input 
                      type="text" 
                      placeholder="Seu nome..." 
                      className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 mb-4 text-sm text-white focus:outline-none focus:border-primary text-center"
                      onChange={(e) => setClientName(e.target.value)}
                   />
                   <button 
                      onClick={handleStartChat}
                      className="w-full bg-primary text-black font-bold uppercase tracking-widest text-xs py-3 rounded-xl disabled:opacity-50"
                      disabled={!clientName}
                   >
                      Começar Chat
                   </button>
                </div>
             ) : (
                // Tela de Mensagens
                <>
                   <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#050505]">
                      {messages.map((msg, idx) => (
                         <div key={msg.id || idx} className={`max-w-[85%] ${msg.sender_type === 'client' ? 'self-end' : 'self-start'}`}>
                            <div className={`${
                               msg.sender_type === 'client' 
                               ? 'bg-primary/10 text-primary border border-primary/30 rounded-2xl rounded-tr-sm' 
                               : 'bg-[#151515] text-zinc-300 border border-[#222] rounded-2xl rounded-tl-sm'
                            } p-3 text-sm`}>
                               {msg.content}
                            </div>
                         </div>
                      ))}
                      <div ref={messagesEndRef} />
                   </div>

                   {/* Input Base */}
                   <form onSubmit={handleSendMessage} className="p-3 bg-black border-t border-[#222]">
                      <div className="flex gap-2">
                         <input 
                            type="text" 
                            placeholder="Escreva aqui..." 
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            className="flex-1 bg-[#111] border border-[#333] rounded-full px-4 text-sm text-white focus:outline-none focus:border-primary transition-colors" 
                         />
                         <button type="submit" disabled={!messageText.trim()} className="w-10 h-10 rounded-full bg-primary disabled:bg-primary/50 flex items-center justify-center text-black flex-shrink-0 transition-colors">
                            <Send size={14} className="-ml-0.5" />
                         </button>
                      </div>
                   </form>
                </>
             )}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, Phone, Search, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminChatClient({ tenantId }: { tenantId: string }) {
  const supabase = createClient();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Carregar conversas da Barbearia local
    async function loadChats() {
       const { data } = await supabase.from('chats')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('last_message_at', { ascending: false });
       if (data) setChats(data);
    }
    loadChats();

    // 2. Escutar por novos clientes querendo bater papo!
    const channel = supabase.channel('admin-chats')
       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats', filter: `tenant_id=eq.${tenantId}` }, (payload) => {
          setChats(prev => [payload.new, ...prev]);
       })
       .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tenantId]);

  useEffect(() => {
    // Se selecionou um chat, carregar as msgs
    if (!activeChat) return;

    async function loadMessages() {
       const { data } = await supabase.from('messages')
          .select('*')
          .eq('chat_id', activeChat.id)
          .order('created_at', { ascending: true });
       if (data) setMessages(data);
    }
    loadMessages();

    // Escutar live-typing daquele chat específico
    const msgChannel = supabase.channel(`admin-msgs-${activeChat.id}`)
       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChat.id}` }, (payload) => {
          setMessages(prev => [...prev, payload.new]);
       })
       .subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [activeChat?.id]);

  useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage(e: any) {
     e.preventDefault();
     if (!inputText.trim() || !activeChat) return;
     
     const content = inputText;
     setInputText(""); // Clears fast

     await supabase.from('messages').insert([
        { chat_id: activeChat.id, sender_type: 'admin', content }
     ]);
     
     // Update last message timestamp
     await supabase.from('chats').update({ last_message_at: new Date().toISOString() }).eq('id', activeChat.id);
  }

  return (
    <div className="flex h-[80vh] border border-[#1a1a1a] rounded-xl bg-[#050505] overflow-hidden shadow-2xl">
      
      {/* Coluna da Esquerda: Lista de Chats */}
      <div className="w-1/3 border-r border-[#1a1a1a] flex flex-col bg-[#0a0a0a]">
         <div className="p-4 border-b border-[#1a1a1a]">
            <h2 className="font-mono text-xs text-primary uppercase tracking-widest mb-3">Interações Ao Vivo</h2>
            <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
               <input 
                 type="text" 
                 placeholder="Buscar cliente..." 
                 className="w-full bg-black border border-[#222] rounded-md py-2 pl-9 pr-3 text-sm text-zinc-300 focus:border-primary outline-none"
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat)}
                className={`p-4 border-b border-[#1a1a1a] flex gap-3 cursor-pointer hover:bg-[#111] transition-colors relative ${activeChat?.id === chat.id ? 'bg-[#151515]' : ''}`}
              >
                 {activeChat?.id === chat.id && <div className="absolute left-0 top-0 w-1 h-full bg-primary" />}
                 
                 <div className="relative flex-shrink-0">
                   <div className="w-10 h-10 rounded-full bg-black border border-[#222] flex items-center justify-center text-zinc-500">
                     <span className="font-serif text-white uppercase">{chat.client_name?.substring(0, 1)}</span>
                   </div>
                   <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black animate-pulse" />
                 </div>

                 <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1">
                       <h4 className="font-medium text-white text-sm truncate">{chat.client_name}</h4>
                       <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">Live</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">Clique para visualizar a troca...</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Coluna da Direita: Janela de Chat */}
      <div className="w-2/3 flex flex-col bg-black relative">
         {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
               <Send size={32} className="mb-4 opacity-30" />
               <p className="font-mono text-sm tracking-widest uppercase">MÓDULO DE CHAT ATIVADO</p>
               <p className="text-xs text-zinc-500 mt-2">Aguardando sinais dos clientes...</p>
            </div>
         ) : (
            <>
               {/* Chat Header */}
               <div className="h-16 flex items-center justify-between px-6 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif font-bold uppercase border border-primary/30">
                        {activeChat.client_name?.substring(0, 1)}
                     </div>
                     <div>
                        <h3 className="font-medium text-white text-sm">{activeChat.client_name}</h3>
                        <p className="text-[10px] text-green-500 font-mono tracking-widest uppercase flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> Online no Site
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-4 text-zinc-400">
                     <button className="hover:text-primary transition-colors"><MoreVertical size={16} /></button>
                  </div>
               </div>

               {/* Messages Area */}
               <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                  {messages.map((msg, idx) => (
                     <div key={msg.id || idx} className={`max-w-[70%] ${msg.sender_type === 'admin' ? 'self-end' : 'self-start'}`}>
                        {msg.sender_type === 'admin' ? (
                           <div className="bg-primary/10 border border-primary/30 text-primary p-3 rounded-2xl rounded-tr-sm text-sm shadow-md">
                              {msg.content}
                           </div>
                        ) : (
                           <div className="bg-[#111] border border-[#222] text-zinc-300 p-3 rounded-2xl rounded-tl-sm text-sm shadow-md">
                              {msg.content}
                           </div>
                        )}
                     </div>
                  ))}
                  <div ref={messagesEndRef} />
               </div>

               {/* Input Area */}
               <form onSubmit={handleSendMessage} className="p-4 bg-[#0a0a0a] border-t border-[#1a1a1a]">
                  <div className="flex items-center gap-2">
                     <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Responder ao cliente..." 
                        className="flex-1 bg-black border border-[#222] rounded-full py-3 px-5 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                     />
                     <button type="submit" disabled={!inputText.trim()} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black disabled:bg-primary/50 hover:bg-primary/80 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        <Send size={16} className="-ml-1" />
                     </button>
                  </div>
               </form>
            </>
         )}
      </div>

    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createTenant } from "../actions";

export default function TenantFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg("");
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const result = await createTenant({ name, slug });
    
    if (result.error) {
       setErrorMsg(result.error);
       setLoading(false);
    } else {
       setIsOpen(false);
       setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 flex items-center gap-2">
         <Plus size={16} /> Nova Unidade
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-surface w-full max-w-md rounded-2xl border border-[#331D1D] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-[#331D1D]">
                 <h3 className="text-white font-medium">Cadastrar Nova Barbearia</h3>
                 <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
              </div>

              <form action={handleSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm text-zinc-400 mb-1">Nome da Barbearia</label>
                    <input name="name" required className="w-full bg-black border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary" placeholder="Ex: Cortes do Zé" />
                 </div>
                 
                 <div>
                    <label className="block text-sm text-zinc-400 mb-1">Endereço (Slug) na Internet</label>
                    <div className="flex bg-black border border-border rounded-xl overflow-hidden focus-within:border-primary">
                       <span className="bg-[#111] px-3 py-2 text-zinc-500 text-sm flex items-center border-r border-border">/b/</span>
                       <input name="slug" required className="w-full bg-transparent px-3 py-2 text-primary outline-none" placeholder="cortesze" />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">O link ficará: meusite.com/b/cortesze</p>
                 </div>

                 {errorMsg && <p className="text-red-400 text-sm bg-red-400/10 p-2 rounded-lg">{errorMsg}</p>}

                 <button disabled={loading} className="w-full mt-4 bg-primary text-black font-bold py-3 rounded-xl disabled:opacity-50">
                    {loading ? "Criando..." : "Finalizar Cadastro"}
                 </button>
              </form>
           </div>
        </div>
      )}
    </>
  );
}

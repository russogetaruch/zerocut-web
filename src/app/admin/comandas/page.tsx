import { Tag, Search, Plus, MoreHorizontal } from "lucide-react";

export default function ComandasAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white">Gestão de Comandas</h2>
          <p className="text-zinc-400">Controle pagamentos, consumos e serviços concluídos.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2">
          <Plus size={18} /> Nova Comanda
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 flex gap-4 overflow-x-auto">
         <div className="min-w-64 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
              <input type="text" placeholder="Buscar cliente ou comanda..." className="w-full bg-black border border-border rounded-xl pl-10 pr-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
         </div>
         <div className="flex bg-black border border-border rounded-xl overflow-hidden p-1">
           <button className="px-4 py-1.5 text-black bg-primary rounded-lg text-sm font-medium">Abertas</button>
           <button className="px-4 py-1.5 text-zinc-400 bg-transparent rounded-lg text-sm font-medium">Pagas</button>
           <button className="px-4 py-1.5 text-zinc-400 bg-transparent rounded-lg text-sm font-medium">Fiado</button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ComandaCard id="#2098" client="Vinicius Andrade" service="Corte Clássico" prof="Carlos Silva" time="14:30" amount="R$ 45,00" status="aberta" />
        <ComandaCard id="#2099" client="Roberto Carlos" service="Combo Barba + Corte" prof="Marcos Antônio" time="15:00" amount="R$ 70,00" status="aberta" />
        <ComandaCard id="#2100" client="João Souza" service="Pézinho + Produto" prof="Carlos Silva" time="15:45" amount="R$ 65,00" status="aberta" />
      </div>
    </div>
  );
}

function ComandaCard({ id, client, service, prof, time, amount, status }: any) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/50 transition-colors group relative cursor-pointer">
       <div className="flex justify-between items-start mb-4">
         <div>
            <span className="text-xs text-zinc-500 font-mono bg-black px-2 py-1 rounded border border-[#222]">{id}</span>
            <h3 className="font-bold text-white text-lg mt-2">{client}</h3>
            <p className="text-sm text-zinc-400 mt-1">{service}</p>
         </div>
         <button className="p-1 text-zinc-500 hover:text-white"><MoreHorizontal size={20} /></button>
       </div>
       
       <div className="pt-4 border-t border-[#222] flex justify-between items-end">
         <div>
            <p className="text-xs text-zinc-500">Profissional: <span className="text-zinc-300">{prof}</span></p>
            <p className="text-xs text-zinc-500 mt-0.5">Criada às: <span className="text-zinc-300">{time}</span></p>
         </div>
         <div className="text-right">
            <p className="font-bold text-primary text-xl">{amount}</p>
         </div>
       </div>

       <button className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2 rounded-lg font-medium text-sm transition-colors">
         Finalizar / Receber Pagamento
       </button>
    </div>
  );
}

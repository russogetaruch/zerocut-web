import { ReactNode } from "react";
import { CopyPlus, Activity, TrendingUp, Settings, LogOut, Grid, Users, CreditCard } from "lucide-react";
import Link from "next/link";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row font-sans text-zinc-300">
      {/* Sidebar Desktop - Tech Minimalist */}
      <aside className="hidden md:flex w-64 flex-col bg-black border-r border-[#151515] h-screen sticky top-0 relative z-20">
        
        {/* Logo Area */}
        <div className="p-8 border-b border-[#151515] flex flex-col gap-1">
          <Link href="/super-admin" className="group flex flex-col">
            <h1 className="text-xl font-mono text-white font-bold tracking-[0.2em] transition-all group-hover:text-primary">
              <span className="text-primary mr-2">/</span>VITTALIX
            </h1>
            <p className="text-[10px] text-zinc-600 font-mono tracking-widest mt-2 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/70 animate-pulse"></span>
              System.Master
            </p>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 relative">
          
          {/* DASHBOARD MASTER */}
          <div className="space-y-2">
            <h4 className="px-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Monitoramento</h4>
            <NavItem href="/super-admin" icon={<Activity size={16} />} label="VISÃO GERAL" active={true} />
          </div>

          {/* GESTÃO DE REDE */}
          <div className="space-y-2">
            <h4 className="px-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Infraestrutura</h4>
            <NavItem href="/super-admin/tenants" icon={<Grid size={16} />} label="REDE DE UNIDADES" />
            <NavItem href="/super-admin/users" icon={<Users size={16} />} label="CONTAS E ACESSOS" />
          </div>

          {/* SAAS & BILLING */}
          <div className="space-y-2">
            <h4 className="px-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Receita Recorrente</h4>
            <NavItem href="/super-admin/assinaturas" icon={<TrendingUp size={16} />} label="MRR E FATURAMENTO" />
            <NavItem href="/super-admin/planos" icon={<CreditCard size={16} />} label="PLANOS E MÓDULOS" />
          </div>

          {/* PLATAFORMA */}
          <div className="space-y-2">
            <h4 className="px-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Sistema</h4>
            <NavItem href="/super-admin/config" icon={<Settings size={16} />} label="CONFIG. SISTEMA" />
          </div>

        </nav>

        {/* Footer Area */}
        <div className="p-6 border-t border-[#151515]">
          <button className="flex items-center gap-3 w-full p-3 rounded-md text-zinc-500 hover:text-white hover:bg-[#111] border border-transparent hover:border-[#222] transition-all text-xs font-mono tracking-wider">
            <LogOut size={16} />
            [ SESSION.CLOSE ]
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative bg-[#050505] min-h-screen border-l border-[#111]">
        {/* Grid pattern background subtlety */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
        
        <div className="p-6 md:p-12 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all text-xs font-mono tracking-wider border relative overflow-hidden group ${active ? 'text-white border-[#222] bg-[#0a0a0a]' : 'text-zinc-500 border-transparent hover:border-[#1a1a1a] hover:text-zinc-300 hover:bg-[#0a0a0a]'}`}>
      <span className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all ${active ? 'bg-primary' : 'bg-transparent group-hover:bg-zinc-800'}`}></span>
      <span className={`${active ? 'text-primary' : 'text-zinc-600'} transition-colors`}>{icon}</span>
      {label}
    </Link>
  );
}

import { ReactNode } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  Activity, 
  MessageSquare, 
  Calendar, 
  Settings,
  Wallet,
  TrendingUp,
  Hash,
  LogOut,
  Bell,
  Search,
  Database,
  DollarSign,
  Monitor,
  Globe
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlobalRealtimeProvider } from "./_components/GlobalRealtimeProvider";
import { LiveRevenueBar } from "./_components/LiveRevenueBar";
import { AdminSidebarActions } from "./_components/AdminSidebarActions";
import { MobileNav } from "./_components/MobileNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Buscar o tenant deste dono de barbearia
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, name')
    .eq('owner_id', user.id)
    .single();

  // Fallback se não encontrar tenant (para super_admin ou erro de setup)
  const publicUrl = tenant ? `/b/${tenant.slug}` : "/";

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row font-sans text-zinc-300">
      <GlobalRealtimeProvider tenantId={tenant?.id || ""} />
      
      {/* Mobile Top Nav */}
      <MobileNav tenant={tenant} publicUrl={publicUrl} />

      {/* Sidebar Lojista - Tech Minimalist */}
      <aside className="hidden md:flex w-64 flex-col bg-black border-r border-[#151515] h-screen sticky top-0 relative z-20">
        
        {/* Logo Area */}
        <div className="p-8 border-b border-[#151515] flex flex-col gap-1">
          <Link href={publicUrl} target="_blank" className="group flex flex-col">
            <h1 className="text-xl font-mono text-white font-bold tracking-[0.2em] transition-all group-hover:text-primary">
              <span className="text-primary mr-2">/</span>ZERØCUT
            </h1>
            <p className="text-[10px] text-zinc-600 font-mono tracking-widest mt-2 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/70 animate-pulse"></span>
              {tenant?.name || "Espaço"}
            </p>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 relative">
          
          {/* GRUPO 1: DASHBOARD & FEEDBACK */}
          <div className="space-y-2">
            <h4 className="px-4 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3 font-black">/DASHBOARD_&_SOCIAL</h4>
            <NavItem href="/admin" icon={<LayoutDashboard size={14} />} label="INSIGHTS_CENTER" />
            <NavItem href="/admin/chat" icon={<MessageSquare size={14} />} label="MESSAGEM_HUB" />
          </div>

          {/* GRUPO 2: OPERAÇÕES DIÁRIAS */}
          <div className="space-y-2">
            <h4 className="px-4 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3 font-black">/OPERAÇÕES</h4>
            <NavItem href="/admin/agenda" icon={<Calendar size={14} />} label="AGENDA_LIVE" />
            <NavItem href="/admin/servicos" icon={<Scissors size={14} />} label="CATÁLOGO_SERVIÇOS" />
            <NavItem href="/admin/profissionais" icon={<Users size={14} />} label="EQUIPE_BARBEIROS" />
            <NavItem href="/admin/clientes" icon={<Users size={14} />} label="CRM_FIDELIDADE" />
          </div>

          {/* GRUPO 3: FINANCEIRO & BI */}
          <div className="space-y-2">
            <h4 className="px-4 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3 font-black">/FINANCEIRO_BI</h4>
            <NavItem href="/admin/financeiro" icon={<Wallet size={14} />} label="REVENUE_CAIXA" />
            <NavItem href="/admin/vendas" icon={<TrendingUp size={14} />} label="PERFORMANCE_HUB" />
          </div>

          {/* GRUPO 4: ESTRATÉGIA & SITE */}
          <div className="space-y-2">
            <h4 className="px-4 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3 font-black">/PRESENÇA_SITE</h4>
            <NavItem href="/admin/vitrine" icon={<Monitor size={14} />} label="EDITAR_VITRINE" />
            <NavItem href="/admin/configuracoes" icon={<Settings size={14} />} label="CONFIGURAÇÕES" />
          </div>

          {/* QUICK ACTION CARD */}
          <div className="px-4 pt-4">
             <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex flex-col items-center text-center shadow-2xl">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                   <DollarSign size={16} className="text-primary" />
                </div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 leading-tight font-black">QUICK_CHECKOUT</p>
                <Link 
                  href="/admin/agenda?action=checkout"
                  className="w-full bg-primary text-black font-black text-[10px] py-3 rounded-xl hover:scale-105 transition-transform uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                   Finalizar Agora
                </Link>
             </div>
          </div>

        </nav>

        <AdminSidebarActions publicUrl={publicUrl} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full relative bg-[#050505] min-h-screen border-l border-[#111]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
        
        {/* Painel Global Top-Right */}
        <div className="absolute top-6 right-6 md:right-12 z-50">
           <LiveRevenueBar tenantId={tenant?.id || ""} />
        </div>

        <div className="p-6 md:p-12 pt-24 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active = false, target }: { href: string; icon: ReactNode; label: string; active?: boolean; target?: string }) {
  return (
    <Link 
      href={href} 
      target={target}
      className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all text-xs font-mono tracking-wider border relative overflow-hidden group ${active ? 'text-white border-[#222] bg-[#0a0a0a]' : 'text-zinc-500 border-transparent hover:border-[#1a1a1a] hover:text-zinc-300 hover:bg-[#0a0a0a]'}`}
    >
      <span className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all ${active ? 'bg-primary' : 'bg-transparent group-hover:bg-zinc-800'}`}></span>
      <span className={`${active ? 'text-primary' : 'text-zinc-600'} transition-colors`}>{icon}</span>
      {label}
    </Link>
  );
}

"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { Link as LinkIcon, ExternalLink, Settings, Power, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toggleTenantStatus } from "../actions";

interface Tenant {
  id: string;
  slug: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVars = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 120 } },
};

export default function TenantListAnimated({ tenants }: { tenants: Tenant[] }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
       await toggleTenantStatus(id, current);
    });
  };

  if (!tenants || tenants.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border border-dashed border-[#222] rounded-lg mt-6 bg-[#050505]">
        <ShieldAlert size={32} className="text-zinc-800 mb-4" />
        <p className="text-zinc-600 font-mono text-sm tracking-wider uppercase">[ NO_RECORDS_FOUND ]</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVars} 
      initial="hidden" 
      animate="show" 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-6"
    >
      {tenants.map((tenant) => (
        <motion.div 
          variants={itemVars} 
          key={tenant.id} 
          className={`group relative bg-[#0a0a0a] border ${tenant.is_active ? 'border-[#1a1a1a] shadow-lg shadow-black' : 'border-red-900/30 bg-red-900/5'} hover:border-[#333] transition-all rounded-[2rem] overflow-hidden flex flex-col h-full`}
        >
          {/* Accent Top Line */}
          <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${tenant.is_active ? 'via-primary group-hover:via-white' : 'via-red-500'} to-transparent opacity-30 transition-colors`}></div>

          <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-white font-serif font-black text-xl truncate pr-2 uppercase tracking-tight">{tenant.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${tenant.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold ${tenant.is_active ? 'text-zinc-500' : 'text-red-500'}`}>
                    {tenant.is_active ? 'SYSTEM_ONLINE' : 'SYS_SUSPENDED'}
                  </span>
                </div>
              </div>
              <div className="bg-[#111] p-3 rounded-2xl border border-[#1a1a1a] group-hover:bg-[#151515] transition-colors">
                <LinkIcon size={16} className="text-zinc-600 group-hover:text-primary transition-colors" />
              </div>
            </div>

            <div className="mt-auto space-y-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              <div className="flex justify-between border-b border-[#1a1a1a] pb-3">
                <span className="text-zinc-600">CLUSTER_ADDR</span>
                <span className="text-zinc-300">/b/{tenant.slug}</span>
              </div>
              <div className="flex justify-between border-b border-[#1a1a1a] pb-3">
                <span className="text-zinc-600">UPTIME_SINCE</span>
                <span className="text-zinc-300">{new Date(tenant.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-zinc-600">SLA_STATUS</span>
                <span className={tenant.is_active ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                  {tenant.is_active ? '100% OPERARIONAL' : 'DISABLED'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-[#1a1a1a] bg-[#070707] flex gap-3">
            <Link 
              href={`/b/${tenant.slug}`} 
              target="_blank" 
              className="flex-1 py-3 rounded-2xl text-center font-mono text-[11px] font-black text-black bg-white hover:bg-primary transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              VISIT_NODE <ExternalLink size={14}/>
            </Link>
            
            <button 
              onClick={() => handleToggle(tenant.id, tenant.is_active)}
              disabled={isPending}
              className={`p-3 rounded-2xl border transition-all active:scale-90 ${tenant.is_active ? 'border-[#222] text-zinc-400 hover:text-red-500 hover:border-red-500/30' : 'border-red-500 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white'}`}
              title={tenant.is_active ? "Suspender Acesso" : "Ativar Barbearia"}
            >
              <Power size={18} className={isPending ? 'animate-spin' : ''} />
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

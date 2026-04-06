import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-zinc-300 relative overflow-hidden">
      {/* Elementos visuais de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
      
      <div className="flex flex-col items-center text-center p-8 border border-[#1a1a1a] rounded-2xl bg-[#050505] relative z-10 max-w-md w-full shadow-2xl">
        <AlertCircle size={48} className="text-amber-500 mb-6" />
        
        <h1 className="text-5xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl text-primary tracking-widest uppercase mb-4">Módulo Offline</h2>
        
        <p className="text-zinc-500 text-sm mb-8">
          A área que você tentou acessar ainda está na prancheta espacial de desenvolvimento da ZERØCUT. Em breve ativaremos essa aba.
        </p>

        <Link href="/" className="px-6 py-3 bg-[#111] border border-[#222] hover:border-primary hover:text-primary transition-all text-xs tracking-widest uppercase rounded">
          [ RETORNAR À BASE ]
        </Link>
      </div>
    </div>
  );
}

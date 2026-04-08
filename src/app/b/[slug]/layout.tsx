import { ReactNode } from "react";

export default async function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] selection:bg-primary selection:text-black antialiased">
      {/* 
          O Layout aqui deve ser mínimo para não quebrar a imersão das vitrines. 
          Deixamos o controle total de design para a Page.
      */}
      <main className="w-full min-h-screen">
        {children}
      </main>
    </div>
  );
}

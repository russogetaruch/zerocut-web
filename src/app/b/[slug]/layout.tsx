export default function TenantLayout({ children, params }: { children: React.ReactNode, params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-serif font-bold text-xl text-primary">Barbearia VIP</div>
          <button className="text-sm font-medium hover:text-primary transition-colors">Entrar</button>
        </div>
      </header>
      <main className="pt-16 max-w-4xl mx-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}

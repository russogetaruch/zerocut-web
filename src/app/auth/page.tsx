"use client";

import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { login } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-zinc-500 font-mono text-xs uppercase tracking-widest">Carregando_Gateway...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setErrorMsg("");
    
    // Server Action
    const result = await login(formData, next);
    
    if (result?.error) {
      setErrorMsg(`Erro Supabase: ${result.error}`);
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-primary font-bold tracking-tight">ZERØCUT</h1>
          <p className="text-zinc-400 mt-3 text-sm">Entre na sua conta para gerenciar seus negócios.</p>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full bg-black border border-border rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                  Senha
                </label>
                <Link href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black border border-border rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all pr-10"
                />
                <Lock size={16} className="absolute right-3 top-3.5 text-zinc-500" />
              </div>
            </div>

            {errorMsg && (
               <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                  {errorMsg}
               </div>
            )}

            <button disabled={isPending} type="submit" className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-black font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group">
              {isPending ? "Autenticando..." : "Entrar ZERØCUT"}
              {!isPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            Ainda não tem barbearia cadastrada? <br/>
            <Link href="#" className="text-primary hover:underline font-medium">Converse com nossos especialistas</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

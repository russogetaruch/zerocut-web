"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData, nextUrl?: string | null) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword(data);

  if (authError || !authData.user) {
    return { error: authError?.message || "Erro na autenticação" };
  }

  // 1. Buscar Perfil (Decision Matrix)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    console.error("Erro ao buscar perfil:", profileError);
    // Fallback: Redireciona para o admin se não encontrar perfil
    redirect("/admin");
  }

  // 2. Redirecionamento Inteligente
  if (profile.role === 'super_admin') {
    redirect("/super-admin");
  }
  
  if (profile.role === 'client') {
    // Para clientes, respeita o deep linking (ex: voltar para a barbearia onde estava)
    redirect(nextUrl || "/");
  }

  // Padrão para donos de barbearia (admin)
  redirect("/admin");
}

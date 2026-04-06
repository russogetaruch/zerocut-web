import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          } catch {
             // Ignora erros na edge
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Redirecionamento de usuários não logados
  if (!user && (path.startsWith("/admin") || path.startsWith("/super-admin"))) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("next", path); // Mantém o contexto para o redirecionamento pós-login
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Validação de Role (RBAC)
  if (user) {
    // Buscar perfil no banco
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Se tenta entrar em /super-admin e não é super_admin
    if (path.startsWith("/super-admin") && profile?.role !== 'super_admin') {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Se tenta entrar em /admin e é um cliente
    if (path.startsWith("/admin") && profile?.role === 'client') {
       return NextResponse.redirect(new URL("/", request.url));
    }

    // Se ja esta logado e tenta acessar a pagina de auth, jogar pro painel certo
    if (path === "/auth") {
      const target = profile?.role === 'super_admin' ? '/super-admin' : '/admin';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/super-admin/:path*",
    "/auth"
  ]
};

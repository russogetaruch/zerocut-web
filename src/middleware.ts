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

  const path = request.nextUrl.pathname;

  // 1. Cross-Session Persistence (Deep Linking & Cookie)
  if (path.startsWith("/b/")) {
    const pathParts = path.split("/");
    const slug = pathParts[2]; // /b/[slug]
    if (slug) {
      // Lembra a barbearia por 90 dias
      response.cookies.set("zc_last_tenant_slug", slug, { maxAge: 60 * 60 * 24 * 90, path: '/' });
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Redirecionamento Root ("/" Landing Page -> Lojista Salvo)
  if (path === "/") {
    const lastSlug = request.cookies.get("zc_last_tenant_slug")?.value;
    
    if (lastSlug) {
      if (!user) {
        // Visitante não logado, mas tem cookie -> Vai direto pra barbearia
        return NextResponse.redirect(new URL(`/b/${lastSlug}`, request.url));
      } else {
        // Está logado. Vamos classificar.
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role === 'client') {
          return NextResponse.redirect(new URL(`/b/${lastSlug}`, request.url));
        } else if (profile?.role === 'super_admin') {
          return NextResponse.redirect(new URL("/super-admin", request.url));
        } else {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
    } else if (user) {
        // Logado sem cookie. Joga pro painel correto.
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role === 'super_admin') return NextResponse.redirect(new URL("/super-admin", request.url));
        if (profile?.role === 'barber' || profile?.role === 'manager') return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 3. Redirecionamento de usuários não logados das rotas privadas
  if (!user && (path.startsWith("/admin") || path.startsWith("/super-admin"))) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("next", path); // Mantém o contexto para o redirecionamento pós-login
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Validação de Role (RBAC) nas rotas privadas
  if (user && (path.startsWith("/admin") || path.startsWith("/super-admin") || path === "/auth")) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (path.startsWith("/super-admin") && profile?.role !== 'super_admin') {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (path.startsWith("/admin") && profile?.role === 'client') {
       return NextResponse.redirect(new URL("/", request.url));
    }

    if (path === "/auth") {
      const target = profile?.role === 'super_admin' ? '/super-admin' : '/admin';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/b/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    "/auth"
  ]
};

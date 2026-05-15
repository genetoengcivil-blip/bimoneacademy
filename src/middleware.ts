import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Inicializa o cliente do Supabase para o Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Recupera o usuário atual
  const { data: { user } } = await supabase.auth.getUser()

  // Define quais rotas precisam de login
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/plataforma') || request.nextUrl.pathname.startsWith('/admin')

  // Se a rota for protegida e não houver usuário, joga para o login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se o usuário já estiver logado e tentar acessar a tela de login, joga para a plataforma
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/plataforma', request.url))
  }

  return response
}

// Configuração para ignorar arquivos estáticos e imagens no middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
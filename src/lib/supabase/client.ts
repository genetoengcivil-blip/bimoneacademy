import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Cria o cliente do Supabase utilizando as variáveis de ambiente
  // que você configurará no arquivo .env.local posteriormente.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
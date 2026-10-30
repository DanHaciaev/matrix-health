import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_KEY, SUPABASE_URL } from './env'

// Клиент с сессией администратора (читает cookies — только внутри админки).
export async function createSupabaseServer() {
  const store = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return store.getAll()
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // Вызов из Server Component: cookies обновит proxy.ts
        }
      },
    },
  })
}

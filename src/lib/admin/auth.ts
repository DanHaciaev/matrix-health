import 'server-only'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { cache } from 'react'
import { isSupabaseConfigured } from '../supabase/env'
import { createSupabaseServer } from '../supabase/server'

/** Текущий пользователь и его права. Один запрос к Supabase на рендер. */
export const getAdmin = cache(async () => {
  // Всегда по запросу — даже если сборка шла без .env
  await connection()
  if (!isSupabaseConfigured) return null

  const sb = await createSupabaseServer()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null

  const { data: isAdmin } = await sb.rpc('is_admin')
  return { sb, user, isAdmin: Boolean(isAdmin) }
})

/** Для страниц и server actions админки: пускает только администраторов. */
export async function requireAdmin() {
  const admin = await getAdmin()
  if (!admin) redirect('/admin/login')
  if (!admin.isAdmin) redirect('/admin/login?error=forbidden')
  return admin
}

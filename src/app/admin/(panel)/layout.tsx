import Link from 'next/link'
import { AdminNav } from '@/components/admin/admin-nav'
import { IconExternal, IconLogout } from '@/components/icons'
import { logout } from '@/lib/admin/actions'
import { requireAdmin } from '@/lib/admin/auth'
import { getSettings } from '@/lib/data'

// Вход в панель (после логина) ждёт проверки сессии — это нормально.
// Переходы между страницами внутри панели мгновенные: у каждой страницы свой loading.tsx.
export const instant = false

export default async function PanelLayout({ children }: LayoutProps<'/admin'>) {
  const { sb, user } = await requireAdmin()
  const [{ count }, settings] = await Promise.all([
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    getSettings(),
  ])

  const footer = (
    <div className="space-y-0.5">
      <Link href="/" target="_blank" className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-ink-2 hover:bg-sand">
        <IconExternal size={16} /> Открыть сайт
      </Link>
      <form action={logout}>
        <button type="submit" className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm text-ink-2 hover:bg-sand">
          <IconLogout size={16} /> Выйти
        </button>
      </form>
      <p className="truncate px-3 pt-2 text-xs text-mute">{user.email}</p>
    </div>
  )

  return (
    <div className="lg:flex">
      <AdminNav newOrders={count ?? 0} storeName={settings.store_name} footer={footer} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  )
}

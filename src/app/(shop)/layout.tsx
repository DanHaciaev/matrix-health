import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export default function ShopLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      {!isSupabaseConfigured && (
        <p className="bg-signal px-4 py-2 text-center text-sm text-white">
          База данных не подключена: заполните <code className="font-mono">.env.local</code> и перезапустите сервер
          (см. README).
        </p>
      )}
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

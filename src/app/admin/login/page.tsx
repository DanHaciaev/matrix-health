import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdmin } from '@/lib/admin/auth'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { LoginForm } from './login-form'

export const metadata = { title: 'Вход' }

// Страница входа проверяет сессию до отрисовки — мгновенность здесь не нужна
export const instant = false

export default async function LoginPage(props: PageProps<'/admin/login'>) {
  const { error, next } = await props.searchParams
  const admin = await getAdmin()
  if (admin?.isAdmin) redirect('/admin')

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col justify-between bg-brand p-8 text-white lg:p-12">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← На сайт
        </Link>
        <div className="py-16">
          <p className="text-5xl font-bold tracking-[-0.03em]">Админка</p>
          <p className="mt-4 max-w-sm text-white/60">Заказы, товары, сертификаты и настройки магазина.</p>
        </div>
        <p className="hidden text-xs text-white/40 lg:block">Доступ только для сотрудников</p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Вход</h1>

          {!isSupabaseConfigured && (
            <div className="mt-5 rounded-md border border-signal/30 bg-signal-soft px-4 py-3 text-sm leading-relaxed text-ink-2">
              <b className="text-signal">Supabase не подключён.</b> Заполните <code className="font-mono">.env.local</code> по
              образцу <code className="font-mono">.env.example</code> и перезапустите сервер. Подробности — в README.
            </div>
          )}
          {error === 'forbidden' && (
            <p className="mt-5 rounded-md bg-signal-soft px-4 py-3 text-sm text-signal">
              У вашего аккаунта нет прав администратора.
            </p>
          )}

          <LoginForm next={typeof next === 'string' ? next : ''} />
        </div>
      </div>
    </div>
  )
}

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { startTransition, useEffect } from 'react'

// Страницы, где новые заказы и заявки должны появляться сами, без перехода по меню.
// На страницах с формами (товары, настройки) не обновляем — чтобы не мешать вводу.
const LIVE = ['/admin/orders', '/admin/requests']

/**
 * Тихо перезагружает данные страницы: каждые несколько секунд, пока вкладка открыта,
 * и сразу при возвращении на вкладку. Счётчики новых заказов и заявок в меню обновляются вместе с ней.
 */
export function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const live = pathname === '/admin' || LIVE.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (!live) return
    const tick = () => {
      if (document.visibilityState === 'visible') startTransition(() => router.refresh())
    }
    const id = window.setInterval(tick, seconds * 1000)
    window.addEventListener('focus', tick)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', tick)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [live, router, seconds])

  return null
}

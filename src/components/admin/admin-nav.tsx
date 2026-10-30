'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { IconBox, IconClose, IconFile, IconGrid, IconMenu, IconReceipt, IconSettings, IconTag } from '../icons'

const ITEMS = [
  { href: '/admin', label: 'Обзор', icon: IconGrid },
  { href: '/admin/orders', label: 'Заказы', icon: IconReceipt, badge: 'orders' },
  { href: '/admin/products', label: 'Товары', icon: IconBox },
  { href: '/admin/certificates', label: 'Сертификаты', icon: IconFile },
  { href: '/admin/categories', label: 'Категории', icon: IconTag },
  { href: '/admin/settings', label: 'Настройки', icon: IconSettings },
] as const

export function AdminNav({ newOrders, storeName, footer }: { newOrders: number; storeName: string; footer: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href))

  const links = (
    <nav className="flex flex-col gap-0.5 p-3">
      {ITEMS.map(({ href, label, icon: Icon, ...rest }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`flex h-10 items-center gap-3 rounded-md px-3 text-[15px] transition-colors ${
            isActive(href) ? 'bg-ink text-white' : 'text-ink-2 hover:bg-sand hover:text-ink'
          }`}
        >
          <Icon size={18} />
          <span className="flex-1">{label}</span>
          {'badge' in rest && newOrders > 0 && (
            <span className="rounded-sm bg-signal px-1.5 font-mono text-xs leading-5 text-white">{newOrders}</span>
          )}
        </Link>
      ))}
    </nav>
  )

  return (
    <>
      {/* Мобильная шапка */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <span className="font-semibold">{storeName}</span>
        <button type="button" onClick={() => setOpen(true)} className="relative flex size-10 items-center justify-center rounded-md hover:bg-sand" aria-label="Меню">
          <IconMenu size={20} />
          {newOrders > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-signal" />}
        </button>
      </div>

      {/* Боковая панель */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line px-6">
          <span className="truncate font-semibold">{storeName}</span>
        </div>
        {links}
        <div className="mt-auto border-t border-line p-3">{footer}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Закрыть" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <span className="font-semibold">{storeName}</span>
              <button type="button" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center" aria-label="Закрыть">
                <IconClose size={20} />
              </button>
            </div>
            {links}
            <div className="mt-auto border-t border-line p-3">{footer}</div>
          </div>
        </div>
      )}
    </>
  )
}

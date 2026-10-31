'use client'

import Form from 'next/form'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { useI18n } from '@/i18n/client'
import { IconClose, IconMenu, IconSearch } from './icons'
import { input } from './ui'

type NavItem = { href: string; label: string }

export function MobileMenu({
  items,
  phone,
  phoneHref,
  searchAction,
  langSwitcher,
}: {
  items: NavItem[]
  phone: string | null
  phoneHref: string
  searchAction: string
  langSwitcher: ReactNode
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-11 items-center justify-center rounded-full hover:bg-sand lg:hidden"
        aria-label={t.header.openMenu}
        aria-expanded={open}
      >
        <IconMenu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.header.menu}>
          <button type="button" aria-label={t.header.closeMenu} onClick={close} className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-y-0 right-0 flex w-[min(360px,88vw)] flex-col bg-paper shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-2">
              {langSwitcher}
              <button
                type="button"
                onClick={close}
                className="flex size-10 items-center justify-center rounded-full hover:bg-sand"
                aria-label={t.header.closeMenu}
              >
                <IconClose size={20} />
              </button>
            </div>

            <Form action={searchAction} onSubmit={close} className="relative px-4 pt-4">
              <IconSearch className="pointer-events-none absolute top-1/2 left-7 mt-2 -translate-y-1/2 text-mute" />
              <input name="q" type="search" placeholder={t.header.searchProducts} className={`${input} pl-10`} />
            </Form>

            <nav className="flex flex-col px-2 py-3">
              {items.map((item) => (
                <Link key={item.href} href={item.href} onClick={close} className="rounded-full px-3 py-3 text-lg font-medium hover:bg-sand">
                  {item.label}
                </Link>
              ))}
            </nav>

            {phone && (
              <a href={phoneHref} className="mt-auto border-t border-line px-6 py-5 text-lg font-medium tabular-nums">
                {phone}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}

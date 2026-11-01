'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/client'
import { useCart } from '@/lib/cart'
import { IconBag } from './icons'

export function CartLink() {
  const { count } = useCart()
  const { t, path, fmt } = useI18n()

  return (
    <Link
      href={path('/cart')}
      className="relative flex h-11 items-center gap-2 rounded-full bg-brand pr-4 pl-3.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-dark"
      aria-label={count ? fmt(t.header.cartAria, { n: count }) : t.header.cart}
    >
      <IconBag size={19} />
      {/* На ширине lg места мало — там только значок */}
      <span className="hidden sm:inline lg:hidden xl:inline">{t.header.cart}</span>
      {count > 0 && (
        <span className="min-w-5 rounded-full bg-accent px-1.5 text-center text-xs leading-5 font-bold text-brand-dark tabular-nums">{count}</span>
      )}
    </Link>
  )
}

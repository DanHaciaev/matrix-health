'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { IconBag } from './icons'

export function CartLink() {
  const { count } = useCart()

  return (
    <Link
      href="/cart"
      className="relative flex h-11 items-center gap-2 rounded-full bg-ink pr-4 pl-3.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-dark"
      aria-label={count ? `Корзина, товаров: ${count}` : 'Корзина'}
    >
      <IconBag size={19} />
      <span className="hidden sm:inline">Корзина</span>
      {count > 0 && (
        <span className="min-w-5 rounded-full bg-sun px-1.5 text-center text-xs leading-5 font-bold text-ink tabular-nums">{count}</span>
      )}
    </Link>
  )
}

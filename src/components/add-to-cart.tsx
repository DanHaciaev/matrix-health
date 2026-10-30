'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { cart, type CartLine } from '@/lib/cart'
import { IconCheck, IconPlus } from './icons'

type LineInput = Omit<CartLine, 'key' | 'qty'>

function useAdded() {
  const [added, setAdded] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const flash = () => {
    setAdded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), 1800)
  }
  return [added, flash] as const
}

/** Маленькая кнопка «+» на карточке товара */
export function QuickAdd({ line, name }: { line: LineInput; name: string }) {
  const [added, flash] = useAdded()

  return (
    <button
      type="button"
      onClick={() => {
        cart.add(line)
        flash()
      }}
      aria-label={`Добавить «${name}» в корзину`}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-all ${
        added ? 'bg-brand-soft text-brand-dark' : 'bg-brand text-white hover:scale-105 hover:bg-brand-dark'
      }`}
    >
      {added ? <IconCheck size={20} /> : <IconPlus size={20} />}
    </button>
  )
}

/** Кнопки «В корзину» и «Купить сейчас» на странице товара */
export function BuyButtons({ line, qty, disabled }: { line: LineInput; qty: number; disabled?: boolean }) {
  const [added, flash] = useAdded()

  return (
    <div className="flex flex-1 flex-wrap gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          cart.add(line, qty)
          flash()
        }}
        className="inline-flex h-13 min-w-44 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-6 font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line-strong"
      >
        {added ? (
          <>
            <IconCheck size={18} /> Добавлено
          </>
        ) : disabled ? (
          'Нет в наличии'
        ) : (
          'В корзину'
        )}
      </button>
      {added && (
        <Link
          href="/cart"
          className="inline-flex h-13 items-center justify-center rounded-full border border-brand px-5 font-medium text-brand hover:bg-brand hover:text-white"
        >
          Перейти в корзину
        </Link>
      )}
    </div>
  )
}

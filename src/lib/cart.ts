'use client'

import { useSyncExternalStore } from 'react'

// Корзина хранится в localStorage браузера. Цены здесь только для показа:
// при оформлении заказа база пересчитывает всё сама (функция place_order).

export type CartLine = {
  key: string
  productId: string
  variantId: string | null
  slug: string
  name: string
  variantLabel: string | null
  price: number
  image: string | null
  form: string
  /** Цвет этикетки на картинке (порядок категории) и фасовка — только для отрисовки */
  tone?: number | null
  pack?: string | null
  /** Остаток на складе — больше этого в корзину не положить. На странице корзины обновляется из базы */
  stock?: number
  qty: number
}

/** Сколько штук можно положить в корзину */
export const maxQty = (l: Pick<CartLine, 'stock'>) => Math.max(0, Math.min(99, l.stock ?? 99))

const STORAGE_KEY = 'hm-cart-v1'
const EMPTY: CartLine[] = []
const listeners = new Set<() => void>()

let lines: CartLine[] = EMPTY
let loaded = false

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    lines = Array.isArray(parsed) ? parsed : EMPTY
  } catch {
    lines = EMPTY
  }
  loaded = true
}

function write(next: CartLine[]) {
  lines = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // приватный режим — корзина живёт до перезагрузки
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      read()
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  if (!loaded) read()
  return lines
}

const getServerSnapshot = () => EMPTY

export const cart = {
  add(line: Omit<CartLine, 'key' | 'qty'>, qty = 1) {
    if (!loaded) read()
    const key = `${line.productId}:${line.variantId ?? ''}`
    const existing = lines.find((l) => l.key === key)
    write(
      existing
        ? lines.map((l) => (l.key === key ? { ...l, ...line, qty: Math.min(maxQty(line), l.qty + qty) } : l))
        : [...lines, { ...line, key, qty: Math.min(maxQty(line), qty) }],
    )
  },
  setQty(key: string, qty: number) {
    write(lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(maxQty(l), qty)) } : l)))
  },
  /** Свежие остатки из базы: количество уменьшается до остатка (но не ниже 1 — товар без остатка покупатель удалит сам) */
  syncStock(stock: Record<string, number>) {
    if (!loaded) read()
    let changed = false
    const next = lines.map((l) => {
      if (!(l.key in stock)) return l
      const s = stock[l.key]
      const qty = Math.max(1, Math.min(l.qty, s))
      if (s === l.stock && qty === l.qty) return l
      changed = true
      return { ...l, stock: s, qty }
    })
    if (changed) write(next)
  },
  remove(key: string) {
    write(lines.filter((l) => l.key !== key))
  },
  clear() {
    write(EMPTY)
  },
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    items,
    count: items.reduce((s, l) => s + l.qty, 0),
    subtotal: items.reduce((s, l) => s + l.qty * l.price, 0),
  }
}

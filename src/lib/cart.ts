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
  qty: number
}

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
        ? lines.map((l) => (l.key === key ? { ...l, ...line, qty: Math.min(99, l.qty + qty) } : l))
        : [...lines, { ...line, key, qty: Math.min(99, qty) }],
    )
  },
  setQty(key: string, qty: number) {
    write(lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l)))
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

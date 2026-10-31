'use server'

import type { Dictionary } from '@/i18n/dictionaries'
import { DELIVERY_METHODS, PAYMENT_METHODS } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createPublicClient } from '@/lib/supabase/public'

// Ошибки возвращаются кодами — форма показывает текст на языке посетителя
export type CheckoutError = keyof Dictionary['checkout']['errors']

export type CheckoutState = {
  ok?: boolean
  number?: number
  error?: CheckoutError
  fields?: Partial<Record<'customer_name' | 'phone' | 'address', CheckoutError>>
}

type ItemInput = { product_id: string; variant_id: string | null; qty: number }

const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim()

export async function placeOrder(_prev: CheckoutState, fd: FormData): Promise<CheckoutState> {
  // Ловушка для ботов: поле скрыто от людей
  if (str(fd, 'website')) return { ok: true, number: 0 }

  const customer = {
    customer_name: str(fd, 'customer_name'),
    phone: str(fd, 'phone'),
    email: str(fd, 'email'),
    delivery_method: str(fd, 'delivery_method'),
    city: str(fd, 'city'),
    address: str(fd, 'address'),
    payment_method: str(fd, 'payment_method'),
    comment: str(fd, 'comment'),
  }

  const fields: CheckoutState['fields'] = {}
  if (customer.customer_name.length < 2) fields.customer_name = 'name'
  if (customer.phone.replace(/\D/g, '').length < 8) fields.phone = 'phone'
  if (customer.delivery_method !== 'pickup' && customer.address.length < 4) fields.address = 'address'
  if (!DELIVERY_METHODS.some((d) => d.id === customer.delivery_method)) customer.delivery_method = 'courier'
  if (!PAYMENT_METHODS.some((p) => p.id === customer.payment_method)) customer.payment_method = 'cash'
  if (Object.keys(fields).length) return { error: 'check', fields }

  let items: ItemInput[] = []
  try {
    const parsed = JSON.parse(str(fd, 'items'))
    items = (Array.isArray(parsed) ? parsed : [])
      .map((i) => ({
        product_id: String(i.product_id),
        variant_id: i.variant_id ? String(i.variant_id) : null,
        qty: Math.max(1, Math.min(99, Number(i.qty) || 1)),
      }))
      .slice(0, 50)
  } catch {
    items = []
  }
  if (!items.length) return { error: 'cartEmpty' }

  if (!isSupabaseConfigured) return { error: 'notConnected' }

  const { data, error } = await createPublicClient().rpc('place_order', { p_customer: customer, p_items: items })

  if (error) {
    // Тексты ошибок place_order — на русском; переводим известные в коды
    if (/недоступ/i.test(error.message)) return { error: 'unavailable' }
    if (/Корзина/i.test(error.message)) return { error: 'cartEmpty' }
    if (/имя/i.test(error.message)) return { error: 'check', fields: { customer_name: 'name' } }
    if (/телефон/i.test(error.message)) return { error: 'check', fields: { phone: 'phone' } }
    return { error: 'failed' }
  }

  const row = Array.isArray(data) ? data[0] : data
  return { ok: true, number: Number(row?.order_number) }
}

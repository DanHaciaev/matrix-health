'use server'

import { DELIVERY_METHODS, PAYMENT_METHODS } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createPublicClient } from '@/lib/supabase/public'

export type CheckoutState = {
  ok?: boolean
  number?: number
  error?: string
  fields?: Partial<Record<'customer_name' | 'phone' | 'address', string>>
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
  if (customer.customer_name.length < 2) fields.customer_name = 'Как к вам обращаться?'
  if (customer.phone.replace(/\D/g, '').length < 8) fields.phone = 'Нужен номер, чтобы подтвердить заказ'
  if (customer.delivery_method !== 'pickup' && customer.address.length < 4) fields.address = 'Укажите адрес доставки'
  if (!DELIVERY_METHODS.some((d) => d.id === customer.delivery_method)) customer.delivery_method = 'courier'
  if (!PAYMENT_METHODS.some((p) => p.id === customer.payment_method)) customer.payment_method = 'cash'
  if (Object.keys(fields).length) return { error: 'Проверьте выделенные поля', fields }

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
  if (!items.length) return { error: 'Корзина пуста' }

  if (!isSupabaseConfigured) {
    return { error: 'База данных не подключена — заказ не может быть сохранён. Позвоните нам, оформим по телефону.' }
  }

  const { data, error } = await createPublicClient().rpc('place_order', { p_customer: customer, p_items: items })

  if (error) {
    // Сообщения из place_order написаны для покупателя, остальные — прячем
    const known = /недоступ|Укажите|Корзина/.test(error.message)
    return { error: known ? error.message : 'Не получилось оформить заказ. Позвоните нам — оформим по телефону.' }
  }

  const row = Array.isArray(data) ? data[0] : data
  return { ok: true, number: Number(row?.order_number) }
}

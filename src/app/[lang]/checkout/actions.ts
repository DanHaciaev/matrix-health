'use server'

import { after } from 'next/server'
import type { Dictionary } from '@/i18n/dictionaries'
import { PAYMENT_METHODS } from '@/lib/constants'
import { DEFAULT_LANG, hasLocale, type Lang } from '@/i18n/config'
import { getCatalog, getSettings } from '@/lib/data'
import { localizeProduct } from '@/lib/localize'
import { mailConfig, mailLogoUrl, orderEmail, sendMail } from '@/lib/mail'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createPublicClient } from '@/lib/supabase/public'
import { orderMessage, sendTelegram, siteOrigin, type OrderNotice } from '@/lib/telegram'

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
const EMAIL_RE = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[a-z]{2,}$/i

export async function placeOrder(_prev: CheckoutState, fd: FormData): Promise<CheckoutState> {
  // Ловушка для ботов: поле скрыто от людей
  if (str(fd, 'website')) return { ok: true, number: 0 }

  const customer = {
    customer_name: str(fd, 'customer_name'),
    phone: str(fd, 'phone'),
    email: str(fd, 'email'),
    // Доставляет только курьер магазина
    delivery_method: 'courier',
    city: str(fd, 'city'),
    address: str(fd, 'address'),
    payment_method: str(fd, 'payment_method'),
    comment: str(fd, 'comment'),
  }

  const fields: CheckoutState['fields'] = {}
  if (customer.customer_name.length < 2) fields.customer_name = 'name'
  if (customer.phone.replace(/\D/g, '').length < 8) fields.phone = 'phone'
  if (customer.address.length < 4) fields.address = 'address'
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
  const number = Number(row?.order_number)
  const orderId = String(row?.order_id ?? '')
  const lang = str(fd, 'lang')

  // Письмо покупателю и уведомление в Telegram — уже после ответа, чтобы покупатель не ждал
  after(async () => {
    const [{ products }, settings, origin] = await Promise.all([getCatalog(), getSettings(), siteOrigin()])
    const linesIn = (l: Lang) =>
      items.map((i) => {
        const found = products.find((p) => p.id === i.product_id)
        const product = found && localizeProduct(found, l)
        const variant = product?.variants.find((v) => v.id === i.variant_id)
        return { name: product?.name ?? '—', variant: variant?.label ?? null, qty: i.qty, price: variant?.price ?? product?.price ?? 0 }
      })
    // Telegram — для магазина, на русском; письмо — на языке покупателя
    const lines: OrderNotice['lines'] = linesIn('ru')
    // Доставка считается так же, как в place_order
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
    const delivery = subtotal >= settings.free_delivery_from ? 0 : settings.delivery_cost

    let emailSent: boolean | null = null
    if (EMAIL_RE.test(customer.email) && mailConfig.configured) {
      const buyerLang = hasLocale(lang) ? lang : DEFAULT_LANG
      const mail = orderEmail({
        lang: buyerLang,
        number,
        store: settings.store_name,
        logoUrl: mailLogoUrl(origin),
        phone: settings.phone,
        customer: {
          name: customer.customer_name,
          city: customer.city,
          address: customer.address,
          payment: customer.payment_method as 'cash' | 'card' | 'transfer',
          comment: customer.comment,
        },
        lines: linesIn(buyerLang),
        delivery,
      })
      emailSent = !(await sendMail({ ...mail, to: customer.email, fromName: settings.store_name }))
    }

    await sendTelegram(
      orderMessage({
        number,
        adminUrl: origin && orderId ? `${origin}/admin/orders/${orderId}` : null,
        lang,
        customer: {
          name: customer.customer_name,
          phone: customer.phone,
          email: customer.email,
          city: customer.city,
          address: customer.address,
          payment: customer.payment_method,
          comment: customer.comment,
        },
        lines,
        delivery,
        emailSent,
      }),
    )
  })

  return { ok: true, number }
}

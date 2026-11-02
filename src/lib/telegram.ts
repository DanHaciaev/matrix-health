import 'server-only'
import { headers } from 'next/headers'
import { CONTACT_LABELS, PAYMENT_METHODS } from './constants'
import { eur, orderNo } from './format'

// Уведомления в Telegram о новых заказах и заявках.
// Токен бота и получатели — в переменных окружения (см. .env.example), в базе их нет.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const CHAT_IDS = (process.env.TELEGRAM_CHAT_ID ?? '').split(/[\s,;]+/).filter(Boolean)

export const telegramConfig = { hasToken: Boolean(TOKEN), chatIds: CHAT_IDS }

/** Экранирует текст покупателя для parse_mode=HTML */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function api<T>(method: string, body: object = {}): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => null)
  if (!data?.ok) throw new Error(data?.description ?? `HTTP ${res.status}`)
  return data.result as T
}

/**
 * Отправляет сообщение всем получателям. Возвращает текст ошибки или null.
 * Ошибка Telegram не должна мешать заказу — поэтому здесь ничего не бросается.
 */
export async function sendTelegram(html: string): Promise<string | null> {
  if (!TOKEN) return 'Не задан TELEGRAM_BOT_TOKEN'
  if (!CHAT_IDS.length) return 'Не задан TELEGRAM_CHAT_ID — кому отправлять'

  const errors: string[] = []
  for (const chat_id of CHAT_IDS) {
    try {
      await api('sendMessage', { chat_id, text: html, parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
    } catch (e) {
      errors.push(`${chat_id}: ${(e as Error).message}`)
    }
  }
  if (errors.length) console.error('Telegram:', errors.join('; '))
  return errors.length ? errors.join('; ') : null
}

export type TelegramChat = { id: string; name: string; username: string | null; type: string }

/** Кто недавно писал боту (или добавил его в группу) — чтобы узнать chat id получателя */
export async function recentChats(): Promise<TelegramChat[]> {
  type Chat = { id: number; type: string; title?: string; first_name?: string; last_name?: string; username?: string }
  type Update = { message?: { chat: Chat }; my_chat_member?: { chat: Chat }; channel_post?: { chat: Chat } }

  const updates = await api<Update[]>('getUpdates', { limit: 100 })
  const chats = new Map<string, TelegramChat>()
  for (const u of updates) {
    const chat = u.message?.chat ?? u.my_chat_member?.chat ?? u.channel_post?.chat
    if (!chat) continue
    chats.set(String(chat.id), {
      id: String(chat.id),
      name: chat.title ?? ([chat.first_name, chat.last_name].filter(Boolean).join(' ') || 'Без имени'),
      username: chat.username ?? null,
      type: chat.type,
    })
  }
  return [...chats.values()]
}

// ——— Тексты сообщений ———

const LANG_NAMES: Record<string, string> = { en: 'английский', ro: 'румынский', ru: 'русский' }

const line = (label: string, value: string | null | undefined) => (value ? `• ${label}: ${esc(value)}` : null)
const block = (...rows: (string | null | false | undefined)[]) => rows.filter(Boolean).join('\n')

export type OrderNotice = {
  number: number
  adminUrl: string | null
  lang: string
  customer: { name: string; phone: string; email: string; city: string; address: string; payment: string; comment: string }
  lines: { name: string; variant: string | null; qty: number; price: number }[]
  delivery: number
  /** Письмо покупателю: true — ушло, false — не ушло, null — не отправлялось */
  emailSent?: boolean | null
}

export function orderMessage(o: OrderNotice) {
  const subtotal = o.lines.reduce((s, l) => s + l.price * l.qty, 0)
  const c = o.customer
  const payment = PAYMENT_METHODS.find((p) => p.id === c.payment)?.label

  return [
    `🛒 <b>Новый заказ №${orderNo(o.number)}</b>`,
    block(
      '👤 <b>Покупатель</b>',
      line('Имя', c.name),
      line('Телефон', c.phone),
      line('Email', c.email && c.email + (o.emailSent === true ? ' (письмо с заказом отправлено)' : o.emailSent === false ? ' (письмо не отправилось)' : '')),
      line('Язык сайта', LANG_NAMES[o.lang]),
    ),
    block('📍 <b>Доставка</b>', line('Город', c.city), line('Адрес', c.address)),
    block(
      '📦 <b>Товары</b>',
      ...o.lines.map(
        (l, i) =>
          `${i + 1}. ${esc(l.name)}${l.variant ? ` (${esc(l.variant)})` : ''}\n` +
          `     ${l.qty} шт × ${eur(l.price)} = <b>${eur(l.price * l.qty)}</b>`,
      ),
    ),
    block(
      '🧾 <b>Сумма</b>',
      `• Товары: ${eur(subtotal)}`,
      `• Доставка: ${o.delivery ? eur(o.delivery) : 'бесплатно'}`,
      `• <b>Итого к оплате: ${eur(subtotal + o.delivery)}</b>`,
      payment && `• Оплата: ${payment.toLowerCase()}`,
    ),
    c.comment && block('💬 <b>Комментарий</b>', `<i>${esc(c.comment)}</i>`),
    o.adminUrl && `<a href="${o.adminUrl}">Открыть заказ в админке</a>`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

export type RequestNotice = {
  number: number
  adminUrl: string | null
  lang: string
  service: { name: string; price: number | null; period: 'once' | 'month' } | null
  customer: { name: string; phone: string; contact: string; comment: string }
}

export function requestMessage(r: RequestNotice) {
  const s = r.service
  const price = !s ? null : s.price === null ? 'цена по запросу' : `${eur(s.price)}${s.period === 'month' ? ' / мес.' : ''}`
  const c = r.customer

  return [
    `🩺 <b>Заявка на консультацию №${orderNo(r.number)}</b>`,
    s && block('📋 <b>Услуга</b>', `${esc(s.name)} — ${price}`),
    block(
      '👤 <b>Клиент</b>',
      line('Имя', c.name),
      line('Телефон', c.phone),
      line('Как связаться', CONTACT_LABELS[c.contact] ?? c.contact),
      line('Язык сайта', LANG_NAMES[r.lang]),
    ),
    block('🎯 <b>Цель клиента</b>', c.comment ? `<i>${esc(c.comment)}</i>` : 'не указана'),
    r.adminUrl && `<a href="${r.adminUrl}">Открыть заявки в админке</a>`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

/** Адрес сайта из запроса — для ссылки «Открыть в админке» */
export async function siteOrigin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) return null
  const proto = h.get('x-forwarded-proto') ?? (/^(localhost|127\.)/.test(host) ? 'http' : 'https')
  return `${proto}://${host}`
}

/** Имя бота (@username) — для ссылки в админке. null, если токен не задан или неверный. */
export async function botUsername(): Promise<string | null> {
  if (!TOKEN) return null
  try {
    return (await api<{ username: string }>('getMe')).username
  } catch {
    return null
  }
}

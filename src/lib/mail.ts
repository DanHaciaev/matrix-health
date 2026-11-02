import 'server-only'
import nodemailer from 'nodemailer'
import { DICTIONARIES } from '@/i18n/dictionaries'
import { DEFAULT_LANG, hasLocale } from '@/i18n/config'
import { makeI18n } from '@/i18n'

// Письма покупателям — напрямую через Gmail (SMTP + пароль приложения), без сторонних сервисов.
// Логин и пароль — в переменных окружения (см. .env.example).

const USER = process.env.GMAIL_USER ?? ''
// Google показывает пароль приложения группами через пробел — пробелы убираем
const PASS = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, '')

export const mailConfig = { configured: Boolean(USER && PASS), user: USER }

let transport: ReturnType<typeof nodemailer.createTransport> | null = null

/** Отправляет письмо. Возвращает текст ошибки или null; ничего не бросает, чтобы не мешать заказу. */
export async function sendMail(msg: { to: string; subject: string; html: string; text: string; fromName: string }) {
  if (!mailConfig.configured) return 'Не заданы GMAIL_USER и GMAIL_APP_PASSWORD'
  transport ??= nodemailer.createTransport({ service: 'gmail', auth: { user: USER, pass: PASS } })
  try {
    await transport.sendMail({
      from: { name: msg.fromName, address: USER },
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    })
    return null
  } catch (e) {
    console.error('Gmail:', (e as Error).message)
    return (e as Error).message
  }
}

// ——— Письмо о заказе ———

// HTML письма пишется со встроенными стилями: почтовые программы не понимают классы и внешние стили
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export type OrderEmail = {
  lang: string
  number: number
  store: string
  /** Полный адрес знака логотипа (https://…/brand/mark.png); почтовые программы не видят относительные ссылки */
  logoUrl: string | null
  phone: string | null
  customer: { name: string; city: string; address: string; payment: 'cash' | 'card' | 'transfer'; comment: string }
  lines: { name: string; variant: string | null; qty: number; price: number }[]
  delivery: number
}

export function orderEmail(o: OrderEmail) {
  const lang = hasLocale(o.lang) ? o.lang : DEFAULT_LANG
  const { t, money, fmt } = makeI18n(lang, DICTIONARIES[lang])
  const e = t.orderEmail
  const subtotal = o.lines.reduce((s, l) => s + l.price * l.qty, 0)
  const total = subtotal + o.delivery
  const address = [o.customer.city, o.customer.address].filter(Boolean).join(', ')
  const payment = t.payment[o.customer.payment]

  const subject = fmt(e.subject, { n: o.number, store: o.store })

  const rows = o.lines
    .map(
      (l) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e7f1;">
            <div style="font-weight:600;color:#0f1a44;">${esc(l.name)}</div>
            <div style="font-size:13px;color:#6b7392;">${l.variant ? `${esc(l.variant)} · ` : ''}${fmt(e.qty, { n: l.qty })} × ${money(l.price)}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e2e7f1;text-align:right;white-space:nowrap;font-weight:600;color:#0f1a44;">${money(l.price * l.qty)}</td>
        </tr>`,
    )
    .join('')

  const info = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#6b7392;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:4px 0;color:#0f1a44;">${esc(value)}</td></tr>`

  const html = `<!doctype html>
<html lang="${lang}">
<body style="margin:0;padding:0;background:#f5f7fc;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fc;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#ffffff;padding:20px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            ${o.logoUrl ? `<td style="padding-right:12px;"><img src="${esc(o.logoUrl)}" width="44" height="40" alt="" style="display:block;border:0;"></td>` : ''}
            <td style="font-family:Georgia,'Times New Roman',serif;font-size:21px;letter-spacing:0.04em;text-transform:uppercase;color:#0b2386;">${esc(o.store)}</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#0b2386;padding:18px 28px;color:#ffffff;font-size:22px;font-weight:700;">${fmt(e.order, { n: o.number })}</td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 6px;font-size:17px;font-weight:600;color:#0f1a44;">${esc(fmt(e.greeting, { name: o.customer.name }))}</p>
          <p style="margin:0 0 24px;color:#3a4468;">${e.intro}</p>

          <div style="font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6b7392;">${e.items}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            <tr><td style="padding:3px 0;color:#3a4468;">${e.products}</td><td style="padding:3px 0;text-align:right;color:#3a4468;">${money(subtotal)}</td></tr>
            <tr><td style="padding:3px 0;color:#3a4468;">${e.delivery}</td><td style="padding:3px 0;text-align:right;color:#3a4468;">${o.delivery ? money(o.delivery) : e.free}</td></tr>
            <tr><td style="padding:10px 0 0;font-size:17px;font-weight:700;color:#0f1a44;">${e.total}</td><td style="padding:10px 0 0;text-align:right;font-size:20px;font-weight:700;color:#0b2386;">${money(total)}</td></tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e7f1;width:100%;">
            ${info(e.address, address)}
            ${info(e.payment, payment)}
            ${o.customer.comment ? info(e.comment, o.customer.comment) : ''}
          </table>
        </td></tr>
        <tr><td style="padding:20px 28px;background:#edf1f9;font-size:13px;color:#6b7392;">
          ${o.phone ? `<div style="margin-bottom:6px;color:#3a4468;">${esc(fmt(e.questions, { phone: o.phone }))}</div>` : ''}
          ${e.ignore}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  // Текстовая версия — для почтовых программ без HTML
  const text = [
    fmt(e.greeting, { name: o.customer.name }),
    e.intro,
    '',
    fmt(e.order, { n: o.number }),
    ...o.lines.map((l) => `— ${l.name}${l.variant ? ` (${l.variant})` : ''}: ${fmt(e.qty, { n: l.qty })} × ${money(l.price)} = ${money(l.price * l.qty)}`),
    '',
    `${e.products}: ${money(subtotal)}`,
    `${e.delivery}: ${o.delivery ? money(o.delivery) : e.free}`,
    `${e.total}: ${money(total)}`,
    '',
    `${e.address}: ${address}`,
    `${e.payment}: ${payment}`,
    o.customer.comment ? `${e.comment}: ${o.customer.comment}` : '',
    '',
    o.phone ? fmt(e.questions, { phone: o.phone }) : '',
    e.ignore,
  ]
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n')

  return { subject, html, text }
}

/** Адрес знака логотипа для письма. С локального сервера картинку получатель не увидит — тогда без неё. */
export function mailLogoUrl(origin: string | null) {
  return origin && !/\/\/(localhost|127\.)/.test(origin) ? `${origin}/brand/mark.png` : null
}

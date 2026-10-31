import { INTL_LOCALE, type Lang } from './config'

// Форматирование, зависящее от языка. Работает и на сервере, и в браузере.

export type PluralForms = { one: string; few?: string; many?: string; other: string }

/** Подставляет значения: fmt('от {price}', { price: '90 €' }) */
export function fmt(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`))
}

const pluralRules = new Map<Lang, Intl.PluralRules>()
const moneyFormats = new Map<Lang, Intl.NumberFormat>()
const dateFormats = new Map<Lang, Intl.DateTimeFormat>()

/** Множественное число по правилам языка: 1 товар / 2 товара / 5 товаров */
export function plural(lang: Lang, n: number, forms: PluralForms) {
  if (!pluralRules.has(lang)) pluralRules.set(lang, new Intl.PluralRules(INTL_LOCALE[lang]))
  const rule = pluralRules.get(lang)!.select(n) as keyof PluralForms
  return fmt(forms[rule] ?? forms.other, { n })
}

/** Цена в евро: «€90» (en), «90 €» (ro, ru) */
export function money(lang: Lang, value: number) {
  if (!moneyFormats.has(lang)) {
    moneyFormats.set(
      lang,
      new Intl.NumberFormat(INTL_LOCALE[lang], {
        style: 'currency',
        currency: 'EUR',
        // Знак «€» во всех языках (без этого в румынском получается «900 EUR»)
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    )
  }
  return moneyFormats.get(lang)!.format(value)
}

export function formatDate(lang: Lang, value: string | null) {
  if (!value) return '—'
  if (!dateFormats.has(lang)) {
    dateFormats.set(lang, new Intl.DateTimeFormat(INTL_LOCALE[lang], { day: '2-digit', month: '2-digit', year: 'numeric' }))
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : dateFormats.get(lang)!.format(d)
}

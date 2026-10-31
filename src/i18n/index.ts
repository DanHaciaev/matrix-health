import { localePath, type Lang } from './config'
import type { Dictionary } from './dictionaries/en'
import { fmt, formatDate, money, plural, type PluralForms } from './format'

/** Набор помощников для текущего языка — одинаковый на сервере и в браузере */
export function makeI18n(lang: Lang, t: Dictionary) {
  return {
    lang,
    t,
    /** '/catalog' → '/ro/catalog' */
    path: (p: string) => localePath(lang, p),
    money: (value: number) => money(lang, value),
    date: (value: string | null) => formatDate(lang, value),
    plural: (n: number, forms: PluralForms) => plural(lang, n, forms),
    fmt,
  }
}

export type I18n = ReturnType<typeof makeI18n>

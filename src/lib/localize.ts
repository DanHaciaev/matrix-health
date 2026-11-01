import type { Lang } from '@/i18n/config'
import type { Catalog, Category, Certificate, FilterOption, Product, Settings, Translations } from './types'

// Подставляет перевод текста. Русский — в обычных колонках таблицы.
// Если перевода на нужный язык нет: румынский → английский → русский, английский → русский.

const FALLBACK: Record<Lang, ('en' | 'ro')[]> = {
  ru: [],
  en: ['en'],
  ro: ['ro', 'en'],
}

const filled = (v: unknown) =>
  v !== null && v !== undefined && (typeof v !== 'string' || v.trim() !== '') && (!Array.isArray(v) || v.length > 0)

function translate<T extends object>(base: T, translations: Translations<Partial<T>> | undefined, lang: Lang, keys: (keyof T)[]): T {
  const chain = FALLBACK[lang]
  if (!chain.length || !translations) return base
  const out = { ...base }
  for (const key of keys) {
    for (const l of chain) {
      const value = translations[l]?.[key]
      if (filled(value)) {
        out[key] = value as T[keyof T]
        break
      }
    }
  }
  return out
}

const PRODUCT_KEYS = [
  'name',
  'pack',
  'unit_label',
  'short_description',
  'description',
  'usage',
  'warning',
  'composition',
  'specs',
] as const satisfies (keyof Product)[]

export function localizeCategory(c: Category, lang: Lang): Category {
  return translate(c, c.translations, lang, ['name', 'description'])
}

export function localizeProduct(p: Product, lang: Lang): Product {
  const out = translate(p, p.translations, lang, [...PRODUCT_KEYS])
  return { ...out, category: p.category ? localizeCategory(p.category, lang) : null }
}

export function localizeCertificate(c: Certificate, lang: Lang): Certificate {
  const out = translate(c, c.translations, lang, ['title'])
  return {
    ...out,
    product: c.product ? translate(c.product, c.product.translations, lang, ['name']) : null,
  }
}

export function localizeSettings(s: Settings, lang: Lang): Settings {
  return translate(s, s.translations, lang, ['tagline', 'address', 'working_hours', 'delivery_info', 'payment_info'])
}

export function localizeFilter(f: FilterOption, lang: Lang): FilterOption {
  return translate(f, f.translations, lang, ['name'])
}

export function localizeCatalog(c: Catalog, lang: Lang): Catalog {
  return {
    products: c.products.map((p) => localizeProduct(p, lang)),
    categories: c.categories.map((x) => localizeCategory(x, lang)),
    certificates: c.certificates.map((x) => localizeCertificate(x, lang)),
    filters: c.filters.map((x) => localizeFilter(x, lang)),
  }
}

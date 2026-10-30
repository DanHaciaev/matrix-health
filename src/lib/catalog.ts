import { FORMS, PAGE_SIZE, PURPOSES, SORTS, type SortId } from './constants'
import type { Product } from './types'

export type Filters = {
  cat: string | null
  q: string
  forms: string[]
  purposes: string[]
  min: number | null
  max: number | null
  stock: boolean
  sort: SortId
  page: number
}

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''
const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : (v ?? '').split(',')).map((s) => s.trim()).filter(Boolean)
const price = (v: string) => {
  const n = Number(v.replace(',', '.'))
  return v && Number.isFinite(n) && n >= 0 ? n : null
}

export function parseFilters(params: RawParams): Filters {
  const sort = first(params.sort) as SortId
  const page = Number.parseInt(first(params.page), 10)

  return {
    cat: first(params.cat) || null,
    q: first(params.q).trim().slice(0, 80),
    forms: list(params.form).filter((f) => FORMS.some((x) => x.id === f)),
    purposes: list(params.for).filter((p) => PURPOSES.some((x) => x.id === p)),
    min: price(first(params.min)),
    max: price(first(params.max)),
    stock: first(params.stock) === '1',
    sort: SORTS.some((s) => s.id === sort) ? sort : 'popular',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export function filtersToQuery(f: Partial<Filters>) {
  const qs = new URLSearchParams()
  if (f.cat) qs.set('cat', f.cat)
  if (f.q) qs.set('q', f.q)
  if (f.forms?.length) qs.set('form', f.forms.join(','))
  if (f.purposes?.length) qs.set('for', f.purposes.join(','))
  if (f.min !== null && f.min !== undefined) qs.set('min', String(f.min))
  if (f.max !== null && f.max !== undefined) qs.set('max', String(f.max))
  if (f.stock) qs.set('stock', '1')
  if (f.sort && f.sort !== 'popular') qs.set('sort', f.sort)
  if (f.page && f.page > 1) qs.set('page', String(f.page))
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export function catalogHref(f: Partial<Filters>) {
  return `/catalog${filtersToQuery(f)}`
}

/** Минимальная цена с учётом вариантов */
export function displayPrice(p: Product) {
  return p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : p.price
}

export function inStock(p: Product) {
  return p.variants.length ? p.variants.some((v) => v.stock > 0) : p.stock > 0
}

const normalize = (s: string) => s.toLowerCase().replace(/ё/g, 'е')

export function matchesQuery(p: Product, q: string) {
  if (!q) return true
  const hay = normalize([p.name, p.pack, p.short_description, p.sku, p.batch, p.category?.name].join(' '))
  return normalize(q)
    .split(/\s+/)
    .every((word) => hay.includes(word))
}

export function applyFilters(products: Product[], f: Filters) {
  const items = products.filter((p) => {
    if (f.cat && p.category?.slug !== f.cat) return false
    if (f.forms.length && !f.forms.includes(p.form)) return false
    if (f.purposes.length && !f.purposes.some((x) => p.purposes.includes(x))) return false
    const price = displayPrice(p)
    if (f.min !== null && price < f.min) return false
    if (f.max !== null && price > f.max) return false
    if (f.stock && !inStock(p)) return false
    return matchesQuery(p, f.q)
  })

  const sorted = [...items].sort((a, b) => {
    // Товары не в наличии всегда в конце
    const stock = Number(inStock(b)) - Number(inStock(a))
    if (stock) return stock
    switch (f.sort) {
      case 'cheap':
        return displayPrice(a) - displayPrice(b)
      case 'expensive':
        return displayPrice(b) - displayPrice(a)
      case 'new':
        return Number(b.is_new) - Number(a.is_new) || b.created_at.localeCompare(a.created_at)
      default:
        return Number(b.is_popular) - Number(a.is_popular) || a.sort - b.sort
    }
  })

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const page = Math.min(f.page, pages)

  return {
    total: sorted.length,
    page,
    pages,
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  }
}

import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { DEFAULT_FILTERS } from './filters'
import { createPublicClient } from './supabase/public'
import { isSupabaseConfigured } from './supabase/env'
import type { Catalog, Category, Certificate, FilterOption, Product, Settings, Variant } from './types'

// Все публичные данные магазина — одним кешируемым запросом, только из Supabase.
// Правки из админки видны сразу (updateTag), правки напрямую в Supabase — примерно через минуту.
export const CATALOG_TAG = 'catalog'
export const SETTINGS_TAG = 'settings'

const EMPTY_CATALOG: Catalog = { products: [], categories: [], certificates: [], filters: DEFAULT_FILTERS }

// Пустые настройки на случай, если база не подключена или строка settings удалена
export const EMPTY_SETTINGS: Settings = {
  store_name: 'Магазин',
  tagline: null,
  phone: null,
  email: null,
  address: null,
  telegram: null,
  working_hours: null,
  delivery_cost: 0,
  free_delivery_from: 0,
  delivery_info: null,
  payment_info: null,
}

const num = (v: unknown) => (v === null || v === undefined || v === '' ? 0 : Number(v))
const numOrNull = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v))

export function normalizeProduct(row: Record<string, unknown>): Product {
  const variants = ((row.variants as Record<string, unknown>[] | null) ?? [])
    .map(
      (v): Variant => ({
        id: String(v.id),
        product_id: String(v.product_id),
        label: String(v.label),
        price: num(v.price),
        stock: num(v.stock),
        sort: num(v.sort),
      }),
    )
    .sort((a, b) => a.sort - b.sort)

  return {
    ...(row as unknown as Product),
    category: (row.category as Category | null) ?? null,
    purposes: (row.purposes as string[] | null) ?? [],
    composition: (row.composition as Product['composition'] | null) ?? [],
    specs: (row.specs as Product['specs'] | null) ?? [],
    images: (row.images as string[] | null) ?? [],
    price: num(row.price),
    old_price: numOrNull(row.old_price),
    stock: num(row.stock),
    variants,
  }
}

export async function getCatalog(): Promise<Catalog> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CATALOG_TAG)

  if (!isSupabaseConfigured) return EMPTY_CATALOG

  const sb = createPublicClient()
  const [products, categories, certificates, filters] = await Promise.all([
    sb
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .eq('is_published', true)
      .order('sort')
      .order('created_at', { ascending: false }),
    sb.from('categories').select('*').order('sort'),
    sb
      .from('certificates')
      .select('*, product:products(*, category:categories(slug))')
      .eq('is_published', true)
      .order('issued_at', { ascending: false, nullsFirst: false }),
    sb.from('filter_options').select('*').order('sort').order('name'),
  ])

  const error = products.error ?? categories.error ?? certificates.error
  if (error) throw new Error(`Supabase: ${error.message}`)

  return {
    products: (products.data ?? []).map(normalizeProduct),
    categories: (categories.data ?? []) as Category[],
    certificates: (certificates.data ?? []) as Certificate[],
    // Пока не запущен supabase/filters.sql, таблицы нет — берём встроенный список
    filters: filters.error ? DEFAULT_FILTERS : ((filters.data ?? []) as FilterOption[]),
  }
}

export async function getSettings(): Promise<Settings> {
  'use cache'
  cacheLife('minutes')
  cacheTag(SETTINGS_TAG)

  if (!isSupabaseConfigured) return EMPTY_SETTINGS

  const { data } = await createPublicClient().from('settings').select('*').eq('id', 1).maybeSingle()
  if (!data) return EMPTY_SETTINGS

  return {
    ...EMPTY_SETTINGS,
    ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== '')),
    delivery_cost: num(data.delivery_cost),
    free_delivery_from: num(data.free_delivery_from),
  } as Settings
}

export async function getProduct(slug: string) {
  const { products, certificates } = await getCatalog()
  const product = products.find((p) => p.slug === slug)
  if (!product) return null

  return {
    product,
    certificates: certificates.filter((c) => c.product_id === product.id),
    related: products
      .filter((p) => p.id !== product.id)
      .sort(
        (a, b) =>
          Number(b.category_id === product.category_id) - Number(a.category_id === product.category_id) ||
          Number(b.is_popular) - Number(a.is_popular),
      )
      .slice(0, 4),
  }
}

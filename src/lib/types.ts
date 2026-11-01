import type { OrderStatus, PaymentMethod, RequestStatus } from './constants'

// Переводы текстов: русский лежит в обычных колонках, английский и румынский — здесь
export type TranslatedLang = 'en' | 'ro'
export type Translations<T> = Partial<Record<TranslatedLang, Partial<T>>>

export type Category = {
  id: string
  slug: string
  name: string
  description: string | null
  sort: number
  translations?: Translations<CategoryText>
}

export type CategoryText = { name: string; description: string | null }

export type Variant = {
  id: string
  product_id: string
  label: string
  price: number
  stock: number
  sort: number
}

export type Row = { name: string; amount: string }
export type Spec = { label: string; value: string }

export type Product = {
  id: string
  slug: string
  name: string
  category_id: string | null
  category: Category | null
  /** slug формы выпуска из filter_options */
  form: string
  purposes: string[]
  pack: string | null
  unit_label: string | null
  short_description: string | null
  description: string | null
  usage: string | null
  warning: string | null
  composition: Row[]
  specs: Spec[]
  sku: string | null
  batch: string | null
  price: number
  old_price: number | null
  stock: number
  is_new: boolean
  is_popular: boolean
  is_published: boolean
  images: string[]
  sort: number
  created_at: string
  updated_at?: string
  variants: Variant[]
  translations?: Translations<ProductText>
}

export type ProductText = Pick<
  Product,
  'name' | 'pack' | 'unit_label' | 'short_description' | 'description' | 'usage' | 'warning' | 'composition' | 'specs'
>

export type Certificate = {
  id: string
  product_id: string | null
  title: string
  doc_type: string
  batch: string | null
  issued_at: string | null
  lab: string | null
  file_url: string | null
  is_published: boolean
  created_at: string
  translations?: Translations<CertificateText>
  product: {
    slug: string
    name: string
    translations?: Translations<ProductText>
    category: { slug: string } | null
  } | null
}

export type CertificateText = { title: string }

export type Settings = {
  store_name: string
  tagline: string | null
  phone: string | null
  email: string | null
  address: string | null
  telegram: string | null
  working_hours: string | null
  delivery_cost: number
  free_delivery_from: number
  delivery_info: string | null
  payment_info: string | null
  translations?: Translations<SettingsText>
}

export type SettingsText = Pick<Settings, 'tagline' | 'address' | 'working_hours' | 'delivery_info' | 'payment_info'>

export type OrderItem = {
  id: string
  product_id: string | null
  variant_id: string | null
  name: string
  variant_label: string | null
  price: number
  qty: number
}

export type Order = {
  id: string
  number: number
  status: OrderStatus
  customer_name: string
  phone: string
  email: string | null
  delivery_method: string
  city: string | null
  address: string | null
  payment_method: PaymentMethod
  comment: string | null
  subtotal: number
  delivery_cost: number
  total: number
  admin_note: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

/** Вариант фильтра каталога: назначение или форма выпуска (таблица filter_options) */
export type FilterOption = {
  id: string
  kind: 'purpose' | 'form'
  slug: string
  name: string
  translations?: Translations<{ name: string }>
  sort: number
  is_visible: boolean
}

/** Услуга специалиста: консультация, сопровождение (таблица services) */
export type Service = {
  id: string
  slug: string
  name: string
  summary: string | null
  features: string[]
  /** null — «цена по запросу» */
  price: number | null
  period: 'once' | 'month'
  sort: number
  is_published: boolean
  translations?: Translations<ServiceText>
}

export type ServiceText = Pick<Service, 'name' | 'summary' | 'features'>

export type ServiceRequest = {
  id: string
  number: number
  service_id: string | null
  service_name: string
  price: number | null
  period: Service['period'] | null
  status: RequestStatus
  customer_name: string
  phone: string
  contact_method: string
  comment: string | null
  admin_note: string | null
  created_at: string
}

export type Catalog = {
  products: Product[]
  categories: Category[]
  certificates: Certificate[]
  filters: FilterOption[]
}

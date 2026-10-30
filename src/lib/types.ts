import type { DeliveryMethod, FormId, OrderStatus, PaymentMethod } from './constants'

export type Category = {
  id: string
  slug: string
  name: string
  description: string | null
  sort: number
}

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
  form: FormId
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
}

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
  product: { slug: string; name: string; category: { slug: string } | null } | null
}

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
}

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
  delivery_method: DeliveryMethod
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

export type Catalog = {
  products: Product[]
  categories: Category[]
  certificates: Certificate[]
}

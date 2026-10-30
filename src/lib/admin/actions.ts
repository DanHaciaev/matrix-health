'use server'

import { refresh, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { DOC_TYPES, FORMS, ORDER_STATUSES, PURPOSES } from '../constants'
import { CATALOG_TAG, SETTINGS_TAG } from '../data'
import { slugify } from '../format'
import { MEDIA_BUCKET, isSupabaseConfigured } from '../supabase/env'
import { createSupabaseServer } from '../supabase/server'
import { requireAdmin } from './auth'

export type FormState = { ok?: boolean; message?: string; error?: string }

type Sb = Awaited<ReturnType<typeof requireAdmin>>['sb']

const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim()
const strOrNull = (fd: FormData, key: string) => str(fd, key) || null
const bool = (fd: FormData, key: string) => fd.get(key) === 'on'
const money = (fd: FormData, key: string) => {
  const v = str(fd, key).replace(',', '.').replace(/\s/g, '')
  return v === '' ? null : Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : null
}
const int = (fd: FormData, key: string) => Math.max(0, Math.trunc(Number(str(fd, key)) || 0))

function json<T>(fd: FormData, key: string, fallback: T): T {
  try {
    return JSON.parse(str(fd, key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

function dbError(message: string) {
  if (/duplicate key.*slug/i.test(message)) return 'Такой адрес (slug) уже занят — измените его.'
  if (/row-level security/i.test(message)) return 'Нет прав. Проверьте, что ваш пользователь добавлен в таблицу admins.'
  return `Ошибка базы данных: ${message}`
}

async function upload(sb: Sb, folder: string, file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(`Не удалось загрузить «${file.name}»: ${error.message}`)
  return sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

async function removeFiles(sb: Sb, urls: string[]) {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`
  const paths = urls.map((u) => (u.includes(marker) ? decodeURIComponent(u.split(marker)[1]) : null)).filter(Boolean) as string[]
  if (paths.length) await sb.storage.from(MEDIA_BUCKET).remove(paths)
}

const files = (fd: FormData, key: string) => fd.getAll(key).filter((f): f is File => f instanceof File && f.size > 0)

// ——— Вход ———

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: 'Supabase не подключён: заполните .env.local и перезапустите сервер.' }

  const sb = await createSupabaseServer()
  const { error } = await sb.auth.signInWithPassword({ email: str(fd, 'email'), password: str(fd, 'password') })
  if (error) return { error: 'Неверный email или пароль' }

  const { data: isAdmin } = await sb.rpc('is_admin')
  if (!isAdmin) {
    await sb.auth.signOut()
    return { error: 'У этого пользователя нет доступа к админке. Добавьте его в таблицу admins (см. README).' }
  }

  const next = str(fd, 'next')
  redirect(next.startsWith('/admin') ? next : '/admin')
}

export async function logout() {
  const sb = await createSupabaseServer()
  await sb.auth.signOut()
  redirect('/admin/login')
}

// ——— Товары ———

export async function saveProduct(_prev: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await requireAdmin()
  const id = str(fd, 'id')

  const name = str(fd, 'name')
  if (!name) return { error: 'Укажите название товара' }
  const slug = slugify(str(fd, 'slug') || name)
  if (!slug) return { error: 'Укажите адрес страницы латиницей' }

  const form = str(fd, 'form')
  const price = money(fd, 'price')
  if (price === null) return { error: 'Укажите цену' }

  const variants = json<{ id?: string; label: string; price: number | string; stock: number | string }[]>(fd, 'variants', [])
    .map((v, i) => ({
      id: v.id || undefined,
      label: String(v.label ?? '').trim(),
      price: Math.max(0, Number(String(v.price).replace(',', '.')) || 0),
      stock: Math.max(0, Math.trunc(Number(v.stock) || 0)),
      sort: i,
    }))
    .filter((v) => v.label)

  const clean = (rows: Record<string, string>[], a: string, b: string) =>
    rows.map((r) => ({ [a]: String(r[a] ?? '').trim(), [b]: String(r[b] ?? '').trim() })).filter((r) => r[a])

  const keptImages = json<string[]>(fd, 'images_keep', [])
  const previousImages = json<string[]>(fd, 'images_prev', [])

  let newImages: string[] = []
  try {
    const list = files(fd, 'images_new')
    if (list.some((f) => !f.type.startsWith('image/'))) return { error: 'Фото должны быть картинками (JPG, PNG, WebP)' }
    if (list.some((f) => f.size > 5 * 1024 * 1024)) return { error: 'Каждое фото — не больше 5 МБ' }
    newImages = await Promise.all(list.map((f) => upload(sb, `products/${slug}`, f)))
  } catch (e) {
    return { error: (e as Error).message }
  }

  const row = {
    name,
    slug,
    category_id: strOrNull(fd, 'category_id'),
    form: FORMS.some((f) => f.id === form) ? form : 'capsules',
    purposes: fd.getAll('purposes').map(String).filter((p) => PURPOSES.some((x) => x.id === p)),
    pack: strOrNull(fd, 'pack'),
    unit_label: strOrNull(fd, 'unit_label'),
    short_description: strOrNull(fd, 'short_description'),
    description: strOrNull(fd, 'description'),
    usage: strOrNull(fd, 'usage'),
    warning: strOrNull(fd, 'warning'),
    composition: clean(json(fd, 'composition', []), 'name', 'amount'),
    specs: clean(json(fd, 'specs', []), 'label', 'value'),
    sku: strOrNull(fd, 'sku'),
    batch: strOrNull(fd, 'batch'),
    price,
    old_price: money(fd, 'old_price'),
    stock: int(fd, 'stock'),
    sort: int(fd, 'sort'),
    is_new: bool(fd, 'is_new'),
    is_popular: bool(fd, 'is_popular'),
    is_published: bool(fd, 'is_published'),
    images: [...keptImages, ...newImages],
  }

  const saved = id
    ? await sb.from('products').update(row).eq('id', id).select('id').single()
    : await sb.from('products').insert(row).select('id').single()
  if (saved.error) return { error: dbError(saved.error.message) }
  const productId = saved.data.id as string

  // Варианты: удаляем убранные, обновляем остальные
  const keepIds = variants.map((v) => v.id).filter(Boolean) as string[]
  let del = sb.from('product_variants').delete().eq('product_id', productId)
  if (keepIds.length) del = del.not('id', 'in', `(${keepIds.join(',')})`)
  const delRes = await del
  if (delRes.error) return { error: dbError(delRes.error.message) }

  for (const v of variants) {
    const res = v.id
      ? await sb.from('product_variants').update({ label: v.label, price: v.price, stock: v.stock, sort: v.sort }).eq('id', v.id)
      : await sb.from('product_variants').insert({ product_id: productId, label: v.label, price: v.price, stock: v.stock, sort: v.sort })
    if (res.error) return { error: dbError(res.error.message) }
  }

  await removeFiles(sb, previousImages.filter((u) => !keptImages.includes(u)))

  updateTag(CATALOG_TAG)
  // Перезагружаем форму с данными из базы, чтобы новые фото не загрузились повторно
  redirect(`/admin/products/${productId}?saved=${id ? 'updated' : 'created'}`)
}

export async function deleteProduct(id: string) {
  const { sb } = await requireAdmin()
  const { data } = await sb.from('products').select('images').eq('id', id).single()
  const { error } = await sb.from('products').delete().eq('id', id)
  if (error) throw new Error(dbError(error.message))
  await removeFiles(sb, (data?.images as string[] | null) ?? [])
  updateTag(CATALOG_TAG)
  redirect('/admin/products')
}

export async function setProductPublished(id: string, published: boolean) {
  const { sb } = await requireAdmin()
  await sb.from('products').update({ is_published: published }).eq('id', id)
  updateTag(CATALOG_TAG)
  refresh()
}

export async function setProductStock(id: string, stock: number) {
  const { sb } = await requireAdmin()
  await sb.from('products').update({ stock: Math.max(0, Math.trunc(stock) || 0) }).eq('id', id)
  updateTag(CATALOG_TAG)
  refresh()
}

// ——— Сертификаты ———

export async function saveCertificate(_prev: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await requireAdmin()
  const id = str(fd, 'id')
  const title = str(fd, 'title')
  if (!title) return { error: 'Укажите название документа' }

  let fileUrl = strOrNull(fd, 'file_url')
  const [file] = files(fd, 'file')
  if (file) {
    if (!/pdf|image\//.test(file.type)) return { error: 'Загрузите PDF или изображение' }
    if (file.size > 15 * 1024 * 1024) return { error: 'Файл больше 15 МБ' }
    try {
      const prev = fileUrl
      fileUrl = await upload(sb, 'certificates', file)
      if (prev) await removeFiles(sb, [prev])
    } catch (e) {
      return { error: (e as Error).message }
    }
  }

  const docType = str(fd, 'doc_type')
  const row = {
    title,
    product_id: strOrNull(fd, 'product_id'),
    doc_type: (DOC_TYPES as readonly string[]).includes(docType) ? docType : 'Другое',
    batch: strOrNull(fd, 'batch'),
    issued_at: strOrNull(fd, 'issued_at'),
    lab: strOrNull(fd, 'lab'),
    file_url: fileUrl,
    is_published: bool(fd, 'is_published'),
  }

  const res = id ? await sb.from('certificates').update(row).eq('id', id) : await sb.from('certificates').insert(row)
  if (res.error) return { error: dbError(res.error.message) }

  updateTag(CATALOG_TAG)
  redirect('/admin/certificates?saved=1')
}

export async function deleteCertificate(id: string) {
  const { sb } = await requireAdmin()
  const { data } = await sb.from('certificates').select('file_url').eq('id', id).single()
  await sb.from('certificates').delete().eq('id', id)
  if (data?.file_url) await removeFiles(sb, [data.file_url])
  updateTag(CATALOG_TAG)
  redirect('/admin/certificates')
}

// ——— Категории ———

export async function saveCategory(_prev: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await requireAdmin()
  const id = str(fd, 'id')
  const name = str(fd, 'name')
  if (!name) return { error: 'Укажите название' }

  const row = {
    name,
    slug: slugify(str(fd, 'slug') || name),
    description: strOrNull(fd, 'description'),
    sort: int(fd, 'sort'),
  }
  const res = id ? await sb.from('categories').update(row).eq('id', id) : await sb.from('categories').insert(row)
  if (res.error) return { error: dbError(res.error.message) }

  updateTag(CATALOG_TAG)
  refresh()
  return { ok: true, message: id ? 'Сохранено' : 'Категория добавлена' }
}

export async function deleteCategory(id: string) {
  const { sb } = await requireAdmin()
  await sb.from('categories').delete().eq('id', id)
  updateTag(CATALOG_TAG)
  refresh()
}

// ——— Заказы ———

export async function setOrderStatus(id: string, status: string) {
  const { sb } = await requireAdmin()
  if (!ORDER_STATUSES.some((s) => s.id === status)) return
  await sb.from('orders').update({ status }).eq('id', id)
  refresh()
}

export async function saveOrderNote(_prev: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await requireAdmin()
  const { error } = await sb.from('orders').update({ admin_note: strOrNull(fd, 'admin_note') }).eq('id', str(fd, 'id'))
  if (error) return { error: dbError(error.message) }
  refresh()
  return { ok: true, message: 'Заметка сохранена' }
}

// ——— Настройки ———

/** Сбросить кеш сайта — если данные правили напрямую в Supabase */
export async function refreshSite() {
  await requireAdmin()
  updateTag(CATALOG_TAG)
  updateTag(SETTINGS_TAG)
  refresh()
}

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await requireAdmin()

  const row = {
    store_name: str(fd, 'store_name') || 'Магазин',
    tagline: strOrNull(fd, 'tagline'),
    phone: strOrNull(fd, 'phone'),
    email: strOrNull(fd, 'email'),
    address: strOrNull(fd, 'address'),
    telegram: strOrNull(fd, 'telegram'),
    working_hours: strOrNull(fd, 'working_hours'),
    delivery_cost: money(fd, 'delivery_cost') ?? 0,
    free_delivery_from: money(fd, 'free_delivery_from') ?? 0,
    delivery_info: strOrNull(fd, 'delivery_info'),
    payment_info: strOrNull(fd, 'payment_info'),
  }

  const { error } = await sb.from('settings').update(row).eq('id', 1)
  if (error) return { error: dbError(error.message) }

  updateTag(SETTINGS_TAG)
  refresh()
  return { ok: true, message: 'Настройки сохранены — сайт уже обновился' }
}

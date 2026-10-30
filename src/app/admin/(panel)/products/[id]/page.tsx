import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminTitle } from '@/components/admin/parts'
import { ProductForm } from '@/components/admin/product-form'
import { IconArrowLeft } from '@/components/icons'
import { requireAdmin } from '@/lib/admin/auth'
import { normalizeProduct } from '@/lib/data'
import type { Category } from '@/lib/types'

export const metadata = { title: 'Товар' }

export default async function EditProductPage(props: PageProps<'/admin/products/[id]'>) {
  const { sb } = await requireAdmin()
  const [{ id }, { saved }] = await Promise.all([props.params, props.searchParams])

  const [{ data }, { data: cats }] = await Promise.all([
    sb.from('products').select('*, category:categories(*), variants:product_variants(*)').eq('id', id).maybeSingle(),
    sb.from('categories').select('*').order('sort'),
  ])
  if (!data) notFound()
  const product = normalizeProduct(data)

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink">
        <IconArrowLeft size={16} /> Товары
      </Link>
      <AdminTitle title={product.name} sub={product.category?.name} />

      {saved && (
        <p role="status" className="mb-6 rounded-md bg-brand-soft px-4 py-3 text-sm text-brand-dark">
          ✓ {saved === 'created' ? 'Товар создан и уже на сайте (если включена публикация).' : 'Изменения сохранены — сайт обновился.'}
        </p>
      )}

      <ProductForm key={product.updated_at ?? product.id} product={product} categories={(cats ?? []) as Category[]} />
    </>
  )
}

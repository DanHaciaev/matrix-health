import Link from 'next/link'
import { AdminTitle } from '@/components/admin/parts'
import { ProductForm } from '@/components/admin/product-form'
import { IconArrowLeft } from '@/components/icons'
import { requireAdmin } from '@/lib/admin/auth'
import type { Category } from '@/lib/types'

export const metadata = { title: 'Новый товар' }

export default async function NewProductPage() {
  const { sb } = await requireAdmin()
  const { data } = await sb.from('categories').select('*').order('sort')

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink">
        <IconArrowLeft size={16} /> Товары
      </Link>
      <AdminTitle title="Новый товар" />
      <ProductForm product={null} categories={(data ?? []) as Category[]} />
    </>
  )
}

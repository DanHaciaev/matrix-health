import Form from 'next/form'
import Link from 'next/link'
import { PublishToggle } from '@/components/admin/controls'
import { AdminTitle, Empty } from '@/components/admin/parts'
import { IconPlus, IconSearch } from '@/components/icons'
import { ProductVisual } from '@/components/product-visual'
import { btn } from '@/components/ui'
import { requireAdmin } from '@/lib/admin/auth'
import { matchesQuery } from '@/lib/catalog'
import { normalizeProduct } from '@/lib/data'
import { lei } from '@/lib/format'
import type { Category } from '@/lib/types'

export const metadata = { title: 'Товары' }

export default async function ProductsPage(props: PageProps<'/admin/products'>) {
  const { sb } = await requireAdmin()
  const params = await props.searchParams
  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const cat = typeof params.cat === 'string' ? params.cat : ''

  const [{ data }, { data: cats }] = await Promise.all([
    sb.from('products').select('*, category:categories(*), variants:product_variants(*)').order('sort').order('created_at', { ascending: false }),
    sb.from('categories').select('*').order('sort'),
  ])

  const all = (data ?? []).map(normalizeProduct)
  const products = all.filter((p) => (!cat || p.category_id === cat) && matchesQuery(p, q))
  const categories = (cats ?? []) as Category[]

  return (
    <>
      <AdminTitle title="Товары" sub={`${all.length} в базе · ${all.filter((p) => p.is_published).length} на сайте`}>
        <Link href="/admin/products/new" className={btn.smallPrimary}>
          <IconPlus size={16} /> Добавить товар
        </Link>
      </AdminTitle>

      <Form action="/admin/products" className="mb-5 flex flex-wrap gap-2">
        <div className="relative w-full sm:w-72">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mute" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Название, артикул, партия"
            className="h-9 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-brand"
          />
        </div>
        <select name="cat" defaultValue={cat} className="h-9 rounded-md border border-line bg-surface px-2 text-sm">
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className={btn.small}>
          Найти
        </button>
      </Form>

      {products.length === 0 ? (
        <Empty>
          {all.length === 0 ? (
            <>
              Товаров пока нет.{' '}
              <Link href="/admin/products/new" className="font-medium text-brand underline">
                Добавьте первый
              </Link>{' '}
              или выполните <code className="font-mono">supabase/seed.sql</code> в Supabase.
            </>
          ) : (
            'Ничего не найдено'
          )}
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[720px] text-[15px]">
            <thead className="border-b border-line text-left text-sm text-mute">
              <tr>
                <th className="px-4 py-3 font-normal">Товар</th>
                <th className="px-4 py-3 font-normal">Категория</th>
                <th className="px-4 py-3 font-normal">Цена</th>
                <th className="px-4 py-3 font-normal">Остаток</th>
                <th className="px-4 py-3 font-normal">На сайте</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const stock = p.variants.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock
                return (
                  <tr key={p.id} className={`hover:bg-paper ${p.is_published ? '' : 'text-mute'}`}>
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-brand">
                        <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sand">
                          <ProductVisual form={p.form} image={p.images[0]} alt="" name={p.name} tone={p.category?.sort} size="sm" sizes="48px" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium">{p.name}</span>
                          <span className="block text-sm text-mute">
                            {p.pack}
                            {p.sku && <span className="font-mono"> · {p.sku}</span>}
                            {p.variants.length > 0 && ` · ${p.variants.length} вар.`}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-sm">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">
                      {lei(p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : p.price)}
                    </td>
                    <td className={`px-4 py-2.5 font-mono text-sm ${stock === 0 ? 'text-signal' : stock <= 3 ? 'text-[#a2620f]' : ''}`}>{stock}</td>
                    <td className="px-4 py-2.5">
                      <PublishToggle id={p.id} published={p.is_published} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

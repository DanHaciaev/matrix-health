import { CategoryForm } from '@/components/admin/category-form'
import { AdminTitle, Card } from '@/components/admin/parts'
import { requireAdmin } from '@/lib/admin/auth'
import type { Category } from '@/lib/types'

export const metadata = { title: 'Категории' }

export default async function CategoriesPage() {
  const { sb } = await requireAdmin()
  const [{ data }, { data: products }] = await Promise.all([
    sb.from('categories').select('*').order('sort'),
    sb.from('products').select('category_id'),
  ])
  const categories = (data ?? []) as Category[]
  const count = (id: string) => (products ?? []).filter((p) => p.category_id === id).length

  return (
    <>
      <AdminTitle title="Категории" sub="Разделы каталога и меню сайта. Порядок — по возрастанию числа." />

      <Card>
        <div className="hidden grid-cols-[1.2fr_1fr_1.6fr_70px_auto] gap-2 pb-1 text-xs text-mute md:grid">
          <span>Название</span>
          <span>Адрес</span>
          <span>Подпись</span>
          <span>Порядок</span>
          <span />
        </div>
        <div className="divide-y divide-line">
          {categories.map((c) => (
            <CategoryForm key={`${c.id}-${c.name}-${c.sort}`} category={c} count={count(c.id)} />
          ))}
        </div>
        <div className="mt-2 border-t border-ink pt-2">
          <p className="pt-3 text-sm font-medium">Новая категория</p>
          <CategoryForm key={categories.length} category={null} />
        </div>
      </Card>
    </>
  )
}

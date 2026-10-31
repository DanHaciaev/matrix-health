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
      <AdminTitle
        title="Категории"
        sub="Разделы каталога на трёх языках. Порядок — по возрастанию числа, от него же зависит цвет плиток на сайте."
      />

      <Card>
        <div className="divide-y divide-line">
          {categories.map((c) => (
            // Ключ меняется после сохранения — форма подхватывает новые значения
            <CategoryForm key={`${c.id}-${JSON.stringify([c.name, c.description, c.sort, c.slug, c.translations])}`} category={c} count={count(c.id)} />
          ))}
        </div>
        <div className="mt-2 border-t border-line-strong pt-2">
          <p className="pt-3 text-sm font-medium">Новая категория</p>
          <CategoryForm key={categories.length} category={null} />
        </div>
      </Card>
    </>
  )
}

import { FilterForm } from '@/components/admin/filter-form'
import { AdminTitle, Card } from '@/components/admin/parts'
import { requireAdmin } from '@/lib/admin/auth'
import { getAdminFilters } from '@/lib/admin/filters'
import type { FilterOption } from '@/lib/types'

export const metadata = { title: 'Фильтры' }

const SECTIONS: { kind: FilterOption['kind']; title: string; note: string }[] = [
  {
    kind: 'purpose',
    title: 'Назначение',
    note: 'У товара можно отметить несколько назначений. В каталоге показываются только те, что есть у товаров выбранной категории.',
  },
  {
    kind: 'form',
    title: 'Форма выпуска',
    note: 'У товара одна форма. От неё зависит рисунок упаковки, пока у товара нет фото.',
  },
]

export default async function FiltersPage() {
  const { sb } = await requireAdmin()
  const [{ filters, ready }, { data: products }] = await Promise.all([
    getAdminFilters(sb),
    sb.from('products').select('form, purposes'),
  ])

  const usage = (option: FilterOption) =>
    (products ?? []).filter((p) =>
      option.kind === 'form' ? p.form === option.slug : ((p.purposes as string[] | null) ?? []).includes(option.slug),
    ).length

  return (
    <>
      <AdminTitle title="Фильтры" sub="Варианты фильтров каталога на трёх языках. Отмечаются в карточке товара." />

      {!ready && (
        <p className="mb-6 max-w-3xl rounded-lg border border-signal/30 bg-signal-soft px-4 py-3 text-sm text-ink-2">
          <b className="text-signal">Нужно один раз выполнить SQL.</b> Откройте Supabase → SQL Editor и запустите файл{' '}
          <code className="font-mono">supabase/filters.sql</code>. Пока этого не сделано, сайт использует встроенный список
          ниже, а изменить его нельзя.
        </p>
      )}

      <div className="grid items-start gap-6 2xl:grid-cols-2">
        {SECTIONS.map((section) => {
          const options = filters.filter((f) => f.kind === section.kind)
          return (
            <Card key={section.kind} title={section.title}>
              <p className="-mt-1 mb-2 text-sm text-mute">{section.note}</p>
              <div className="divide-y divide-line">
                {options.map((o) => (
                  // Ключ меняется после сохранения — форма подхватывает новые значения
                  <FilterForm
                    key={`${o.id}-${JSON.stringify([o.name, o.sort, o.is_visible, o.translations])}`}
                    option={o}
                    kind={section.kind}
                    usedBy={usage(o)}
                    disabled={!ready}
                  />
                ))}
              </div>
              <div className="mt-2 border-t border-line-strong pt-2">
                <p className="pt-3 text-sm font-medium">Новый вариант</p>
                <FilterForm key={options.length} option={null} kind={section.kind} disabled={!ready} />
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

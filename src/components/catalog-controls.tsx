'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'
import { useI18n } from '@/i18n/client'
import { catalogHref, type Filters } from '@/lib/catalog'
import { SORTS, type SortId } from '@/lib/constants'
import { IconClose, IconSettings } from './icons'
import { SelectMenu } from './select-menu'
import { checkbox, input } from './ui'

/** Варианты фильтра из Админка → Фильтры (уже на языке страницы) */
export type FilterChoice = { slug: string; name: string }

type Facets = { forms: Record<string, number>; purposes: Record<string, number>; minPrice: number; maxPrice: number }

// Фильтры применяются сразу, без кнопки «Применить»: меняем URL, сервер отдаёт новый список.
export function CatalogControls({
  filters,
  facets,
  options,
  total,
  children,
  footer,
}: {
  filters: Filters
  facets: Facets
  options: { forms: FilterChoice[]; purposes: FilterChoice[] }
  total: number
  children: ReactNode
  /** Под сеткой товаров (страницы). Отдельной строкой — чтобы липкие фильтры останавливались на последнем ряду товаров */
  footer?: ReactNode
}) {
  const router = useRouter()
  const { t, lang, fmt } = useI18n()
  const [pending, startTransition] = useTransition()
  const [drawer, setDrawer] = useState(false)

  const go = (patch: Partial<Filters>) => {
    startTransition(() => {
      router.push(catalogHref(lang, { ...filters, page: 1, ...patch }), { scroll: false })
    })
  }

  const toggle = (key: 'forms' | 'purposes', id: string) => {
    const list = filters[key]
    go({ [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] })
  }

  const chips: { label: string; clear: Partial<Filters> }[] = [
    ...(filters.q ? [{ label: `«${filters.q}»`, clear: { q: '' } }] : []),
    ...filters.forms.map((id) => ({
      label: options.forms.find((f) => f.slug === id)?.name ?? id,
      clear: { forms: filters.forms.filter((x) => x !== id) },
    })),
    ...filters.purposes.map((id) => ({
      label: options.purposes.find((p) => p.slug === id)?.name ?? id,
      clear: { purposes: filters.purposes.filter((x) => x !== id) },
    })),
    ...(filters.min !== null ? [{ label: fmt(t.catalog.chipFrom, { n: filters.min }), clear: { min: null } }] : []),
    ...(filters.max !== null ? [{ label: fmt(t.catalog.chipTo, { n: filters.max }), clear: { max: null } }] : []),
    ...(filters.stock ? [{ label: t.catalog.chipInStock, clear: { stock: false } }] : []),
  ]

  const panel = (
    <div className="flex flex-col gap-8">
      <FilterGroup title={t.catalog.form}>
        {options.forms.filter((f) => facets.forms[f.slug] || filters.forms.includes(f.slug)).map((f) => (
          <Check
            key={f.slug}
            label={f.name}
            count={facets.forms[f.slug] ?? 0}
            checked={filters.forms.includes(f.slug)}
            onChange={() => toggle('forms', f.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t.catalog.purpose}>
        {options.purposes.filter((p) => facets.purposes[p.slug] || filters.purposes.includes(p.slug)).map((p) => (
          <Check
            key={p.slug}
            label={p.name}
            count={facets.purposes[p.slug] ?? 0}
            checked={filters.purposes.includes(p.slug)}
            onChange={() => toggle('purposes', p.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t.catalog.price}>
        <PriceRange
          key={`${filters.min}-${filters.max}`}
          min={filters.min}
          max={filters.max}
          labels={{ from: t.catalog.priceFrom, to: t.catalog.priceTo, phFrom: fmt(t.catalog.placeholderFrom, { n: facets.minPrice }), phTo: fmt(t.catalog.placeholderTo, { n: facets.maxPrice }) }}
          onApply={(min, max) => go({ min, max })}
        />
      </FilterGroup>

      <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-line pt-6 text-[15px] font-medium">
        {t.catalog.inStockOnly}
        <input type="checkbox" className={checkbox} checked={filters.stock} onChange={() => go({ stock: !filters.stock })} />
      </label>
    </div>
  )

  return (
    // Две строки: сверху — заголовок фильтров и панель сортировки, снизу — фильтры и товары.
    // Так карточка фильтров и сетка товаров начинаются на одной линии.
    <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[272px_1fr]">
      {/* Над фильтрами — только «Сбросить всё», когда что-то выбрано; пустая ячейка держит выравнивание */}
      <div className="hidden items-center px-1 lg:flex">
        {chips.length > 0 && (
          <button
            type="button"
            onClick={() => go({ q: '', forms: [], purposes: [], min: null, max: null, stock: false })}
            className="text-sm text-mute underline underline-offset-4 hover:text-ink"
          >
            {t.catalog.resetAll}
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="flex h-10 items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 text-sm font-medium lg:hidden"
        >
          <IconSettings size={16} /> {t.catalog.filters}
          {chips.length > 0 && (
            <span className="rounded-full bg-brand px-1.5 text-xs leading-5 font-bold text-white">{chips.length}</span>
          )}
        </button>

        <div className="flex flex-1 flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => go(c.clear)}
              className="flex h-8 items-center gap-1.5 rounded-full bg-brand-soft pr-2.5 pl-3 text-sm font-medium text-brand-dark hover:bg-sand-2"
            >
              {c.label} <IconClose size={14} />
            </button>
          ))}
          {/* На компьютере «Сбросить всё» — над фильтрами */}
          {chips.length > 1 && (
            <button
              type="button"
              onClick={() => go({ q: '', forms: [], purposes: [], min: null, max: null, stock: false })}
              className="h-8 px-1 text-sm text-mute underline underline-offset-4 hover:text-ink lg:hidden"
            >
              {t.catalog.resetAll}
            </button>
          )}
        </div>

        <SelectMenu<SortId>
          label={t.catalog.sort}
          value={filters.sort}
          options={SORTS.map((x) => ({ id: x.id, label: t.sorts[x.id] }))}
          onChange={(sort) => go({ sort })}
        />
      </div>

      {/* Фильтры прилипают под шапкой при прокрутке. Обёртка высотой ровно с сетку товаров:
          липкий блок не выходит за родителя, поэтому останавливается на последнем ряду товаров */}
      <div className="hidden lg:block">
        <aside className="sticky top-32 rounded-[28px] bg-surface p-6 ring-1 ring-line">{panel}</aside>
      </div>

      <div className={`min-w-0 transition-opacity duration-200 ${pending ? 'pointer-events-none opacity-50' : ''}`} aria-busy={pending}>
        {children}
      </div>

      {footer && <div className="min-w-0 lg:col-start-2">{footer}</div>}

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.catalog.filters}>
          <button type="button" aria-label={t.catalog.close} onClick={() => setDrawer(false)} className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-xl bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-lg font-semibold">{t.catalog.filters}</span>
              <button type="button" onClick={() => setDrawer(false)} className="flex size-9 items-center justify-center rounded-full hover:bg-sand" aria-label={t.catalog.close}>
                <IconClose size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-6">{panel}</div>
            <div className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="h-12 w-full rounded-full bg-ink font-medium text-white"
              >
                {pending ? t.catalog.updating : fmt(t.catalog.show, { n: total })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  // Нет ни одного варианта (например, у товаров категории не отмечено назначение) — группу не показываем
  if (Array.isArray(children) && children.length === 0) return null
  return (
    <fieldset>
      <legend className="mb-3 text-[15px] font-semibold">{title}</legend>
      <div className="flex flex-col gap-2.5">{children}</div>
    </fieldset>
  )
}

function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[15px] text-ink-2 hover:text-ink">
      <input type="checkbox" className={checkbox} checked={checked} onChange={onChange} />
      <span className="flex-1">{label}</span>
      <span className="text-sm text-mute tabular-nums">{count}</span>
    </label>
  )
}

function PriceRange({
  min,
  max,
  labels,
  onApply,
}: {
  min: number | null
  max: number | null
  labels: { from: string; to: string; phFrom: string; phTo: string }
  onApply: (min: number | null, max: number | null) => void
}) {
  const [from, setFrom] = useState(min?.toString() ?? '')
  const [to, setTo] = useState(max?.toString() ?? '')

  const apply = () => {
    const parse = (v: string) => (v.trim() && Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : null)
    const a = parse(from)
    const b = parse(to)
    if (a !== min || b !== max) onApply(a, b)
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        apply()
      }}
    >
      <input
        inputMode="numeric"
        aria-label={labels.from}
        placeholder={labels.phFrom}
        value={from}
        onChange={(e) => setFrom(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={apply}
        className={`${input} h-10 text-sm`}
      />
      <span className="text-mute">–</span>
      <input
        inputMode="numeric"
        aria-label={labels.to}
        placeholder={labels.phTo}
        value={to}
        onChange={(e) => setTo(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={apply}
        className={`${input} h-10 text-sm`}
      />
      <button type="submit" className="sr-only">
        OK
      </button>
    </form>
  )
}

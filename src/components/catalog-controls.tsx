'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'
import { useI18n } from '@/i18n/client'
import { catalogHref, type Filters } from '@/lib/catalog'
import { FORMS, PURPOSES, SORTS, type SortId } from '@/lib/constants'
import { IconClose, IconSettings } from './icons'
import { SelectMenu } from './select-menu'
import { checkbox, input } from './ui'

type Facets = { forms: Record<string, number>; purposes: Record<string, number>; minPrice: number; maxPrice: number }

// Фильтры применяются сразу, без кнопки «Применить»: меняем URL, сервер отдаёт новый список.
export function CatalogControls({
  filters,
  facets,
  total,
  children,
}: {
  filters: Filters
  facets: Facets
  total: number
  children: ReactNode
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
      label: t.forms[id as keyof typeof t.forms] ?? id,
      clear: { forms: filters.forms.filter((x) => x !== id) },
    })),
    ...filters.purposes.map((id) => ({
      label: t.purposes[id as keyof typeof t.purposes] ?? id,
      clear: { purposes: filters.purposes.filter((x) => x !== id) },
    })),
    ...(filters.min !== null ? [{ label: fmt(t.catalog.chipFrom, { n: filters.min }), clear: { min: null } }] : []),
    ...(filters.max !== null ? [{ label: fmt(t.catalog.chipTo, { n: filters.max }), clear: { max: null } }] : []),
    ...(filters.stock ? [{ label: t.catalog.chipInStock, clear: { stock: false } }] : []),
  ]

  const panel = (
    <div className="flex flex-col gap-8">
      <FilterGroup title={t.catalog.form}>
        {FORMS.filter((f) => facets.forms[f.id] || filters.forms.includes(f.id)).map((f) => (
          <Check
            key={f.id}
            label={t.forms[f.id]}
            count={facets.forms[f.id] ?? 0}
            checked={filters.forms.includes(f.id)}
            onChange={() => toggle('forms', f.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t.catalog.purpose}>
        {PURPOSES.filter((p) => facets.purposes[p.id] || filters.purposes.includes(p.id)).map((p) => (
          <Check
            key={p.id}
            label={t.purposes[p.id]}
            count={facets.purposes[p.id] ?? 0}
            checked={filters.purposes.includes(p.id)}
            onChange={() => toggle('purposes', p.id)}
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
    <div className="grid gap-8 lg:grid-cols-[272px_1fr] lg:gap-8">
      <aside className="hidden h-fit rounded-[28px] bg-surface p-6 ring-1 ring-line lg:block">{panel}</aside>

      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center gap-3">
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
            {chips.length > 1 && (
              <button
                type="button"
                onClick={() => go({ q: '', forms: [], purposes: [], min: null, max: null, stock: false })}
                className="h-8 px-1 text-sm text-mute underline underline-offset-4 hover:text-ink"
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

        <div className={`transition-opacity duration-200 ${pending ? 'pointer-events-none opacity-50' : ''}`} aria-busy={pending}>
          {children}
        </div>
      </div>

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

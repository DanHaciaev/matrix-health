import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { CatalogControls } from '@/components/catalog-controls'
import { IconChevron } from '@/components/icons'
import { ProductCard } from '@/components/product-card'
import { btn, wrap } from '@/components/ui'
import { applyFilters, catalogHref, displayPrice, parseFilters, type Filters } from '@/lib/catalog'
import { getCatalog } from '@/lib/data'
import { plural } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Каталог',
  description: 'Пептиды, БАДы и таблетки с сертификатами анализа для каждой партии.',
}

export default function CatalogPage(props: PageProps<'/catalog'>) {
  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogView searchParams={props.searchParams} />
      </Suspense>
    </div>
  )
}

async function CatalogView({ searchParams }: Pick<PageProps<'/catalog'>, 'searchParams'>) {
  const filters = parseFilters(await searchParams)
  const { products, categories, certificates } = await getCatalog()

  const category = categories.find((c) => c.slug === filters.cat) ?? null
  const result = applyFilters(products, filters)
  const withDocs = new Set(certificates.map((c) => c.product_id))

  // Счётчики для фильтров — по текущей категории и поиску
  const scope = applyFilters(products, { ...filters, forms: [], purposes: [], min: null, max: null, stock: false, page: 1 })
  const scopeAll = products.filter((p) => !filters.cat || p.category?.slug === filters.cat)
  const facets = {
    forms: countBy(scopeAll.map((p) => [p.form])),
    purposes: countBy(scopeAll.map((p) => p.purposes)),
    minPrice: scopeAll.length ? Math.floor(Math.min(...scopeAll.map(displayPrice))) : 0,
    maxPrice: scopeAll.length ? Math.ceil(Math.max(...scopeAll.map(displayPrice))) : 0,
  }

  const title = category?.name ?? (filters.q ? `Поиск: «${filters.q}»` : 'Каталог')

  return (
    <>
      <Breadcrumbs items={category ? [{ href: '/catalog', label: 'Каталог' }, { label: category.name }] : [{ label: 'Каталог' }]} />

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] leading-none font-bold tracking-[-0.035em]">{title}</h1>
        <p className="text-[15px] text-mute tabular-nums">
          {result.total} {plural(result.total, 'товар', 'товара', 'товаров')}
        </p>
      </div>
      {category?.description && <p className="mt-3 max-w-xl text-ink-2">{category.description}</p>}

      <nav className="mt-7 mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Категории">
        <CatTab href={catalogHref({ ...filters, cat: null, page: 1 })} active={!filters.cat} label="Все товары" count={products.length} />
        {categories.map((c) => (
          <CatTab
            key={c.id}
            href={catalogHref({ ...filters, cat: c.slug, page: 1 })}
            active={filters.cat === c.slug}
            label={c.name}
            count={products.filter((p) => p.category_id === c.id).length}
          />
        ))}
      </nav>

      <CatalogControls filters={filters} facets={facets} total={result.total}>
        {result.items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {result.items.map((p) => (
                <ProductCard key={p.id} product={p} hasDocs={withDocs.has(p.id)} />
              ))}
            </div>
            <Pagination filters={filters} page={result.page} pages={result.pages} />
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center">
            <p className="text-xl font-medium">Ничего не нашлось</p>
            <p className="mx-auto mt-2 max-w-sm text-ink-2">
              {scope.total > 0
                ? 'Попробуйте убрать часть фильтров — без них подходит больше товаров.'
                : 'Проверьте написание или поищите по номеру партии на странице сертификатов.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={filters.cat ? catalogHref({ cat: filters.cat }) : '/catalog'} className={btn.outline}>
                Сбросить фильтры
              </Link>
              <Link href={`/certificates${filters.q ? `?q=${encodeURIComponent(filters.q)}` : ''}`} className={btn.ghost}>
                Искать в сертификатах
              </Link>
            </div>
          </div>
        )}
      </CatalogControls>
    </>
  )
}

function countBy(groups: string[][]) {
  const out: Record<string, number> = {}
  groups.flat().forEach((k) => (out[k] = (out[k] ?? 0) + 1))
  return out
}

function CatTab({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'page' : undefined}
      className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[15px] font-medium transition-colors ${
        active ? 'bg-ink text-white' : 'bg-surface text-ink-2 ring-1 ring-line hover:ring-brand hover:text-brand'
      }`}
    >
      {label}
      <span className="text-xs opacity-60 tabular-nums">{count}</span>
    </Link>
  )
}

function Pagination({ filters, page, pages }: { filters: Filters; page: number; pages: number }) {
  if (pages < 2) return null
  return (
    <nav aria-label="Страницы" className="mt-14 flex items-center justify-center gap-1.5">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={catalogHref({ ...filters, page: n })}
          aria-current={n === page ? 'page' : undefined}
          className={`flex size-10 items-center justify-center rounded-full text-[15px] font-medium tabular-nums ${
            n === page ? 'bg-ink text-white' : 'hover:bg-sand'
          }`}
        >
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link
          href={catalogHref({ ...filters, page: page + 1 })}
          aria-label="Следующая страница"
          className="flex size-10 items-center justify-center rounded-full hover:bg-sand"
        >
          <IconChevron />
        </Link>
      )}
    </nav>
  )
}

function CatalogSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-40 rounded bg-sand" />
      <div className="mt-6 h-12 w-64 rounded bg-sand" />
      <div className="mt-10 h-10 w-full max-w-lg rounded bg-sand" />
      <div className="mt-8 grid gap-12 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-5 rounded bg-sand" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] rounded-3xl bg-sand" />
              <div className="mt-3 h-4 w-3/4 rounded bg-sand" />
              <div className="mt-2 h-5 w-1/3 rounded bg-sand" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

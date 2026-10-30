import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { IconDownload } from '@/components/icons'
import { LotSearch } from '@/components/lot-search'
import { wrap } from '@/components/ui'
import { getCatalog, getSettings } from '@/lib/data'
import { date, plural } from '@/lib/format'
import type { Certificate } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Сертификаты',
  description: 'Сертификаты анализа и соответствия для каждой партии. Поиск по номеру LOT.',
}

export default function CertificatesPage(props: PageProps<'/certificates'>) {
  return (
    <>
      <section className={`${wrap} pt-6 lg:pt-8`}>
        <Breadcrumbs items={[{ label: 'Сертификаты' }]} />
        <div className="mt-5 grid gap-10 rounded-[32px] bg-mint px-6 py-10 sm:px-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-14 lg:py-14">
          <div>
            <h1 className="text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.02] font-bold tracking-[-0.035em]">
              Документы <span className="text-brand">о&nbsp;качестве</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-2">
              Все сертификаты по товарам и партиям. Введите номер с упаковки — найдём нужный документ.
            </p>
            <div className="mt-8">
              <Suspense fallback={<LotSearch />}>
                <SearchWithValue searchParams={props.searchParams} />
              </Suspense>
            </div>
          </div>

          <aside className="self-end rounded-[24px] bg-surface p-6">
            <p className="font-semibold">Где найти номер партии</p>
            <div className="my-5 flex justify-center rounded-2xl bg-paper py-6">
              <div className="flex h-20 w-44 flex-col justify-between rounded-lg bg-white p-3 shadow-[0_8px_20px_-10px_rgba(19,38,29,0.3)]">
                <div className="h-1.5 w-3/4 rounded-full bg-sand-2" />
                <div className="h-1.5 w-1/2 rounded-full bg-sand-2" />
                <span className="self-start rounded-md border-2 border-brand px-1.5 font-mono text-[11px]">LOT 0000-01</span>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-2">
              Ищите надпись LOT, BATCH или «Партия» на дне или боковой стороне упаковки.
            </p>
          </aside>
        </div>
      </section>

      <div className={`${wrap} pt-10`}>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-sand" />}>
          <Registry searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  )
}

async function SearchWithValue({ searchParams }: Pick<PageProps<'/certificates'>, 'searchParams'>) {
  const { q } = await searchParams
  return <LotSearch defaultValue={typeof q === 'string' ? q : ''} />
}

const norm = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/[\s-]/g, '').replace(/ё/g, 'е')

function matches(c: Certificate, q: string) {
  const needle = norm(q)
  return [c.batch, c.title, c.doc_type, c.lab, c.product?.name].some((v) => norm(v).includes(needle))
}

async function Registry({ searchParams }: Pick<PageProps<'/certificates'>, 'searchParams'>) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const cat = typeof params.cat === 'string' ? params.cat : ''
  const [{ certificates, categories }, s] = await Promise.all([getCatalog(), getSettings()])

  const list = certificates.filter((c) => (!cat || c.product?.category?.slug === cat) && (!q || matches(c, q)))
  const href = (next: { q?: string; cat?: string }) => {
    const qs = new URLSearchParams()
    const nq = next.q ?? q
    const nc = next.cat ?? cat
    if (nq) qs.set('q', nq)
    if (nc) qs.set('cat', nc)
    const str = qs.toString()
    return `/certificates${str ? `?${str}` : ''}`
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {[{ slug: '', name: 'Все' }, ...categories].map((c) => (
            <Link
              key={c.slug || 'all'}
              href={href({ cat: c.slug })}
              scroll={false}
              className={`h-9 rounded-full px-3.5 text-sm leading-9 font-medium ${
                cat === c.slug ? 'bg-ink text-white' : 'bg-sand text-ink-2 hover:bg-sand-2'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <p className="text-sm text-mute tabular-nums">
          {q && <>По запросу «{q}»: </>}
          {list.length} {plural(list.length, 'документ', 'документа', 'документов')}
          {q && (
            <Link href={href({ q: '' })} className="ml-3 text-ink underline underline-offset-4">
              сбросить
            </Link>
          )}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="text-xl font-medium">Документ не найден</p>
          <p className="mx-auto mt-2 max-w-md text-ink-2">
            Проверьте номер на упаковке. Если всё верно — напишите нам, пришлём сертификат в течение дня.
          </p>
          {s.telegram && (
            <a href={s.telegram} target="_blank" rel="noreferrer" className="mt-5 inline-block font-medium text-brand hover:underline">
              Написать в Telegram →
            </a>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          <table className="w-full text-[15px]">
            <thead className="hidden border-b border-line bg-sand/50 text-left text-sm text-mute md:table-header-group">
              <tr>
                <th className="px-5 py-3 font-normal">Документ</th>
                <th className="px-5 py-3 font-normal">Товар</th>
                <th className="px-5 py-3 font-normal">Партия</th>
                <th className="px-5 py-3 font-normal">Дата</th>
                <th className="px-5 py-3 font-normal">Лаборатория</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((c) => (
                <tr key={c.id} className="grid grid-cols-2 gap-x-4 gap-y-1 px-5 py-4 md:table-row md:p-0 md:hover:bg-paper">
                  <td className="col-span-2 md:px-5 md:py-4">
                    <span className="mr-2 inline-block rounded-sm bg-brand-soft px-1.5 py-0.5 text-xs font-medium text-brand-dark">
                      {c.doc_type}
                    </span>
                    <span className="font-medium">{c.title}</span>
                  </td>
                  <td className="col-span-2 md:px-5 md:py-4">
                    {c.product ? (
                      <Link href={`/product/${c.product.slug}`} className="hover:text-brand hover:underline">
                        {c.product.name}
                      </Link>
                    ) : (
                      <span className="text-mute">—</span>
                    )}
                  </td>
                  <td className="font-mono text-sm md:px-5 md:py-4">{c.batch ?? '—'}</td>
                  <td className="font-mono text-sm text-mute md:px-5 md:py-4">{date(c.issued_at)}</td>
                  <td className="col-span-2 text-sm text-ink-2 md:px-5 md:py-4">{c.lab ?? '—'}</td>
                  <td className="col-span-2 pt-2 md:px-5 md:py-4 md:text-right">
                    {c.file_url ? (
                      <a
                        href={c.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-3 text-sm font-medium whitespace-nowrap hover:border-ink"
                      >
                        <IconDownload size={16} /> Открыть PDF
                      </a>
                    ) : (
                      <span className="text-sm text-mute">по запросу</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-16 grid gap-8 border-t border-line pt-10 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="text-xl font-semibold">Что такое COA и HPLC?</h2>
          <p className="mt-3 leading-relaxed text-ink-2">
            COA (сертификат анализа) — документ лаборатории с результатами проверки конкретной партии: состав,
            чистота, соответствие заявленному. HPLC — отчёт о хроматографическом анализе, по нему видно чистоту
            вещества в процентах.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Не нашли документ?</h2>
          <p className="mt-3 leading-relaxed text-ink-2">
            Напишите нам номер партии — пришлём сертификат в течение рабочего дня. Если документа нет, мы честно
            об этом скажем.
          </p>
          {s.telegram && (
            <a href={s.telegram} target="_blank" rel="noreferrer" className="mt-4 inline-block font-medium text-brand hover:underline">
              Написать в Telegram →
            </a>
          )}
        </div>
      </div>
    </>
  )
}

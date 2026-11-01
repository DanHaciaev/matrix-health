import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { IconDownload } from '@/components/icons'
import { LotSearch } from '@/components/lot-search'
import { wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { telHref } from '@/lib/format'
import { getShop } from '@/lib/shop'
import type { Certificate } from '@/lib/types'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.meta.certificates, description: t.meta.certificatesDescription }
}

export default async function CertificatesPage(props: PageProps<'/[lang]/certificates'>) {
  const { t } = await getI18n()

  return (
    <>
      <section className={`${wrap} pt-6 lg:pt-8`}>
        <Breadcrumbs items={[{ label: t.nav.certificates }]} />
        <div className="mt-5 grid gap-10 rounded-[32px] bg-meadow px-6 py-10 sm:px-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-14 lg:py-14">
          <div>
            <h1 className="text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.02] font-bold tracking-[-0.035em]">
              {t.certs.titleStart} <span className="text-brand">{t.certs.titleAccent}</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-2">{t.certs.lead}</p>
            <div className="mt-8">
              <Suspense fallback={<LotSearch />}>
                <SearchWithValue searchParams={props.searchParams} />
              </Suspense>
            </div>
          </div>

          <aside className="self-end rounded-[24px] bg-surface p-6">
            <p className="font-semibold">{t.certs.whereTitle}</p>
            <div className="my-5 flex justify-center rounded-2xl bg-paper py-6">
              <div className="flex h-20 w-44 flex-col justify-between rounded-lg bg-white p-3 shadow-[0_8px_20px_-10px_rgba(15,26,68,0.3)]">
                <div className="h-1.5 w-3/4 rounded-full bg-sand-2" />
                <div className="h-1.5 w-1/2 rounded-full bg-sand-2" />
                <span className="self-start rounded-md border-2 border-brand px-1.5 font-mono text-[11px]">LOT 0000-01</span>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-2">{t.certs.whereText}</p>
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

async function SearchWithValue({ searchParams }: Pick<PageProps<'/[lang]/certificates'>, 'searchParams'>) {
  const { q } = await searchParams
  return <LotSearch defaultValue={typeof q === 'string' ? q : ''} />
}

const norm = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/[\s-]/g, '').replace(/ё/g, 'е')

function matches(c: Certificate, q: string) {
  const needle = norm(q)
  return [c.batch, c.title, c.doc_type, c.lab, c.product?.name].some((v) => norm(v).includes(needle))
}

async function Registry({ searchParams }: Pick<PageProps<'/[lang]/certificates'>, 'searchParams'>) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const cat = typeof params.cat === 'string' ? params.cat : ''
  const { i18n, catalog, settings: s } = await getShop()
  const { t, path, date, plural, fmt } = i18n

  const list = catalog.certificates.filter((c) => (!cat || c.product?.category?.slug === cat) && (!q || matches(c, q)))
  const href = (next: { q?: string; cat?: string }) => {
    const qs = new URLSearchParams()
    const nq = next.q ?? q
    const nc = next.cat ?? cat
    if (nq) qs.set('q', nq)
    if (nc) qs.set('cat', nc)
    const str = qs.toString()
    return path(`/certificates${str ? `?${str}` : ''}`)
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {[{ slug: '', name: t.certs.all }, ...catalog.categories].map((c) => (
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
          {q && fmt(t.certs.byQuery, { q })}
          {plural(list.length, t.certs.docs)}
          {q && (
            <Link href={href({ q: '' })} className="ml-3 text-ink underline underline-offset-4">
              {t.certs.reset}
            </Link>
          )}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="text-xl font-medium">{t.certs.notFoundTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-ink-2">{t.certs.notFoundText}</p>
          {s.phone && (
            <a href={telHref(s.phone)} className="mt-5 inline-block font-medium text-brand hover:underline">
              {fmt(t.certs.call, { phone: s.phone })}
            </a>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          <table className="w-full text-[15px]">
            <thead className="hidden border-b border-line bg-sand/50 text-left text-sm text-mute md:table-header-group">
              <tr>
                <th className="px-5 py-3 font-normal">{t.certs.colDocument}</th>
                <th className="px-5 py-3 font-normal">{t.certs.colProduct}</th>
                <th className="px-5 py-3 font-normal">{t.certs.colBatch}</th>
                <th className="px-5 py-3 font-normal">{t.certs.colDate}</th>
                <th className="px-5 py-3 font-normal">{t.certs.colLab}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((c) => (
                <tr key={c.id} className="grid grid-cols-2 gap-x-4 gap-y-1 px-5 py-4 md:table-row md:p-0 md:hover:bg-paper">
                  <td className="col-span-2 md:px-5 md:py-4">
                    <span className="mr-2 inline-block rounded-sm bg-brand-soft px-1.5 py-0.5 text-xs font-medium text-brand-dark">
                      {t.docTypes[c.doc_type] ?? c.doc_type}
                    </span>
                    <span className="font-medium">{c.title}</span>
                  </td>
                  <td className="col-span-2 md:px-5 md:py-4">
                    {c.product ? (
                      <Link href={path(`/product/${c.product.slug}`)} className="hover:text-brand hover:underline">
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
                        <IconDownload size={16} /> {t.certs.openPdf}
                      </a>
                    ) : (
                      <span className="text-sm text-mute">{t.certs.onRequest}</span>
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
          <h2 className="text-xl font-semibold">{t.certs.coaTitle}</h2>
          <p className="mt-3 leading-relaxed text-ink-2">{t.certs.coaText}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">{t.certs.missingTitle}</h2>
          <p className="mt-3 leading-relaxed text-ink-2">{t.certs.missingText}</p>
          {s.phone && (
            <a href={telHref(s.phone)} className="mt-4 inline-block font-medium text-brand hover:underline">
              {fmt(t.certs.call, { phone: s.phone })}
            </a>
          )}
        </div>
      </div>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHead } from '@/components/page-head'
import { btn, wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { getShop } from '@/lib/shop'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.meta.about }
}

export default async function AboutPage() {
  const { i18n, catalog, settings: s } = await getShop()
  const { t, path, fmt } = i18n
  const a = t.about

  const facts = [
    [String(catalog.products.length), a.factProducts],
    [String(catalog.certificates.length), a.factDocuments],
    [a.factStorageValue, a.factStorage],
    [a.factDeliveryValue, a.factDelivery],
  ]

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead
        crumb={t.meta.about}
        title={
          <>
            {fmt(a.titleStart, { store: s.store_name })} <span className="text-brand">{a.titleAccent}</span> {a.titleEnd}
          </>
        }
      />

      <div className="grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="max-w-2xl space-y-5 text-[17px] leading-[1.75] text-ink-2">
          {a.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href={path('/catalog')} className={btn.primary}>
              {a.toCatalog}
            </Link>
            <Link href={path('/certificates')} className={btn.outline}>
              {a.allCertificates}
            </Link>
          </div>
        </div>

        <dl className="grid h-fit grid-cols-2 border-t border-l border-line">
          {facts.map(([v, k]) => (
            <div key={k} className="border-r border-b border-line p-5">
              <dt className="sr-only">{k}</dt>
              <dd className="text-3xl font-bold tracking-[-0.03em] tabular-nums">{v}</dd>
              <dd className="mt-1 text-sm text-mute">{k}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

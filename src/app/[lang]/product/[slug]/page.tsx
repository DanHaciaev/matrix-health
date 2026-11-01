import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { BuyBox } from '@/components/buy-box'
import { DocRow } from '@/components/doc-row'
import { IconShield, IconSnow, IconTruck } from '@/components/icons'
import { ProductCard } from '@/components/product-card'
import { ProductGallery } from '@/components/product-gallery'
import { wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { filterName } from '@/lib/filters'
import { getShop, getShopProduct } from '@/lib/shop'

export async function generateMetadata(props: PageProps<'/[lang]/product/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const [data, { t }] = await Promise.all([getShopProduct(slug), getI18n()])
  if (!data) return { title: t.meta.productNotFound }
  return {
    title: data.product.name,
    description: data.product.short_description ?? undefined,
    openGraph: data.product.images[0] ? { images: [data.product.images[0]] } : undefined,
  }
}

export default function ProductPage(props: PageProps<'/[lang]/product/[slug]'>) {
  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductView params={props.params} />
      </Suspense>
    </div>
  )
}

async function ProductView({ params }: Pick<PageProps<'/[lang]/product/[slug]'>, 'params'>) {
  const { slug } = await params
  const [data, { i18n, catalog, settings }] = await Promise.all([getShopProduct(slug), getShop()])
  if (!data) notFound()
  const { t, path, money, plural, fmt } = i18n

  const { product: p, certificates, related } = data
  const withDocs = new Set(catalog.certificates.map((c) => c.product_id))
  const isCold = p.form === 'vials' || p.specs.some((s) => /\+2|\+8/.test(s.value))

  const sections = [
    p.description && { id: 'about', label: t.product.sectionAbout },
    p.composition.length > 0 && { id: 'composition', label: t.product.sectionComposition },
    p.usage && { id: 'usage', label: t.product.sectionUsage },
    { id: 'docs', label: `${t.product.sectionDocuments}${certificates.length ? ` (${certificates.length})` : ''}` },
  ].filter(Boolean) as { id: string; label: string }[]

  return (
    <>
      <Breadcrumbs
        items={[
          { href: path('/catalog'), label: t.nav.catalog },
          ...(p.category ? [{ href: path(`/catalog?cat=${p.category.slug}`), label: p.category.name }] : []),
          { label: p.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <ProductGallery images={p.images} form={p.form} name={p.name} pack={p.pack} tone={p.category?.sort} />

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mute">
            <span>{p.category?.name}</span>
            <span className="text-line-strong">·</span>
            <span>{filterName(catalog.filters, 'form', p.form)}</span>
            {p.is_new && <span className="font-medium text-signal">{t.product.new}</span>}
          </div>

          <h1 className="mt-3 text-[clamp(1.9rem,3.6vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            {p.name}
          </h1>
          {p.pack && <p className="mt-2 text-lg text-ink-2">{p.pack}</p>}
          {p.short_description && <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-2">{p.short_description}</p>}

          <p className="mt-4 font-mono text-[13px] text-mute">
            {p.sku && (
              <>
                {t.product.sku} {p.sku}
              </>
            )}
            {p.sku && p.batch && ' · '}
            {p.batch && (
              <>
                {t.product.batch} {p.batch}
              </>
            )}
          </p>

          <div className="mt-6">
            <BuyBox product={p} />
          </div>

          <ul className="mt-5 grid gap-3 text-sm text-ink-2 sm:grid-cols-3">
            <li className="flex items-start gap-2">
              <IconShield size={18} className="mt-px shrink-0 text-brand" />
              {certificates.length ? plural(certificates.length, t.product.docsCount) : t.product.docsOnRequest}
            </li>
            {settings.free_delivery_from > 0 && (
              <li className="flex items-start gap-2">
                <IconTruck size={18} className="mt-px shrink-0 text-brand" />
                {fmt(t.product.freeFrom, { price: money(settings.free_delivery_from) })}
              </li>
            )}
            {isCold && (
              <li className="flex items-start gap-2">
                <IconSnow size={18} className="mt-px shrink-0 text-brand" />
                {t.product.thermal}
              </li>
            )}
          </ul>

          {(p.specs.length > 0 || p.purposes.length > 0) && (
            <dl className="mt-8 rounded-3xl bg-surface px-5 text-[15px] ring-1 ring-line [&>div:last-child]:border-0">
              {p.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-[150px_1fr] gap-4 border-b border-line py-3 sm:grid-cols-[180px_1fr]">
                  <dt className="text-mute">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
              {p.purposes.length > 0 && (
                <div className="grid grid-cols-[150px_1fr] gap-4 border-b border-line py-3 sm:grid-cols-[180px_1fr]">
                  <dt className="text-mute">{t.product.purpose}</dt>
                  <dd>{p.purposes.map((x) => filterName(catalog.filters, 'purpose', x)).join(', ')}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>

      {/* ——— Подробности ——— */}
      <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-[200px_1fr] lg:gap-14">
        <nav className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none] lg:sticky lg:top-32 lg:flex-col lg:self-start lg:border-0">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full px-3 py-2 text-[15px] text-ink-2 hover:bg-sand hover:text-ink">
              {s.label}
            </a>
          ))}
        </nav>

        <div className="max-w-3xl space-y-14">
          {p.description && (
            <Section id="about" title={t.product.sectionAbout}>
              <Paragraphs text={p.description} />
            </Section>
          )}

          {p.composition.length > 0 && (
            <Section id="composition" title={t.product.sectionComposition}>
              <table className="w-full text-[15px]">
                <thead>
                  <tr className="border-b border-line-strong text-left text-sm text-mute">
                    <th className="py-2 font-normal">{t.product.component}</th>
                    <th className="py-2 text-right font-normal">{t.product.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {p.composition.map((row) => (
                    <tr key={row.name} className="border-b border-line">
                      <td className="py-3 pr-4">{row.name}</td>
                      <td className="py-3 text-right font-mono text-sm whitespace-nowrap">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {p.usage && (
            <Section id="usage" title={t.product.sectionUsage}>
              <Paragraphs text={p.usage} />
            </Section>
          )}

          <Section id="docs" title={t.product.sectionDocuments}>
            {certificates.length > 0 ? (
              <ul className="border-t border-line-strong">
                {certificates.map((c) => (
                  <DocRow key={c.id} cert={c} />
                ))}
              </ul>
            ) : (
              <p className="text-ink-2">{t.product.docsMissing}</p>
            )}
            <Link href={path('/certificates')} className="mt-5 inline-block text-[15px] font-medium text-brand hover:underline">
              {t.product.allCertificates} →
            </Link>
          </Section>

          {p.warning && <p className="rounded-2xl bg-signal-soft px-5 py-4 text-[15px] leading-relaxed text-ink-2">{p.warning}</p>}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-2xl font-semibold tracking-[-0.02em]">{t.product.related}</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} hasDocs={withDocs.has(r.id)} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-[17px] leading-[1.7] text-ink-2">
      {text.split(/\n{2,}/).map((para) => (
        <p key={para}>{para}</p>
      ))}
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32">
      <h2 className="mb-5 text-2xl font-semibold tracking-[-0.02em]">{title}</h2>
      {children}
    </section>
  )
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-56 rounded bg-sand" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="aspect-square rounded-3xl bg-sand" />
        <div className="space-y-4">
          <div className="h-4 w-32 rounded bg-sand" />
          <div className="h-12 w-4/5 rounded bg-sand" />
          <div className="h-5 w-2/3 rounded bg-sand" />
          <div className="mt-8 h-48 rounded-3xl bg-sand" />
        </div>
      </div>
    </div>
  )
}

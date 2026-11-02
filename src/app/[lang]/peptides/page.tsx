import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { IconArrow, IconCheck, IconShield } from '@/components/icons'
import { PageHead } from '@/components/page-head'
import { btn, wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { getShop, getShopPage } from '@/lib/shop'
import { TONES } from '@/lib/tones'
import type { PeptidesContent } from '@/lib/types'

// Текст страницы — в базе (таблица pages, Админка → «Страницы»); здесь только вёрстка
const SLUG = 'peptides'

export async function generateMetadata(): Promise<Metadata> {
  const [{ t }, p] = await Promise.all([getI18n(), getShopPage<PeptidesContent>(SLUG)])
  return { title: p ? `${p.titleStart} ${p.titleAccent}` : t.meta.peptides, description: p?.lead ?? t.meta.peptidesDescription }
}


export default async function PeptidesPage() {
  const [{ i18n, catalog }, p] = await Promise.all([getShop(), getShopPage<PeptidesContent>(SLUG)])
  // Пока не запущен supabase/pages.sql, страницы нет
  if (!p) notFound()
  const { t, path } = i18n
  const ui = t.peptidesPage
  const bySlug = new Map(catalog.products.map((x) => [x.slug, x]))
  const peptidesCategory = catalog.categories.find((c) => c.slug === 'peptides')

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead
        crumb={t.nav.peptides}
        title={
          <>
            {p.titleStart} <span className="text-brand">{p.titleAccent}</span>
          </>
        }
        lead={p.lead}
      />

      {/* ——— Что это ——— */}
      <section className="grid gap-8 py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
        <div>
          <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-bold tracking-[-0.03em]">{p.whatTitle}</h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-2">{p.whatText}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[28px] bg-brand p-7 text-white">
            <p className="text-sm font-semibold text-accent">{p.peptide}</p>
            {/* Короткая цепочка — несколько звеньев */}
            <div aria-hidden className="mt-4 flex gap-1.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="size-4 rounded-full bg-accent" />
              ))}
            </div>
            <p className="mt-5 leading-relaxed text-white/80">{p.peptideText}</p>
          </div>
          <div className="rounded-[28px] bg-surface p-7 ring-1 ring-line">
            <p className="text-sm font-semibold text-mute">{p.protein}</p>
            {/* Длинная цепочка */}
            <div aria-hidden className="mt-4 flex flex-wrap gap-1">
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} className="size-2.5 rounded-full bg-line-strong" />
              ))}
            </div>
            <p className="mt-5 leading-relaxed text-ink-2">{p.proteinText}</p>
          </div>
        </div>
      </section>

      {/* ——— Как работают ——— */}
      <section className="border-t border-line py-14">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{p.howTitle}</h2>
        <ol className="mt-6 grid gap-px overflow-hidden rounded-[28px] bg-line ring-1 ring-line md:grid-cols-3">
          {p.how.map((step, i) => (
            <li key={i} className="bg-surface p-6 lg:p-8">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
              <p className="mt-4 text-lg font-semibold">{step.title}</p>
              <p className="mt-1.5 leading-relaxed text-ink-2">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ——— Что изучают ——— */}
      <section className="border-t border-line py-14">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{p.areasTitle}</h2>
        <p className="mt-2 max-w-2xl text-ink-2">{p.areasNote}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {p.areas.map((area, i) => {
            const tone = TONES[i % TONES.length]
            const products = (area.products ?? []).map((slug) => bySlug.get(slug)).filter((x) => x !== undefined)
            return (
              <article key={i} className={`flex flex-col rounded-[28px] p-6 lg:p-7 ${tone.bg}`}>
                <h3 className={`text-lg font-bold ${tone.text}`}>{area.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{area.text}</p>
                {products.length > 0 && (
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                    <span className="text-sm text-mute">{ui.inCatalog}</span>
                    {products.map((x) => (
                      <Link
                        key={x.id}
                        href={path(`/product/${x.slug}`)}
                        className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-ink transition-colors hover:bg-white"
                      >
                        {x.name}
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      {/* ——— Как применяют ——— */}
      <section className="grid gap-10 border-t border-line py-14 lg:grid-cols-[260px_1fr] lg:gap-16">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{p.useTitle}</h2>
        <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {p.use.map((u) => (
            <div key={u.title}>
              <dt className="text-lg font-semibold">{u.title}</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-2">{u.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ——— Что важно знать ——— */}
      <section className="rounded-[32px] bg-brand-dark px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
        <h2 className="flex items-center gap-3 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-bold tracking-[-0.03em]">
          <IconShield size={30} className="shrink-0 text-accent" /> {p.safetyTitle}
        </h2>
        <ul className="mt-8 grid gap-x-10 gap-y-7 md:grid-cols-2">
          {p.safety.map((s) => (
            <li key={s.title} className="flex gap-4">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/12 text-accent">
                <IconCheck size={16} strokeWidth={2.4} />
              </span>
              <span>
                <span className="block text-lg font-semibold">{s.title}</span>
                <span className="mt-1 block leading-relaxed text-white/75">{s.text}</span>
              </span>
            </li>
          ))}
        </ul>
        <Link href={path('/certificates')} className="mt-8 inline-block font-semibold text-accent hover:underline">
          {ui.checkCertificates}
        </Link>
      </section>

      {/* ——— Вопросы и что дальше ——— */}
      <section className="grid gap-6 pt-14 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[32px] bg-surface p-6 ring-1 ring-line sm:p-10">
          <h2 className="text-3xl font-bold tracking-[-0.025em]">{p.faqTitle}</h2>
          <div className="mt-6">
            {p.faq.map(({ q, a }, i) => (
              <details key={q} open={i === 0} className="group border-b border-line last:border-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-sand transition-colors group-open:bg-brand before:absolute before:h-[2px] before:w-3 before:rounded-full before:bg-ink group-open:before:bg-white after:absolute after:h-3 after:w-[2px] after:rounded-full after:bg-ink after:transition-transform group-open:after:scale-y-0" />
                </summary>
                <p className="max-w-2xl pb-5 text-[15px] leading-relaxed text-ink-2">{a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[32px] bg-periwinkle p-6 sm:p-10">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.025em]">{p.ctaTitle}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{p.ctaText}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link href={path('/consultation')} className={btn.dark}>
              {ui.ctaConsult} <IconArrow size={18} />
            </Link>
            <Link
              href={path(peptidesCategory ? `/catalog?cat=${peptidesCategory.slug}` : '/catalog')}
              className={`${btn.outline} border-ink/20 bg-white/60`}
            >
              {ui.ctaCatalog}
            </Link>
          </div>
        </div>
      </section>

      <p className="mt-8 max-w-2xl text-sm text-mute">{p.disclaimer}</p>
    </div>
  )
}

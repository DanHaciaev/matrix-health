import Link from 'next/link'
import { IconArrow, IconPhone, IconSend, IconShield, IconSnow, IconTruck } from '@/components/icons'
import { LabSheet } from '@/components/lab-sheet'
import { LotSearch } from '@/components/lot-search'
import { ProductCard } from '@/components/product-card'
import { ProductVisual } from '@/components/product-visual'
import { btn, wrap } from '@/components/ui'
import { telHref } from '@/lib/format'
import { getShop } from '@/lib/shop'
import { tone } from '@/lib/tones'
import type { Product } from '@/lib/types'

export default async function HomePage() {
  const { i18n, catalog, settings: s } = await getShop()
  const { t, path, money, plural, fmt } = i18n
  const { products, categories, certificates } = catalog

  const withDocs = new Set(certificates.map((c) => c.product_id))
  const popular = [...products].sort((a, b) => Number(b.is_popular) - Number(a.is_popular)).slice(0, 8)
  const heroCert = certificates.find((c) => c.batch) ?? certificates[0]

  // На витрину первого экрана — три товара: сначала по одному из разных категорий,
  // потом добираем любыми, чтобы витрина не была пустой при одной категории
  const firstPerCategory = categories
    .map((c) => products.find((p) => p.category_id === c.id))
    .filter((p): p is Product => Boolean(p))
  const showcase = [...firstPerCategory, ...products.filter((p) => !firstPerCategory.includes(p))].slice(0, 3)

  const features = [
    { icon: <IconShield size={22} />, ...t.home.features[0] },
    { icon: <IconSnow size={22} />, ...t.home.features[1] },
    { icon: <IconPhone size={22} />, ...t.home.features[2] },
    {
      icon: <IconTruck size={22} />,
      title: t.home.featureDeliveryTitle,
      text: s.free_delivery_from > 0 ? fmt(t.home.featureDeliveryFree, { price: money(s.free_delivery_from) }) : t.home.featureDeliveryNext,
    },
  ]

  return (
    <>
      {/* ——— Первый экран ——— */}
      <section className={`${wrap} pt-4 lg:pt-6`}>
        <div className="relative overflow-hidden rounded-[32px] bg-brand text-white lg:rounded-[40px]">
          <div aria-hidden className="absolute -top-40 -right-40 size-[560px] rounded-full bg-white/[0.06]" />
          {/* Зелёная «подушка» — как основание фигуры на логотипе */}
          <div aria-hidden className="absolute -bottom-40 -left-32 size-[420px] rounded-full bg-sage/30 blur-2xl" />

          <div className="relative grid gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-16 lg:py-20">
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-sm font-medium">
                <IconShield size={16} className="text-accent" /> {t.home.badge}
              </span>
              <h1 className="mt-6 text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance">
                {t.home.titleStart} <span className="text-accent">{t.home.titleAccent}</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">{t.home.lead}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={path('/catalog')}
                  className="inline-flex h-13 items-center gap-2 rounded-full bg-accent px-7 text-[16px] font-semibold text-brand-dark transition-transform hover:scale-[1.02]"
                >
                  {t.home.ctaCatalog} <IconArrow size={18} />
                </Link>
                <Link
                  href={path('/certificates')}
                  className="inline-flex h-13 items-center rounded-full border border-white/35 px-7 text-[16px] font-medium hover:bg-white/10"
                >
                  {t.home.ctaCheck}
                </Link>
              </div>

              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
                <Stat value={String(products.length)} label={plural(products.length, t.home.statProducts)} />
                <Stat value={String(certificates.length)} label={plural(certificates.length, t.home.statDocuments)} />
                <Stat value={t.home.statDeliveryValue} label={t.home.statDeliveryLabel} />
              </dl>
            </div>

            {showcase.length > 0 && (
              <div className="relative flex min-h-[340px] items-end justify-center sm:min-h-[420px]">
                <div aria-hidden className="absolute bottom-10 left-1/2 aspect-square w-[min(440px,92%)] -translate-x-1/2 rounded-full bg-white/10" />
                <div aria-hidden className="absolute bottom-6 left-1/2 h-8 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/15 blur-md" />
                <div className="relative mb-10 flex items-end gap-2 sm:gap-6">
                  {showcase.map((p, i) => (
                    <div key={p.id} className={i === 1 ? 'z-10 mb-2 scale-110 sm:scale-125' : 'scale-90 sm:scale-100'}>
                      <ProductVisual form={p.form} alt={p.name} name={p.name} pack={p.pack} tone={p.category?.sort} />
                    </div>
                  ))}
                </div>

                {heroCert?.batch && (
                  <Link
                    href={path(`/certificates?q=${encodeURIComponent(heroCert.batch)}`)}
                    className="absolute top-2 right-0 flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 text-ink shadow-xl transition-transform hover:-translate-y-0.5 sm:top-6"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <IconShield size={20} />
                    </span>
                    <span className="text-sm leading-tight">
                      <span className="block font-semibold">{t.home.batchVerified}</span>
                      <span className="font-mono text-xs text-mute">LOT {heroCert.batch}</span>
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ——— Почему нам доверяют ——— */}
      <section className={`${wrap} pt-6`}>
        <ul className="grid gap-px overflow-hidden rounded-[28px] bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title} className="flex items-start gap-4 bg-surface p-5 lg:p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">{f.icon}</span>
              <span>
                <span className="block font-semibold">{f.title}</span>
                <span className="mt-0.5 block text-sm leading-snug text-mute">{f.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ——— Категории ——— */}
      {/* Плитки категорий имеют смысл, только когда направлений несколько */}
      {categories.length > 1 && (
        <section className={`${wrap} pt-20 lg:pt-24`}>
          <SectionHead title={t.home.chooseDirection} link={{ href: path('/catalog'), label: t.home.allCatalog }} />
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((c) => {
              const ct = tone(c.sort)
              const items = products.filter((p) => p.category_id === c.id)
              const pics = items.slice(0, 2)
              return (
                <Link
                  key={c.id}
                  href={path(`/catalog?cat=${c.slug}`)}
                  className={`group relative flex min-h-[260px] flex-col overflow-hidden rounded-[28px] p-7 ${ct.bg}`}
                >
                  <span className="text-[28px] leading-none font-bold tracking-[-0.025em]">{c.name}</span>
                  {c.description && <span className="mt-2 max-w-[60%] text-[15px] text-ink-2">{c.description}</span>}
                  <span className={`mt-auto text-sm font-semibold ${ct.text}`}>{plural(items.length, t.catalog.items)}</span>
                  <span className="absolute right-6 bottom-6 flex items-end gap-1 transition-transform duration-300 group-hover:-translate-y-1">
                    {pics.map((p, i) => (
                      <span key={p.id} className={i === 0 ? 'origin-bottom scale-[0.78]' : 'origin-bottom -ml-6 scale-[0.62]'}>
                        <ProductVisual form={p.form} alt="" name={p.name} pack={p.pack} tone={c.sort} />
                      </span>
                    ))}
                  </span>
                  <span className="absolute top-6 right-6 flex size-11 items-center justify-center rounded-full bg-white text-ink transition-colors group-hover:bg-ink group-hover:text-white">
                    <IconArrow size={18} />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ——— Популярное ——— */}
      {popular.length > 0 && (
        <section className={`${wrap} pt-20 lg:pt-24`}>
          <SectionHead title={t.home.popular} link={{ href: path('/catalog'), label: t.home.seeAll }} />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} hasDocs={withDocs.has(p.id)} />
            ))}
          </div>
        </section>
      )}

      {/* ——— Проверка партии ——— */}
      <section className={`${wrap} pt-20 lg:pt-24`}>
        <div className="grid gap-10 overflow-hidden rounded-[32px] bg-meadow px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-16 lg:py-16">
          <div>
            <h2 className="text-[clamp(1.9rem,3.6vw,2.75rem)] leading-[1.08] font-bold tracking-[-0.03em] text-balance">
              {t.home.verifyTitle}
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-2">{t.home.verifyLead}</p>

            <ol className="mt-8 space-y-4">
              {t.home.verifySteps.map((step, i) => (
                <li key={step} className="flex items-center gap-4 text-[16px] font-medium">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-8">
              <LotSearch />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <LabSheet cert={heroCert} className="w-full max-w-md" />
          </div>
        </div>
      </section>

      {/* ——— Вопросы ——— */}
      <section className={`${wrap} grid gap-6 pt-20 lg:grid-cols-[1.5fr_1fr] lg:pt-24`}>
        <div className="rounded-[32px] bg-surface p-6 ring-1 ring-line sm:p-10">
          <h2 className="text-3xl font-bold tracking-[-0.025em]">{t.home.faqTitle}</h2>
          <div className="mt-6">
            {t.home.faq.map(({ q, a }, i) => (
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
            <h2 className="text-3xl font-bold tracking-[-0.025em]">{t.home.questionsTitle}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{t.home.questionsText}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {s.telegram && (
              <a href={s.telegram} target="_blank" rel="noreferrer" className={btn.dark}>
                <IconSend size={18} /> {t.home.writeTelegram}
              </a>
            )}
            {s.phone && (
              <a href={telHref(s.phone)} className={`${btn.outline} border-ink/20 bg-white/60`}>
                <IconPhone size={18} /> {s.phone}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="text-2xl font-bold tracking-[-0.02em] tabular-nums">{value}</dd>
      <dd className="text-sm text-white/65">{label}</dd>
    </div>
  )
}

function SectionHead({ title, link }: { title: string; link: { href: string; label: string } }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-bold tracking-[-0.03em]">{title}</h2>
      <Link href={link.href} className="flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-brand hover:underline">
        {link.label} <IconArrow size={16} />
      </Link>
    </div>
  )
}

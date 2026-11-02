import Link from 'next/link'
import { telHref } from '@/lib/format'
import { getShop } from '@/lib/shop'
import { Logo } from './logo'
import { wrap } from './ui'

export async function SiteFooter() {
  const { i18n, catalog, settings: s } = await getShop()
  const { t, path } = i18n

  return (
    <footer className="mt-24 bg-brand-dark text-white">
      <div className={`${wrap} grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:py-16`}>
        <div className="max-w-xs">
          <Logo name={s.store_name} href={path('/')} light />
          {s.tagline && <p className="mt-4 text-sm leading-relaxed text-white/70">{s.tagline}</p>}
        </div>

        <FooterCol title={t.footer.catalog}>
          {catalog.categories.map((c) => (
            <Link key={c.id} href={path(`/catalog?cat=${c.slug}`)}>
              {c.name}
            </Link>
          ))}
          <Link href={path('/catalog?sort=new')}>{t.nav.newArrivals}</Link>
        </FooterCol>

        <FooterCol title={t.footer.customers}>
          <Link href={path('/peptides')}>{t.nav.peptides}</Link>
          <Link href={path('/consultation')}>{t.nav.consultation}</Link>
          <Link href={path('/certificates')}>{t.nav.certificates}</Link>
          <Link href={path('/delivery')}>{t.nav.deliveryFull}</Link>
          <Link href={path('/about')}>{t.nav.about}</Link>
          <Link href={path('/contacts')}>{t.nav.contacts}</Link>
        </FooterCol>

        <FooterCol title={t.footer.contact}>
          {s.phone && (
            <a href={telHref(s.phone)} className="text-lg font-semibold text-white tabular-nums">
              {s.phone}
            </a>
          )}
          {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
          {s.address && <span className="text-white/60">{s.address}</span>}
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className={`${wrap} flex flex-col gap-3 py-6 text-[13px] leading-relaxed text-white/55 md:flex-row md:items-center md:justify-between`}>
          <p className="max-w-2xl">{t.footer.disclaimer}</p>
          <div className="flex gap-5">
            <Link href={path('/privacy')} className="hover:text-white">
              {t.nav.privacy}
            </Link>
            <span>© {s.store_name}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 text-[15px] text-white/80 [&_a:hover]:text-accent">
      <p className="mb-1 text-sm font-semibold text-white">{title}</p>
      {children}
    </div>
  )
}

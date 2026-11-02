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
      {/* Блоки переносятся по одному, когда не хватает места (строки — от левого края),
          а когда всё помещается в одну строку — расходятся по ширине */}
      <div className={`${wrap} flex flex-wrap gap-x-16 gap-y-10 py-14 lg:justify-between lg:py-16`}>
        <div className="w-72 max-w-full">
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
            <a href={telHref(s.phone)} className="text-lg font-semibold whitespace-nowrap text-white tabular-nums">
              {s.phone}
            </a>
          )}
          {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
          {s.address && <span className="text-white/60">{s.address}</span>}
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className={`${wrap} flex flex-wrap items-center gap-x-10 gap-y-3 py-6 text-[13px] leading-relaxed text-white/55 lg:justify-between`}>
          <p className="max-w-2xl">{t.footer.disclaimer}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={path('/privacy')} className="hover:text-white">
              {t.nav.privacy}
            </Link>
            <span>© {s.store_name}</span>
            {/* Подпись разработчика — одинаковая на всех языках */}
            <span>Made by SIMP</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-44 flex-col gap-2.5 text-[15px] text-white/80 [&_a:hover]:text-accent">
      <p className="mb-1 text-sm font-semibold text-white">{title}</p>
      {children}
    </div>
  )
}

import Link from 'next/link'
import { getCatalog, getSettings } from '@/lib/data'
import { telHref } from '@/lib/format'
import { Logo } from './logo'
import { wrap } from './ui'

export async function SiteFooter() {
  const [s, { categories }] = await Promise.all([getSettings(), getCatalog()])

  return (
    <footer className="mt-24 bg-brand-dark text-white">
      <div className={`${wrap} grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:py-16`}>
        <div className="max-w-xs">
          <Logo name={s.store_name} light />
          {s.tagline && <p className="mt-4 text-sm leading-relaxed text-white/70">{s.tagline}</p>}
        </div>

        <FooterCol title="Каталог">
          {categories.map((c) => (
            <Link key={c.id} href={`/catalog?cat=${c.slug}`}>
              {c.name}
            </Link>
          ))}
          <Link href="/catalog?sort=new">Новинки</Link>
        </FooterCol>

        <FooterCol title="Покупателям">
          <Link href="/certificates">Сертификаты</Link>
          <Link href="/delivery">Доставка и оплата</Link>
          <Link href="/about">О магазине</Link>
          <Link href="/contacts">Контакты</Link>
        </FooterCol>

        <FooterCol title="Связаться">
          {s.phone && (
            <a href={telHref(s.phone)} className="text-lg font-semibold text-white tabular-nums">
              {s.phone}
            </a>
          )}
          {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
          {s.telegram && (
            <a href={s.telegram} target="_blank" rel="noreferrer">
              Написать в Telegram
            </a>
          )}
          {s.address && <span className="text-white/60">{s.address}</span>}
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className={`${wrap} flex flex-col gap-3 py-6 text-[13px] leading-relaxed text-white/55 md:flex-row md:items-center md:justify-between`}>
          <p className="max-w-2xl">БАД не является лекарственным средством. Перед применением проконсультируйтесь со специалистом.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">
              Политика конфиденциальности
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
    <div className="flex flex-col gap-2.5 text-[15px] text-white/80 [&_a:hover]:text-sun">
      <p className="mb-1 text-sm font-semibold text-white">{title}</p>
      {children}
    </div>
  )
}

import Form from 'next/form'
import Link from 'next/link'
import { getCatalog, getSettings } from '@/lib/data'
import { lei, telHref } from '@/lib/format'
import { CartLink } from './cart-link'
import { IconPhone, IconSearch, IconShield, IconTruck } from './icons'
import { Logo } from './logo'
import { MobileMenu } from './mobile-menu'
import { wrap } from './ui'

export async function SiteHeader() {
  const [settings, { categories }] = await Promise.all([getSettings(), getCatalog()])

  const nav = [
    { href: '/catalog', label: 'Каталог' },
    ...categories.map((c) => ({ href: `/catalog?cat=${c.slug}`, label: c.name })),
    { href: '/certificates', label: 'Сертификаты' },
    { href: '/delivery', label: 'Доставка' },
  ]

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand text-[13px] text-white">
        <div className={`${wrap} flex h-9 items-center justify-between gap-6`}>
          <p className="flex items-center gap-5">
            {settings.free_delivery_from > 0 && (
              <span className="flex items-center gap-1.5">
                <IconTruck size={15} className="text-sun" /> Бесплатная доставка от {lei(settings.free_delivery_from)}
              </span>
            )}
            <Link href="/certificates" className="hidden items-center gap-1.5 hover:underline sm:flex">
              <IconShield size={15} className="text-sun" /> Документы к каждой партии
            </Link>
          </p>
          <div className="hidden items-center gap-5 md:flex">
            {settings.working_hours && <span className="text-white/75">{settings.working_hours}</span>}
            {settings.telegram && (
              <a href={settings.telegram} className="hover:underline" target="_blank" rel="noreferrer">
                Telegram
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
        <div className={`${wrap} flex h-16 items-center gap-4 lg:h-[76px] lg:gap-6`}>
          <Logo name={settings.store_name} />

          <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Основное меню">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-[15px] font-medium text-ink-2 transition-colors hover:bg-brand-soft hover:text-brand-dark"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1 lg:hidden" />

          <Form action="/catalog" className="relative ml-auto hidden max-w-80 min-w-44 flex-1 md:block">
            <IconSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" />
            <input
              name="q"
              type="search"
              placeholder="Поиск товаров"
              aria-label="Поиск по каталогу"
              className="h-11 w-full rounded-full border border-transparent bg-sand pr-4 pl-10 text-sm outline-none placeholder:text-mute focus:border-brand focus:bg-surface focus:ring-4 focus:ring-brand/10"
            />
          </Form>

          {settings.phone && (
            <a
              href={telHref(settings.phone)}
              className="hidden items-center gap-2 text-[15px] font-semibold whitespace-nowrap tabular-nums hover:text-brand 2xl:flex"
            >
              <IconPhone size={18} className="text-brand" />
              {settings.phone}
            </a>
          )}

          <CartLink />
          <MobileMenu items={nav} phone={settings.phone} phoneHref={telHref(settings.phone)} />
        </div>
      </div>
    </header>
  )
}

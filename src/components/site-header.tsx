import Form from 'next/form'
import Link from 'next/link'
import { Suspense } from 'react'
import { telHref } from '@/lib/format'
import { getShop } from '@/lib/shop'
import { CartLink } from './cart-link'
import { IconPhone, IconSearch, IconShield, IconTruck } from './icons'
import { LangSwitcher, LangSwitcherFallback } from './lang-switcher'
import { Logo } from './logo'
import { MobileMenu } from './mobile-menu'
import { wrap } from './ui'

export async function SiteHeader() {
  const { i18n, catalog, settings } = await getShop()
  const { t, path, money, lang } = i18n

  // В шапке только главные разделы. Категории — на главной и в каталоге, а в мобильном меню — всё.
  const mainNav = [
    { href: path('/catalog'), label: t.nav.catalog },
    { href: path('/certificates'), label: t.nav.certificates },
    { href: path('/delivery'), label: t.nav.delivery },
    { href: path('/contacts'), label: t.nav.contacts, wideOnly: true },
  ]

  const mobileNav = [
    { href: path('/catalog'), label: t.nav.allCatalog },
    ...catalog.categories.map((c) => ({ href: path(`/catalog?cat=${c.slug}`), label: c.name })),
    { href: path('/certificates'), label: t.nav.certificates },
    { href: path('/delivery'), label: t.nav.deliveryFull },
    { href: path('/contacts'), label: t.nav.contacts },
  ]

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand text-[13px] text-white">
        <div className={`${wrap} flex h-9 items-center justify-between gap-6`}>
          <p className="flex min-w-0 items-center gap-5">
            {settings.free_delivery_from > 0 && (
              <span className="flex items-center gap-1.5 truncate">
                <IconTruck size={15} className="shrink-0 text-accent" />{' '}
                {i18n.fmt(t.header.freeDelivery, { price: money(settings.free_delivery_from) })}
              </span>
            )}
            <Link href={path('/certificates')} className="hidden items-center gap-1.5 hover:underline lg:flex">
              <IconShield size={15} className="text-accent" /> {t.header.docs}
            </Link>
          </p>
          <div className="hidden shrink-0 items-center gap-5 md:flex">
            {settings.working_hours && <span className="hidden text-white/70 xl:inline">{settings.working_hours}</span>}
            {settings.telegram && (
              <a href={settings.telegram} className="hover:underline" target="_blank" rel="noreferrer">
                Telegram
              </a>
            )}
            {settings.phone && (
              <a href={telHref(settings.phone)} className="flex items-center gap-1.5 font-semibold tabular-nums hover:underline">
                <IconPhone size={14} className="text-accent" />
                {settings.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
        <div className={`${wrap} flex h-16 items-center gap-3 lg:h-[76px] lg:gap-8`}>
          <Logo name={settings.store_name} href={path('/')} className="shrink-0" />

          <nav className="hidden items-center gap-1 lg:flex" aria-label={t.nav.mainMenu}>
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-[15px] font-medium whitespace-nowrap text-ink-2 transition-colors hover:bg-brand-soft hover:text-brand-dark ${
                  item.wideOnly ? 'hidden xl:block' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <Form action={path('/catalog')} className="relative hidden w-full max-w-72 min-w-40 md:block">
            <IconSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" />
            <input
              name="q"
              type="search"
              placeholder={t.header.search}
              aria-label={t.header.searchAria}
              className="h-11 w-full rounded-full border border-transparent bg-sand pr-4 pl-10 text-sm outline-none placeholder:text-mute focus:border-brand focus:bg-surface focus:ring-4 focus:ring-brand/10"
            />
          </Form>

          <div className="hidden sm:block">
            <Suspense fallback={<LangSwitcherFallback lang={lang} />}>
              <LangSwitcher />
            </Suspense>
          </div>

          <CartLink />
          <MobileMenu
            items={mobileNav}
            phone={settings.phone}
            phoneHref={telHref(settings.phone)}
            searchAction={path('/catalog')}
            langSwitcher={
              <Suspense fallback={<LangSwitcherFallback lang={lang} />}>
                <LangSwitcher align="left" />
              </Suspense>
            }
          />
        </div>
      </div>
    </header>
  )
}

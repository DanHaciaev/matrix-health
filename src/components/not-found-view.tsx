import Link from 'next/link'
import { getI18n } from '@/i18n/server'
import { LotSearch } from './lot-search'
import { btn, wrap } from './ui'

export async function NotFoundView({ product }: { product?: boolean }) {
  const { t, path } = await getI18n()

  return (
    <div className={`${wrap} grid gap-10 py-20 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-20 lg:py-32`}>
      <p className="text-[clamp(6rem,18vw,13rem)] leading-none font-bold tracking-[-0.05em] text-brand-soft">404</p>
      <div>
        <h1 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-0.03em]">
          {product ? t.notFound.productTitle : t.notFound.title}
        </h1>
        <p className="mt-3 max-w-md text-lg text-ink-2">{t.notFound.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={path('/catalog')} className={btn.primary}>
            {t.notFound.toCatalog}
          </Link>
          <Link href={path('/')} className={btn.outline}>
            {t.notFound.home}
          </Link>
        </div>
        <div className="mt-10 max-w-xl">
          <LotSearch />
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { IconCheck } from '@/components/icons'
import { btn, wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { telHref, orderNo } from '@/lib/format'
import { getShop } from '@/lib/shop'
import { ClearCart } from './clear-cart'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.meta.success, robots: { index: false } }
}

export default async function SuccessPage(props: PageProps<'/[lang]/checkout/success'>) {
  const { i18n, settings: s } = await getShop()
  const { t, path, fmt } = i18n

  return (
    <div className={`${wrap} py-16 lg:py-28`}>
      <ClearCart />
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand text-white">
          <IconCheck size={28} />
        </span>
        <h1 className="mt-6 text-[clamp(2rem,4.5vw,3rem)] leading-tight font-bold tracking-[-0.03em]">{t.success.title}</h1>
        <Suspense fallback={<p className="mt-3 h-7" />}>
          <OrderNumber searchParams={props.searchParams} label={t.success.number} />
        </Suspense>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          {fmt(t.success.text, { hours: s.working_hours ? ` (${s.working_hours})` : '' })}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href={path('/catalog')} className={btn.primary}>
            {t.success.back}
          </Link>
          {s.phone && (
            <a href={telHref(s.phone)} className={btn.outline}>
              {s.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

async function OrderNumber({
  searchParams,
  label,
}: Pick<PageProps<'/[lang]/checkout/success'>, 'searchParams'> & { label: string }) {
  const { n } = await searchParams
  const number = typeof n === 'string' && /^\d+$/.test(n) && n !== '0' ? n : null
  if (!number) return null
  return (
    <p className="mt-3 text-lg">
      {label} <span className="font-mono font-medium">№ {orderNo(number)}</span>
    </p>
  )
}

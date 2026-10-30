import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { IconCheck } from '@/components/icons'
import { btn, wrap } from '@/components/ui'
import { getSettings } from '@/lib/data'
import { telHref } from '@/lib/format'
import { ClearCart } from './clear-cart'

export const metadata: Metadata = { title: 'Заказ принят', robots: { index: false } }

export default async function SuccessPage(props: PageProps<'/checkout/success'>) {
  const s = await getSettings()

  return (
    <div className={`${wrap} py-16 lg:py-28`}>
      <ClearCart />
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand text-white">
          <IconCheck size={28} />
        </span>
        <h1 className="mt-6 text-[clamp(2rem,4.5vw,3rem)] leading-tight font-bold tracking-[-0.03em]">Спасибо, заказ принят</h1>
        <Suspense fallback={<p className="mt-3 h-7" />}>
          <OrderNumber searchParams={props.searchParams} />
        </Suspense>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          Мы перезвоним в течение часа в рабочее время{s.working_hours ? ` (${s.working_hours})` : ''}, чтобы
          подтвердить состав и время доставки.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/catalog" className={btn.primary}>
            Вернуться в каталог
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

async function OrderNumber({ searchParams }: Pick<PageProps<'/checkout/success'>, 'searchParams'>) {
  const { n } = await searchParams
  const number = typeof n === 'string' && /^\d+$/.test(n) && n !== '0' ? n : null
  if (!number) return null
  return (
    <p className="mt-3 text-lg">
      Номер заказа: <span className="font-mono font-medium">№ {number}</span>
    </p>
  )
}

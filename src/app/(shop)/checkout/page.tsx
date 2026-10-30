import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { wrap } from '@/components/ui'
import { getSettings } from '@/lib/data'
import { CheckoutForm } from './checkout-form'

export const metadata: Metadata = { title: 'Оформление заказа', robots: { index: false } }

export default async function CheckoutPage() {
  const s = await getSettings()

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <Breadcrumbs items={[{ href: '/cart', label: 'Корзина' }, { label: 'Оформление' }]} />
      <h1 className="mt-5 mb-10 text-[clamp(2rem,4.5vw,3.25rem)] leading-none font-bold tracking-[-0.035em]">
        Оформление заказа
      </h1>
      <CheckoutForm deliveryCost={s.delivery_cost} freeFrom={s.free_delivery_from} address={s.address} />
    </div>
  )
}

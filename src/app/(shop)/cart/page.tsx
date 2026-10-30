import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { wrap } from '@/components/ui'
import { getSettings } from '@/lib/data'
import { CartView } from './cart-view'

export const metadata: Metadata = { title: 'Корзина', robots: { index: false } }

export default async function CartPage() {
  const s = await getSettings()

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <Breadcrumbs items={[{ label: 'Корзина' }]} />
      <h1 className="mt-5 mb-10 text-[clamp(2rem,4.5vw,3.25rem)] leading-none font-bold tracking-[-0.035em]">Корзина</h1>
      <CartView deliveryCost={s.delivery_cost} freeFrom={s.free_delivery_from} />
    </div>
  )
}

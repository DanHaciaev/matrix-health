import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { getCatalog, getSettings } from '@/lib/data'
import { CartView } from './cart-view'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.meta.cart, robots: { index: false } }
}

export default async function CartPage() {
  const [s, { t }, { products }] = await Promise.all([getSettings(), getI18n(), getCatalog()])

  // Остатки по ключу строки корзины (товар:вариант) — корзина в браузере могла устареть
  const stock: Record<string, number> = {}
  for (const p of products) {
    stock[`${p.id}:`] = p.stock
    for (const v of p.variants) stock[`${p.id}:${v.id}`] = v.stock
  }

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <Breadcrumbs items={[{ label: t.cart.title }]} />
      <h1 className="mt-5 mb-10 text-[clamp(2rem,4.5vw,3.25rem)] leading-none font-bold tracking-[-0.035em]">{t.cart.title}</h1>
      <CartView deliveryCost={s.delivery_cost} freeFrom={s.free_delivery_from} stock={stock} />
    </div>
  )
}

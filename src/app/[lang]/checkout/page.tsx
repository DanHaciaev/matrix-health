import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { mailConfig } from '@/lib/mail'
import { getShop } from '@/lib/shop'
import { CheckoutForm } from './checkout-form'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.meta.checkout, robots: { index: false } }
}

export default async function CheckoutPage() {
  const { i18n, settings: s } = await getShop()
  const { t, path } = i18n

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <Breadcrumbs items={[{ href: path('/cart'), label: t.checkout.crumbCart }, { label: t.checkout.crumbCheckout }]} />
      <h1 className="mt-5 mb-10 text-[clamp(2rem,4.5vw,3.25rem)] leading-none font-bold tracking-[-0.035em]">{t.checkout.title}</h1>
      <CheckoutForm deliveryCost={s.delivery_cost} freeFrom={s.free_delivery_from} emailCopy={mailConfig.configured} />
    </div>
  )
}

import type { Metadata } from 'next'
import { PageHead } from '@/components/page-head'
import { wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { getShop } from '@/lib/shop'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.meta.delivery }
}

export default async function DeliveryPage() {
  const { i18n, settings: s } = await getShop()
  const { t, money, fmt } = i18n
  const d = t.delivery
  const paid = s.free_delivery_from > 0 ? fmt(d.price, { cost: money(s.delivery_cost), free: money(s.free_delivery_from) }) : money(s.delivery_cost)

  // Доставляет только курьер магазина
  const methods = [{ title: d.courierTitle, time: d.courierTime, price: paid, text: d.courierText }]

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead crumb={t.meta.delivery} title={t.meta.delivery} lead={d.lead} />

      <section className="grid gap-10 py-14 lg:grid-cols-[260px_1fr] lg:gap-16">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{d.methodsTitle}</h2>
        <div className="border-t border-line-strong">
          {methods.map((m) => (
            <div key={m.title} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[1fr_1.3fr] sm:gap-8">
              <div>
                <p className="text-lg font-medium">{m.title}</p>
                <p className="mt-1 text-sm text-mute">
                  {m.time} · {m.price}
                </p>
              </div>
              <p className="leading-relaxed text-ink-2">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 border-t border-line py-14 lg:grid-cols-[260px_1fr] lg:gap-16">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{d.storageTitle}</h2>
        <div className="max-w-2xl space-y-4 text-[17px] leading-relaxed text-ink-2">
          <p>{d.storage1}</p>
          <p>{d.storage2}</p>
        </div>
      </section>

      <section className="grid gap-10 border-t border-line py-14 lg:grid-cols-[260px_1fr] lg:gap-16">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{d.paymentTitle}</h2>
        <div className="max-w-2xl">
          {s.payment_info ? (
            <p className="text-[17px] leading-relaxed whitespace-pre-line text-ink-2">{s.payment_info}</p>
          ) : (
            <ul className="space-y-3 text-[17px] text-ink-2">
              {d.payment.map((line) => (
                <li key={line}>— {line}</li>
              ))}
            </ul>
          )}
          {s.delivery_info && <p className="mt-6 leading-relaxed whitespace-pre-line text-ink-2">{s.delivery_info}</p>}
        </div>
      </section>

      <section className="grid gap-10 border-t border-line py-14 lg:grid-cols-[260px_1fr] lg:gap-16">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{d.returnsTitle}</h2>
        <p className="max-w-2xl text-[17px] leading-relaxed text-ink-2">{d.returnsText}</p>
      </section>
    </div>
  )
}

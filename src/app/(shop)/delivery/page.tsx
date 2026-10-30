import type { Metadata } from 'next'
import { PageHead } from '@/components/page-head'
import { wrap } from '@/components/ui'
import { getSettings } from '@/lib/data'
import { lei } from '@/lib/format'

export const metadata: Metadata = { title: 'Доставка и оплата' }

export default async function DeliveryPage() {
  const s = await getSettings()

  const methods = [
    {
      title: 'Курьер по Кишинёву',
      time: 'на следующий день',
      price: `${lei(s.delivery_cost)}, от ${lei(s.free_delivery_from)} — бесплатно`,
      text: 'Курьер позвонит за час до приезда. Заказы, оформленные до 15:00, часто привозим в тот же день.',
    },
    {
      title: 'Почта Молдовы',
      time: '2–4 рабочих дня',
      price: `${lei(s.delivery_cost)}, от ${lei(s.free_delivery_from)} — бесплатно`,
      text: 'Отправляем в любой населённый пункт. Номер для отслеживания пришлём в SMS или Telegram.',
    },
    {
      title: 'Самовывоз',
      time: 'в день заказа',
      price: 'бесплатно',
      text: s.address ? `Пункт выдачи: ${s.address}. ${s.working_hours ?? ''}` : 'Адрес пункта выдачи сообщит менеджер.',
    },
  ]

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead crumb="Доставка и оплата" title="Доставка и оплата" lead="Везём по всей Молдове. Платите при получении — после того, как проверите заказ." />

      <section className="grid gap-10 py-14 lg:grid-cols-[260px_1fr] lg:gap-16">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">Способы доставки</h2>
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
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">Хранение в пути</h2>
        <div className="max-w-2xl space-y-4 text-[17px] leading-relaxed text-ink-2">
          <p>
            Пептиды во флаконах требуют температуры +2…+8 °C. Мы упаковываем их в термопакет с хладоэлементом —
            он держит температуру до суток.
          </p>
          <p>Таблетки, капсулы и порошки едут в обычной упаковке: им достаточно комнатной температуры.</p>
        </div>
      </section>

      <section className="grid gap-10 border-t border-line py-14 lg:grid-cols-[260px_1fr] lg:gap-16">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">Оплата</h2>
        <div className="max-w-2xl">
          {s.payment_info ? (
            <p className="text-[17px] leading-relaxed whitespace-pre-line text-ink-2">{s.payment_info}</p>
          ) : (
            <ul className="space-y-3 text-[17px] text-ink-2">
              <li>— наличными курьеру или в пункте выдачи;</li>
              <li>— картой при получении (у курьера есть терминал);</li>
              <li>— переводом на карту после подтверждения заказа.</li>
            </ul>
          )}
          {s.delivery_info && <p className="mt-6 leading-relaxed whitespace-pre-line text-ink-2">{s.delivery_info}</p>}
        </div>
      </section>

      <section className="grid gap-10 border-t border-line py-14 lg:grid-cols-[260px_1fr] lg:gap-16">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">Возврат</h2>
        <p className="max-w-2xl text-[17px] leading-relaxed text-ink-2">
          Если пришёл не тот товар или упаковка повреждена — напишите нам в течение 3 дней, заменим за наш счёт.
          Вскрытые БАДы и пептиды, хранившиеся без контроля температуры, вернуть нельзя.
        </p>
      </section>
    </div>
  )
}

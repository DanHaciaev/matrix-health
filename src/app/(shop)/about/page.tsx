import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHead } from '@/components/page-head'
import { btn, wrap } from '@/components/ui'
import { getCatalog, getSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'О магазине' }

export default async function AboutPage() {
  const [s, { products, certificates }] = await Promise.all([getSettings(), getCatalog()])

  const facts = [
    [String(products.length), 'товаров в каталоге'],
    [String(certificates.length), 'документов в открытом доступе'],
    ['+2…+8 °C', 'хранение пептидов'],
    ['1 день', 'доставка по Кишинёву'],
  ]

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead
        crumb="О магазине"
        title={
          <>
            {s.store_name} — магазин, где <span className="text-brand">документы</span> важнее
            рекламы
          </>
        }
      />

      <div className="grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="max-w-2xl space-y-5 text-[17px] leading-[1.75] text-ink-2">
          <p>
            Мы начинали с простого вопроса покупателей: «А чем вы докажете, что это то, что написано на банке?».
            Ответ — сертификат анализа конкретной партии. С тех пор мы не берём в продажу товар, к которому нет
            документов.
          </p>
          <p>
            Каждая поставка проходит проверку: сверяем номер партии, срок годности и условия хранения. Документы
            выкладываем на сайт — их может открыть любой, без регистрации и запросов.
          </p>
          <p>
            Мы не ставим диагнозы и не обещаем чудес. Если сомневаетесь, нужен ли вам товар, — спросите нас или
            своего врача.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/catalog" className={btn.primary}>
              Смотреть каталог
            </Link>
            <Link href="/certificates" className={btn.outline}>
              Все сертификаты
            </Link>
          </div>
        </div>

        <dl className="grid h-fit grid-cols-2 border-t border-l border-line">
          {facts.map(([v, k]) => (
            <div key={k} className="border-r border-b border-line p-5">
              <dt className="sr-only">{k}</dt>
              <dd className="text-3xl font-bold tracking-[-0.03em] tabular-nums">{v}</dd>
              <dd className="mt-1 text-sm text-mute">{k}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

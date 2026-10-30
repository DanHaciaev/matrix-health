import type { Metadata } from 'next'
import { PageHead } from '@/components/page-head'
import { wrap } from '@/components/ui'
import { getSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'Политика конфиденциальности' }

export default async function PrivacyPage() {
  const s = await getSettings()

  const sections: [string, string][] = [
    [
      'Какие данные мы собираем',
      'Имя, телефон, email (если вы его указали), адрес доставки и комментарий к заказу. Мы не просим и не храним данные банковских карт.',
    ],
    ['Зачем', 'Только чтобы связаться с вами, подтвердить и доставить заказ. Рассылок без вашего согласия мы не делаем.'],
    [
      'Кому передаём',
      'Курьерской службе или Почте Молдовы — в объёме, необходимом для доставки. Больше никому.',
    ],
    ['Сколько храним', 'Данные заказа хранятся 3 года для учёта и гарантийных случаев, затем удаляются.'],
    [
      'Ваши права',
      `Вы можете попросить показать, исправить или удалить ваши данные. Напишите на ${s.email ?? 'нашу почту'} или позвоните${s.phone ? ` по номеру ${s.phone}` : ''}.`,
    ],
  ]

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead
        crumb="Политика конфиденциальности"
        title="Политика конфиденциальности"
        lead={`Как ${s.store_name} обращается с персональными данными покупателей. Текст-шаблон — отредактируйте его под ваш магазин.`}
      />
      <div className="max-w-3xl py-14">
        {sections.map(([title, text], i) => (
          <section key={title} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[40px_1fr]">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">{i + 1}</span>
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 leading-relaxed text-ink-2">{text}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

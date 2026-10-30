import type { Metadata } from 'next'
import { IconPhone, IconSend } from '@/components/icons'
import { PageHead } from '@/components/page-head'
import { wrap } from '@/components/ui'
import { getSettings } from '@/lib/data'
import { telHref } from '@/lib/format'

export const metadata: Metadata = { title: 'Контакты' }

export default async function ContactsPage() {
  const s = await getSettings()

  const rows: [string, React.ReactNode][] = [
    ...(s.phone ? [['Телефон', <a key="p" href={telHref(s.phone)} className="tabular-nums hover:text-brand">{s.phone}</a>] as [string, React.ReactNode]] : []),
    ...(s.email ? [['Email', <a key="e" href={`mailto:${s.email}`} className="hover:text-brand">{s.email}</a>] as [string, React.ReactNode]] : []),
    ...(s.telegram ? [['Telegram', <a key="t" href={s.telegram} target="_blank" rel="noreferrer" className="hover:text-brand">Написать в чат</a>] as [string, React.ReactNode]] : []),
    ...(s.address ? [['Адрес', s.address] as [string, React.ReactNode]] : []),
    ...(s.working_hours ? [['Часы работы', s.working_hours] as [string, React.ReactNode]] : []),
  ]

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead crumb="Контакты" title="Контакты" lead="Отвечаем на звонки и сообщения в рабочее время. Поможем выбрать товар, проверить партию или изменить заказ." />

      <div className="grid gap-12 py-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <dl className="border-t border-line-strong text-lg">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[180px_1fr] sm:gap-6">
              <dt className="text-[15px] text-mute">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="h-fit rounded-[32px] bg-brand p-8 text-white sm:p-10">
          <p className="text-2xl font-semibold tracking-[-0.02em]">Быстрее всего — в Telegram</p>
          <p className="mt-3 leading-relaxed text-white/70">
            Пришлите фото упаковки или номер партии — пришлём документ и ответим на вопросы.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {s.telegram && (
              <a href={s.telegram} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-sun px-6 font-semibold text-ink hover:brightness-105">
                <IconSend size={18} /> Открыть чат
              </a>
            )}
            {s.phone && (
              <a href={telHref(s.phone)} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 font-medium hover:border-white">
                <IconPhone size={18} /> Позвонить
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { AdminTitle, Card } from '@/components/admin/parts'
import { ServiceForm } from '@/components/admin/service-form'
import { requireAdmin } from '@/lib/admin/auth'
import type { Service } from '@/lib/types'

export const metadata = { title: 'Услуги' }

export default async function ServicesPage() {
  const { sb } = await requireAdmin()
  const { data, error } = await sb.from('services').select('*').order('sort')
  // Таблицы нет, пока не запущен supabase/services.sql
  const ready = !error
  const services = (data ?? []).map((row) => ({ ...row, price: row.price === null ? null : Number(row.price) })) as Service[]

  return (
    <>
      <AdminTitle
        title="Услуги"
        sub={
          <>
            Консультация и сопровождение на странице «Консультация». Заявки приходят в раздел{' '}
            <Link href="/admin/requests" className="text-brand hover:underline">
              «Заявки»
            </Link>
            .
          </>
        }
      />

      {!ready && (
        <p className="mb-6 max-w-3xl rounded-lg border border-signal/30 bg-signal-soft px-4 py-3 text-sm text-ink-2">
          <b className="text-signal">Нужно один раз выполнить SQL.</b> Откройте Supabase → SQL Editor и запустите файл{' '}
          <code className="font-mono">supabase/services.sql</code> — он создаст услуги и таблицу для заявок.
        </p>
      )}

      <Card title="Услуги на сайте">
        <p className="-mt-1 mb-2 text-sm text-mute">
          Если цену не указать, на сайте будет «Цена по запросу». Для сопровождения выберите оплату «За месяц» — к цене
          добавится «/ мес.». Пустые переводы заменяются английским или русским текстом.
        </p>
        <div className="divide-y divide-line">
          {services.map((s) => (
            // Ключ меняется после сохранения — форма подхватывает новые значения
            <ServiceForm key={`${s.id}-${JSON.stringify(s)}`} service={s} />
          ))}
        </div>
        <div className="mt-2 border-t border-line-strong pt-2">
          <p className="pt-3 text-sm font-medium">Новая услуга</p>
          <ServiceForm key={services.length} service={null} disabled={!ready} />
        </div>
      </Card>
    </>
  )
}

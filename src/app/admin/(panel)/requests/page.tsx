import Link from 'next/link'
import { AdminTitle, Empty } from '@/components/admin/parts'
import { RequestNote, RequestStatusSelect } from '@/components/admin/request-controls'
import { requireAdmin } from '@/lib/admin/auth'
import { CONTACT_LABELS, REQUEST_STATUSES } from '@/lib/constants'
import { dateTime, eur } from '@/lib/format'
import type { ServiceRequest } from '@/lib/types'

export const metadata = { title: 'Заявки' }

const PER_PAGE = 30

/** Ссылка, чтобы сразу написать клиенту в выбранный им мессенджер */
function contactHref(method: string, phone: string) {
  const digits = phone.replace(/\D/g, '')
  switch (method) {
    case 'telegram':
      return `https://t.me/+${digits}`
    case 'whatsapp':
      return `https://wa.me/${digits}`
    case 'viber':
      return `viber://chat?number=%2B${digits}`
    default:
      return `tel:+${digits}`
  }
}

export default async function RequestsPage(props: PageProps<'/admin/requests'>) {
  const { sb } = await requireAdmin()
  const params = await props.searchParams
  const status = typeof params.status === 'string' ? params.status : ''
  const page = Math.max(1, Number(params.page) || 1)

  let query = sb
    .from('service_requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
  if (status) query = query.eq('status', status)

  const [{ data, count, error }, counts] = await Promise.all([query, sb.from('service_requests').select('status')])
  const requests = (data ?? []) as ServiceRequest[]
  const byStatus = (counts.data ?? []).reduce<Record<string, number>>((acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc), {})
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE))

  const href = (patch: { status?: string; page?: number }) => {
    const qs = new URLSearchParams()
    const next = { status, page: 1, ...patch }
    if (next.status) qs.set('status', next.status)
    if (next.page > 1) qs.set('page', String(next.page))
    const s = qs.toString()
    return `/admin/requests${s ? `?${s}` : ''}`
  }

  if (error) {
    return (
      <>
        <AdminTitle title="Заявки" sub="Заявки на консультацию и сопровождение" />
        <p className="max-w-3xl rounded-lg border border-signal/30 bg-signal-soft px-4 py-3 text-sm text-ink-2">
          <b className="text-signal">Нужно один раз выполнить SQL.</b> Откройте Supabase → SQL Editor и запустите файл{' '}
          <code className="font-mono">supabase/services.sql</code>.
        </p>
      </>
    )
  }

  return (
    <>
      <AdminTitle title="Заявки" sub={`На консультацию и сопровождение · всего: ${counts.data?.length ?? 0}`}>
        <Link href="/admin/services" className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-3.5 text-sm font-medium hover:border-ink">
          Услуги и цены
        </Link>
      </AdminTitle>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {[{ id: '', label: 'Все' }, ...REQUEST_STATUSES].map((s) => (
          <Link
            key={s.id || 'all'}
            href={href({ status: s.id })}
            className={`flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium ${
              status === s.id ? 'bg-ink text-white' : 'bg-surface text-ink-2 ring-1 ring-line hover:ring-ink'
            }`}
          >
            {s.label}
            {s.id && byStatus[s.id] ? <span className="text-xs opacity-60 tabular-nums">{byStatus[s.id]}</span> : null}
          </Link>
        ))}
      </div>

      {!requests.length ? (
        <Empty>{status ? 'С таким статусом заявок нет.' : 'Заявок пока нет. Они появятся здесь сразу после отправки формы на странице «Консультация».'}</Empty>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {requests.map((r) => (
            <li
              key={r.id}
              className={`grid gap-x-8 gap-y-3 p-5 md:grid-cols-[220px_1fr_auto] ${r.status === 'new' ? 'bg-signal-soft/30' : ''}`}
            >
              <div className="text-[15px]">
                <p className="text-sm text-mute">
                  <span className="font-mono">№{r.number}</span> · {dateTime(r.created_at)}
                </p>
                <p className="mt-1 font-semibold">{r.customer_name}</p>
                <a href={`tel:${r.phone}`} className="block text-ink-2 tabular-nums hover:text-ink">
                  {r.phone}
                </a>
                <a
                  href={contactHref(r.contact_method, r.phone)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm font-medium text-brand hover:underline"
                >
                  Связь: {CONTACT_LABELS[r.contact_method] ?? r.contact_method}
                </a>
              </div>

              <div className="min-w-0">
                <p className="font-medium">
                  {r.service_name}
                  {r.price !== null && (
                    <span className="ml-2 text-sm font-normal text-mute tabular-nums">
                      {eur(Number(r.price))}
                      {r.period === 'month' ? ' / мес.' : ''}
                    </span>
                  )}
                </p>
                {r.comment ? (
                  <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed whitespace-pre-line text-ink-2">{r.comment}</p>
                ) : (
                  <p className="mt-1.5 text-sm text-mute">Цель не указана</p>
                )}
                <RequestNote key={r.admin_note ?? ''} id={r.id} note={r.admin_note} />
              </div>

              <div>
                <RequestStatusSelect id={r.id} status={r.status} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-1.5">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={href({ page: n })}
              className={`flex size-9 items-center justify-center rounded-md text-sm ${n === page ? 'bg-ink text-white' : 'hover:bg-sand'}`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

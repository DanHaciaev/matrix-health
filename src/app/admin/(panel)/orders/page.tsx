import Form from 'next/form'
import Link from 'next/link'
import { StatusSelect } from '@/components/admin/controls'
import { AdminTitle, Empty } from '@/components/admin/parts'
import { IconSearch } from '@/components/icons'
import { requireAdmin } from '@/lib/admin/auth'
import { DELIVERY_METHODS, ORDER_STATUSES } from '@/lib/constants'
import { dateTime, eur } from '@/lib/format'

export const metadata = { title: 'Заказы' }

const PER_PAGE = 30

export default async function OrdersPage(props: PageProps<'/admin/orders'>) {
  const { sb } = await requireAdmin()
  const params = await props.searchParams
  const status = typeof params.status === 'string' ? params.status : ''
  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const page = Math.max(1, Number(params.page) || 1)

  let query = sb
    .from('orders')
    .select('id, number, status, customer_name, phone, city, delivery_method, total, created_at, items:order_items(qty)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  if (status) query = query.eq('status', status)
  if (q) {
    const safe = q.replace(/[,()%]/g, ' ')
    query = /^\d+$/.test(safe)
      ? query.or(`number.eq.${safe},phone.ilike.%${safe}%`)
      : query.or(`customer_name.ilike.%${safe}%,phone.ilike.%${safe}%`)
  }

  const [{ data: orders, count }, counts] = await Promise.all([query, sb.from('orders').select('status')])
  const byStatus = (counts.data ?? []).reduce<Record<string, number>>((acc, o) => ((acc[o.status] = (acc[o.status] ?? 0) + 1), acc), {})
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE))

  const href = (patch: Record<string, string | number>) => {
    const qs = new URLSearchParams()
    const next = { status, q, page: 1, ...patch }
    if (next.status) qs.set('status', String(next.status))
    if (next.q) qs.set('q', String(next.q))
    if (Number(next.page) > 1) qs.set('page', String(next.page))
    const s = qs.toString()
    return `/admin/orders${s ? `?${s}` : ''}`
  }

  return (
    <>
      <AdminTitle title="Заказы" sub={`Всего: ${counts.data?.length ?? 0}`} />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[{ id: '', label: 'Все' }, ...ORDER_STATUSES].map((s) => (
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
        <Form action="/admin/orders" className="relative w-full sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mute" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Номер, имя или телефон"
            className="h-9 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-brand"
          />
        </Form>
      </div>

      {!orders?.length ? (
        <Empty>{q || status ? 'Ничего не найдено. Попробуйте изменить фильтр.' : 'Заказов пока нет.'}</Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[760px] text-[15px]">
            <thead className="border-b border-line text-left text-sm text-mute">
              <tr>
                <th className="px-4 py-3 font-normal">№</th>
                <th className="px-4 py-3 font-normal">Покупатель</th>
                <th className="px-4 py-3 font-normal">Доставка</th>
                <th className="px-4 py-3 font-normal">Сумма</th>
                <th className="px-4 py-3 font-normal">Дата</th>
                <th className="px-4 py-3 font-normal">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className={`hover:bg-paper ${o.status === 'new' ? 'bg-signal-soft/30' : ''}`}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono font-medium text-brand hover:underline">
                      {o.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brand">
                      {o.customer_name}
                    </Link>
                    <a href={`tel:${o.phone}`} className="block text-sm text-mute tabular-nums hover:text-ink">
                      {o.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-2">
                    {DELIVERY_METHODS.find((d) => d.id === o.delivery_method)?.label}
                    {o.city && <span className="block text-mute">{o.city}</span>}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {eur(Number(o.total))}
                    <span className="block text-sm text-mute">{(o.items as { qty: number }[]).reduce((s, i) => s + i.qty, 0)} шт.</span>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-ink-2">{dateTime(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusSelect id={o.id} status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

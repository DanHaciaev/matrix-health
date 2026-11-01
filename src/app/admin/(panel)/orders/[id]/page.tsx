import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StatusSelect } from '@/components/admin/controls'
import { AdminTitle, Card, StatusBadge } from '@/components/admin/parts'
import { IconArrowLeft, IconPhone } from '@/components/icons'
import { btn } from '@/components/ui'
import { requireAdmin } from '@/lib/admin/auth'
import { DELIVERY_LABELS, PAYMENT_METHODS } from '@/lib/constants'
import { dateTime, eur, telHref } from '@/lib/format'
import type { Order, OrderItem } from '@/lib/types'
import { NoteForm } from './note-form'

export const metadata = { title: 'Заказ' }

export default async function OrderPage(props: PageProps<'/admin/orders/[id]'>) {
  const { sb } = await requireAdmin()
  const { id } = await props.params

  const { data } = await sb.from('orders').select('*, items:order_items(*)').eq('id', id).maybeSingle()
  if (!data) notFound()
  const order = data as Order & { items: OrderItem[] }

  const rows: [string, React.ReactNode][] = [
    ['Телефон', <a key="p" href={telHref(order.phone)} className="font-medium text-brand tabular-nums hover:underline">{order.phone}</a>],
    ['Email', order.email ?? '—'],
    ['Доставка', DELIVERY_LABELS[order.delivery_method] ?? order.delivery_method],
    ['Адрес', [order.city, order.address].filter(Boolean).join(', ') || '—'],
    ['Оплата', PAYMENT_METHODS.find((p) => p.id === order.payment_method)?.label],
  ]

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink">
        <IconArrowLeft size={16} /> Все заказы
      </Link>
      <AdminTitle
        title={`Заказ №${order.number}`}
        sub={
          <span className="flex flex-wrap items-center gap-2">
            {dateTime(order.created_at)} <StatusBadge status={order.status} />
          </span>
        }
      >
        <a href={telHref(order.phone)} className={btn.smallPrimary}>
          <IconPhone size={16} /> Позвонить
        </a>
        <StatusSelect id={order.id} status={order.status} />
      </AdminTitle>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card title="Состав заказа">
            <table className="w-full text-[15px]">
              <tbody className="divide-y divide-line">
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-3 pr-4">
                      {i.product_id ? (
                        <Link href={`/admin/products/${i.product_id}`} className="font-medium hover:text-brand">
                          {i.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{i.name}</span>
                      )}
                      {i.variant_label && <span className="block text-sm text-mute">{i.variant_label}</span>}
                    </td>
                    <td className="py-3 pr-4 text-right whitespace-nowrap text-ink-2 tabular-nums">
                      {eur(Number(i.price))} × {i.qty}
                    </td>
                    <td className="py-3 text-right font-medium whitespace-nowrap tabular-nums">{eur(Number(i.price) * i.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 space-y-1.5 border-t border-ink pt-4 text-[15px]">
              <div className="flex justify-between text-ink-2">
                <dt>Товары</dt>
                <dd className="tabular-nums">{eur(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between text-ink-2">
                <dt>Доставка</dt>
                <dd className="tabular-nums">{Number(order.delivery_cost) ? eur(Number(order.delivery_cost)) : 'бесплатно'}</dd>
              </div>
              <div className="flex justify-between pt-1 text-lg font-semibold">
                <dt>Итого</dt>
                <dd className="tabular-nums">{eur(Number(order.total))}</dd>
              </div>
            </dl>
          </Card>

          {order.comment && (
            <Card title="Комментарий покупателя">
              <p className="whitespace-pre-line text-ink-2">{order.comment}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title={order.customer_name}>
            <dl className="space-y-3 text-[15px]">
              {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[90px_1fr] gap-3">
                  <dt className="text-mute">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Заметка менеджера">
            <NoteForm id={order.id} note={order.admin_note} />
          </Card>
        </div>
      </div>
    </>
  )
}

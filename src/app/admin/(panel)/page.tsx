import Link from 'next/link'
import { Suspense } from 'react'
import { StatusSelect } from '@/components/admin/controls'
import { AdminTitle, Card, Empty } from '@/components/admin/parts'
import { AdminSkeleton } from '@/components/admin/skeleton'
import { requireAdmin } from '@/lib/admin/auth'
import { dateTime, lei } from '@/lib/format'

export const metadata = { title: 'Обзор' }

// Границы периодов считаются на момент запроса (админка всегда динамическая)
function periods() {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return { since: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(), today }
}

// Обзор лежит на уровне самой панели, поэтому вместо loading.tsx — свой Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Dashboard />
    </Suspense>
  )
}

async function Dashboard() {
  const { sb } = await requireAdmin()
  const { since, today } = periods()

  const [month, recent, products, certs] = await Promise.all([
    sb.from('orders').select('total, status, created_at').gte('created_at', since),
    sb.from('orders').select('id, number, customer_name, phone, total, status, created_at').order('created_at', { ascending: false }).limit(8),
    sb.from('products').select('id, name, stock, is_published, variants:product_variants(stock)'),
    sb.from('certificates').select('id', { count: 'exact', head: true }),
  ])

  const orders = (month.data ?? []).filter((o) => o.status !== 'cancelled')
  const revenue = orders.reduce((s, o) => s + Number(o.total), 0)
  const newCount = (month.data ?? []).filter((o) => o.status === 'new').length
  const todayCount = orders.filter((o) => new Date(o.created_at) >= today).length

  const stockOf = (p: { stock: number; variants: { stock: number }[] }) =>
    p.variants?.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock
  const lowStock = (products.data ?? []).filter((p) => p.is_published && stockOf(p) <= 3).sort((a, b) => stockOf(a) - stockOf(b))

  const stats = [
    { label: 'Новых заказов', value: String(newCount), href: '/admin/orders?status=new', accent: newCount > 0 },
    { label: 'Заказов сегодня', value: String(todayCount), href: '/admin/orders' },
    { label: 'Выручка за 30 дней', value: lei(revenue), sub: `${orders.length} заказов · средний ${lei(orders.length ? Math.round(revenue / orders.length) : 0)}` },
    { label: 'Товаров / документов', value: `${products.data?.length ?? 0} / ${certs.count ?? 0}`, href: '/admin/products' },
  ]

  return (
    <>
      <AdminTitle title="Обзор" sub="Что происходит в магазине" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <>
              <p className="text-sm text-mute">{s.label}</p>
              <p className={`mt-2 text-[28px] leading-none font-semibold tracking-[-0.02em] tabular-nums ${s.accent ? 'text-signal' : ''}`}>{s.value}</p>
              {s.sub && <p className="mt-2 text-xs text-mute">{s.sub}</p>}
            </>
          )
          return s.href ? (
            <Link key={s.label} href={s.href} className="rounded-lg border border-line bg-surface p-5 transition-colors hover:border-ink">
              {body}
            </Link>
          ) : (
            <div key={s.label} className="rounded-lg border border-line bg-surface p-5">
              {body}
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Последние заказы">
          {recent.data?.length ? (
            <ul className="-my-2 divide-y divide-line">
              {recent.data.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="min-w-0 flex-1 hover:text-brand">
                    <span className="font-mono text-sm">№{o.number}</span> <span className="font-medium">{o.customer_name}</span>
                    <span className="block text-sm text-mute">
                      {dateTime(o.created_at)} · {o.phone}
                    </span>
                  </Link>
                  <span className="font-medium tabular-nums">{lei(Number(o.total))}</span>
                  <StatusSelect id={o.id} status={o.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Заказов пока нет. Они появятся здесь сразу после оформления на сайте.</Empty>
          )}
          <Link href="/admin/orders" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            Все заказы →
          </Link>
        </Card>

        <Card title="Заканчиваются">
          {lowStock.length ? (
            <ul className="-my-2 divide-y divide-line">
              {lowStock.slice(0, 10).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-2.5">
                  <Link href={`/admin/products/${p.id}`} className="min-w-0 truncate hover:text-brand">
                    {p.name}
                  </Link>
                  <span className={`font-mono text-sm ${stockOf(p) === 0 ? 'text-signal' : 'text-ink-2'}`}>{stockOf(p)} шт.</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mute">Все опубликованные товары в наличии.</p>
          )}
        </Card>
      </div>
    </>
  )
}

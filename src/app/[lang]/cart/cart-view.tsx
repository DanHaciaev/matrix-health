'use client'

import Link from 'next/link'
import { IconMinus, IconPlus, IconTrash } from '@/components/icons'
import { ProductVisual } from '@/components/product-visual'
import { btn } from '@/components/ui'
import { cart, useCart } from '@/lib/cart'
import { useI18n } from '@/i18n/client'

export function CartView({ deliveryCost, freeFrom }: { deliveryCost: number; freeFrom: number }) {
  const { items, count, subtotal } = useCart()
  const { t, path, money, plural, fmt } = useI18n()

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong px-6 py-20 text-center">
        <p className="text-2xl font-semibold">{t.cart.emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-sm text-ink-2">{t.cart.emptyText}</p>
        <Link href={path('/catalog')} className={`${btn.primary} mt-8`}>
          {t.cart.goCatalog}
        </Link>
      </div>
    )
  }

  const left = Math.max(0, freeFrom - subtotal)
  const delivery = left > 0 ? deliveryCost : 0

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
      <div>
        <ul className="border-t border-line-strong">
          {items.map((l) => (
            <li key={l.key} className="grid grid-cols-[80px_1fr] gap-4 border-b border-line py-5 sm:grid-cols-[96px_1fr_auto] sm:gap-6">
              <Link href={path(`/product/${l.slug}`)} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-brand-soft">
                <ProductVisual form={l.form} image={l.image} alt={l.name} name={l.name} pack={l.pack} tone={l.tone} size="sm" sizes="96px" />
              </Link>

              <div className="min-w-0">
                <Link href={path(`/product/${l.slug}`)} className="font-medium hover:text-brand">
                  {l.name}
                </Link>
                {l.variantLabel && <p className="mt-0.5 text-sm text-mute">{l.variantLabel}</p>}
                <p className="mt-1 text-sm text-mute tabular-nums">{fmt(t.cart.each, { price: money(l.price) })}</p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 items-center rounded-full border border-line-strong">
                    <button
                      type="button"
                      onClick={() => cart.setQty(l.key, l.qty - 1)}
                      disabled={l.qty <= 1}
                      aria-label={t.cart.less}
                      className="flex h-full w-9 items-center justify-center disabled:text-line-strong"
                    >
                      <IconMinus size={14} />
                    </button>
                    <span className="min-w-7 text-center font-semibold tabular-nums">{l.qty}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQty(l.key, l.qty + 1)}
                      aria-label={t.cart.more}
                      className="flex h-full w-9 items-center justify-center"
                    >
                      <IconPlus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.remove(l.key)}
                    className="flex h-10 items-center gap-1.5 rounded-full px-2 text-sm text-mute hover:bg-sand hover:text-signal"
                  >
                    <IconTrash size={16} /> <span className="hidden sm:inline">{t.cart.remove}</span>
                  </button>
                </div>
              </div>

              <p className="col-start-2 text-lg font-semibold tabular-nums sm:col-start-auto sm:text-right">{money(l.price * l.qty)}</p>
            </li>
          ))}
        </ul>

        <button type="button" onClick={() => cart.clear()} className="mt-4 text-sm text-mute underline underline-offset-4 hover:text-ink">
          {t.cart.clear}
        </button>
      </div>

      <aside className="h-fit rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-32">
        <dl className="space-y-3 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-ink-2">
              {plural(count, t.cart.items)}
            </dt>
            <dd className="tabular-nums">{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-2">{t.cart.delivery}</dt>
            <dd className="tabular-nums">{delivery ? money(delivery) : t.cart.free}</dd>
          </div>
        </dl>

        {left > 0 && (
          <div className="mt-4">
            <progress
              value={subtotal}
              max={freeFrom}
              aria-label={t.cart.progress}
              className="block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-sand [&::-moz-progress-bar]:bg-brand [&::-webkit-progress-bar]:bg-sand [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-brand"
            />
            <p className="mt-2 text-sm text-mute">
              {fmt(t.cart.leftForFree, { price: money(left) })}
            </p>
          </div>
        )}

        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
          <span className="font-medium">{t.cart.total}</span>
          <span className="text-2xl font-semibold tabular-nums">{money(subtotal + delivery)}</span>
        </div>

        <Link href={path('/checkout')} className={`${btn.primary} mt-6 w-full`}>
          {t.cart.checkout}
        </Link>
        <Link href={path('/catalog')} className="mt-3 block text-center text-sm text-ink-2 hover:text-ink">
          {t.cart.continue}
        </Link>
      </aside>
    </div>
  )
}

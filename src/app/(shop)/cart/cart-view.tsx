'use client'

import Link from 'next/link'
import { IconMinus, IconPlus, IconTrash } from '@/components/icons'
import { ProductVisual } from '@/components/product-visual'
import { btn } from '@/components/ui'
import { cart, useCart } from '@/lib/cart'
import { lei, plural } from '@/lib/format'

export function CartView({ deliveryCost, freeFrom }: { deliveryCost: number; freeFrom: number }) {
  const { items, count, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong px-6 py-20 text-center">
        <p className="text-2xl font-semibold">В корзине пока пусто</p>
        <p className="mx-auto mt-2 max-w-sm text-ink-2">Загляните в каталог — там пептиды, БАДы и таблетки с документами на каждую партию.</p>
        <Link href="/catalog" className={`${btn.primary} mt-8`}>
          Перейти в каталог
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
              <Link href={`/product/${l.slug}`} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-brand-soft">
                <ProductVisual form={l.form} image={l.image} alt={l.name} name={l.name} pack={l.pack} tone={l.tone} size="sm" sizes="96px" />
              </Link>

              <div className="min-w-0">
                <Link href={`/product/${l.slug}`} className="font-medium hover:text-brand">
                  {l.name}
                </Link>
                {l.variantLabel && <p className="mt-0.5 text-sm text-mute">{l.variantLabel}</p>}
                <p className="mt-1 text-sm text-mute tabular-nums">{lei(l.price)} за шт.</p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 items-center rounded-full border border-line-strong">
                    <button
                      type="button"
                      onClick={() => cart.setQty(l.key, l.qty - 1)}
                      disabled={l.qty <= 1}
                      aria-label="Меньше"
                      className="flex h-full w-9 items-center justify-center disabled:text-line-strong"
                    >
                      <IconMinus size={14} />
                    </button>
                    <span className="min-w-7 text-center font-semibold tabular-nums">{l.qty}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQty(l.key, l.qty + 1)}
                      aria-label="Больше"
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
                    <IconTrash size={16} /> <span className="hidden sm:inline">Удалить</span>
                  </button>
                </div>
              </div>

              <p className="col-start-2 text-lg font-semibold tabular-nums sm:col-start-auto sm:text-right">{lei(l.price * l.qty)}</p>
            </li>
          ))}
        </ul>

        <button type="button" onClick={() => cart.clear()} className="mt-4 text-sm text-mute underline underline-offset-4 hover:text-ink">
          Очистить корзину
        </button>
      </div>

      <aside className="h-fit rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-32">
        <dl className="space-y-3 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-ink-2">
              {count} {plural(count, 'товар', 'товара', 'товаров')}
            </dt>
            <dd className="tabular-nums">{lei(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-2">Доставка</dt>
            <dd className="tabular-nums">{delivery ? lei(delivery) : 'бесплатно'}</dd>
          </div>
        </dl>

        {left > 0 && (
          <div className="mt-4">
            <progress
              value={subtotal}
              max={freeFrom}
              aria-label="До бесплатной доставки"
              className="block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-sand [&::-moz-progress-bar]:bg-brand [&::-webkit-progress-bar]:bg-sand [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-brand"
            />
            <p className="mt-2 text-sm text-mute">
              Ещё {lei(left)} — и доставка будет бесплатной
            </p>
          </div>
        )}

        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
          <span className="font-medium">Итого</span>
          <span className="text-2xl font-semibold tabular-nums">{lei(subtotal + delivery)}</span>
        </div>
        <p className="mt-1 text-xs text-mute">Самовывоз — без стоимости доставки</p>

        <Link href="/checkout" className={`${btn.primary} mt-6 w-full`}>
          Оформить заказ
        </Link>
        <Link href="/catalog" className="mt-3 block text-center text-sm text-ink-2 hover:text-ink">
          Продолжить покупки
        </Link>
      </aside>
    </div>
  )
}

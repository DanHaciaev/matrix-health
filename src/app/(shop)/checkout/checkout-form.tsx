'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useState } from 'react'
import { ProductVisual } from '@/components/product-visual'
import { btn, input, label, textarea } from '@/components/ui'
import { useCart } from '@/lib/cart'
import { DELIVERY_METHODS, PAYMENT_METHODS, type DeliveryMethod } from '@/lib/constants'
import { lei } from '@/lib/format'
import { placeOrder, type CheckoutState } from './actions'

export function CheckoutForm({ deliveryCost, freeFrom, address }: { deliveryCost: number; freeFrom: number; address: string | null }) {
  const router = useRouter()
  const { items, subtotal } = useCart()
  const [method, setMethod] = useState<DeliveryMethod>('courier')

  const [state, submit, pending] = useActionState(async (prev: CheckoutState, fd: FormData) => {
    const result = await placeOrder(prev, fd)
    // Корзину очищает страница «Спасибо», чтобы форма не мигала пустой корзиной
    if (result.ok) router.replace(`/checkout/success?n=${result.number ?? ''}`)
    return result
  }, {})

  if (items.length === 0 && !state.ok) {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center">
        <p className="text-xl font-medium">Корзина пуста</p>
        <Link href="/catalog" className={`${btn.primary} mt-6`}>
          Перейти в каталог
        </Link>
      </div>
    )
  }

  const delivery = method === 'pickup' || subtotal >= freeFrom ? 0 : deliveryCost
  const err = state.fields ?? {}

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => submit(fd))
      }}
      className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14"
    >
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(items.map((l) => ({ product_id: l.productId, variant_id: l.variantId, qty: l.qty })))}
      />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="space-y-12">
        <Step n={1} title="Контакты">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Имя" error={err.customer_name}>
              <input name="customer_name" autoComplete="name" className={input} aria-invalid={!!err.customer_name} />
            </Field>
            <Field label="Телефон" error={err.phone} hint="Позвоним, чтобы подтвердить заказ">
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+373"
                className={input}
                aria-invalid={!!err.phone}
              />
            </Field>
            <Field label="Email" hint="Необязательно — пришлём копию заказа">
              <input name="email" type="email" autoComplete="email" className={input} />
            </Field>
          </div>
        </Step>

        <Step n={2} title="Доставка">
          <div className="grid gap-2 sm:grid-cols-3">
            {DELIVERY_METHODS.map((d) => (
              <label
                key={d.id}
                className={`flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors ${
                  method === d.id ? 'border-brand bg-brand-soft ring-1 ring-brand' : 'border-line-strong hover:border-ink'
                }`}
              >
                <input
                  type="radio"
                  name="delivery_method"
                  value={d.id}
                  checked={method === d.id}
                  onChange={() => setMethod(d.id)}
                  className="sr-only"
                />
                <span className="font-medium">{d.label}</span>
                <span className="mt-1 text-sm text-mute">{d.hint}</span>
              </label>
            ))}
          </div>

          {method === 'pickup' ? (
            <p className="mt-4 rounded-2xl bg-sand px-4 py-3 text-[15px] text-ink-2">
              Пункт выдачи: <span className="font-medium text-ink">{address ?? 'адрес уточнит менеджер'}</span>. Мы
              позвоним, когда заказ будет готов.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
              <Field label="Город">
                <input name="city" autoComplete="address-level2" defaultValue="Кишинёв" className={input} />
              </Field>
              <Field label="Адрес" error={err.address}>
                <input
                  name="address"
                  autoComplete="street-address"
                  placeholder="Улица, дом, квартира"
                  className={input}
                  aria-invalid={!!err.address}
                />
              </Field>
            </div>
          )}
        </Step>

        <Step n={3} title="Оплата">
          <div className="flex flex-col gap-2.5">
            {PAYMENT_METHODS.map((p, i) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-3 text-[15px]">
                <input type="radio" name="payment_method" value={p.id} defaultChecked={i === 0} className="size-[18px] accent-brand" />
                {p.label}
              </label>
            ))}
          </div>
          <div className="mt-6">
            <Field label="Комментарий к заказу">
              <textarea name="comment" rows={3} placeholder="Удобное время звонка, этаж, домофон…" className={textarea} />
            </Field>
          </div>
        </Step>
      </div>

      <aside className="h-fit rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-32">
        <p className="font-semibold">Ваш заказ</p>
        <ul className="mt-4 space-y-3">
          {items.map((l) => (
            <li key={l.key} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 text-sm">
              <span className="relative flex size-12 items-center justify-center overflow-hidden rounded-xl bg-sand">
                <ProductVisual form={l.form} image={l.image} alt="" name={l.name} tone={l.tone} size="sm" sizes="48px" />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2">{l.name}</span>
                <span className="text-mute">
                  {l.variantLabel ? `${l.variantLabel} · ` : ''}
                  {l.qty} шт.
                </span>
              </span>
              <span className="tabular-nums">{lei(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-ink-2">Товары</dt>
            <dd className="tabular-nums">{lei(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-2">Доставка</dt>
            <dd className="tabular-nums">{delivery ? lei(delivery) : 'бесплатно'}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="font-medium">Итого</span>
          <span className="text-2xl font-semibold tabular-nums">{lei(subtotal + delivery)}</span>
        </div>

        {state.error && (
          <p role="alert" className="mt-4 rounded-2xl bg-signal-soft px-3 py-2.5 text-sm text-signal">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className={`${btn.primary} mt-5 w-full`}>
          {pending ? 'Отправляем…' : 'Подтвердить заказ'}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-mute">
          Оплата при получении. Нажимая кнопку, вы соглашаетесь с{' '}
          <Link href="/privacy" className="underline underline-offset-2">
            политикой конфиденциальности
          </Link>
          .
        </p>
      </aside>
    </form>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 flex items-center gap-3 text-xl font-bold">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({ label: text, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={label}>{text}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm text-signal">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-sm text-mute">{hint}</span>
      )}
    </label>
  )
}

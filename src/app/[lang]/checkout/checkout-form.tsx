'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useState } from 'react'
import { ProductVisual } from '@/components/product-visual'
import { btn, input, label, textarea } from '@/components/ui'
import { useCart } from '@/lib/cart'
import { DELIVERY_METHODS, PAYMENT_METHODS, type DeliveryMethod } from '@/lib/constants'
import { useI18n } from '@/i18n/client'
import { placeOrder, type CheckoutState } from './actions'

export function CheckoutForm({ deliveryCost, freeFrom, address }: { deliveryCost: number; freeFrom: number; address: string | null }) {
  const router = useRouter()
  const { t, path, money, fmt } = useI18n()
  const { items, subtotal } = useCart()
  const [method, setMethod] = useState<DeliveryMethod>('courier')

  const [state, submit, pending] = useActionState(async (prev: CheckoutState, fd: FormData) => {
    const result = await placeOrder(prev, fd)
    // Корзину очищает страница «Спасибо», чтобы форма не мигала пустой корзиной
    if (result.ok) router.replace(path(`/checkout/success?n=${result.number ?? ''}`))
    return result
  }, {})

  if (items.length === 0 && !state.ok) {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center">
        <p className="text-xl font-medium">{t.checkout.empty}</p>
        <Link href={path('/catalog')} className={`${btn.primary} mt-6`}>
          {t.cart.goCatalog}
        </Link>
      </div>
    )
  }

  const delivery = method === 'pickup' || subtotal >= freeFrom ? 0 : deliveryCost
  const errors = t.checkout.errors
  const err = Object.fromEntries(Object.entries(state.fields ?? {}).map(([k, code]) => [k, errors[code]])) as Partial<Record<string, string>>

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
        <Step n={1} title={t.checkout.stepContacts}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.checkout.name} error={err.customer_name}>
              <input name="customer_name" autoComplete="name" className={input} aria-invalid={!!err.customer_name} />
            </Field>
            <Field label={t.checkout.phone} error={err.phone} hint={t.checkout.phoneHint}>
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
            <Field label={t.checkout.email} hint={t.checkout.emailHint}>
              <input name="email" type="email" autoComplete="email" className={input} />
            </Field>
          </div>
        </Step>

        <Step n={2} title={t.checkout.stepDelivery}>
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
                <span className="font-medium">{t.deliveryMethods[d.id].label}</span>
                <span className="mt-1 text-sm text-mute">{t.deliveryMethods[d.id].hint}</span>
              </label>
            ))}
          </div>

          {method === 'pickup' ? (
            <p className="mt-4 rounded-2xl bg-sand px-4 py-3 text-[15px] text-ink-2">
              {fmt(t.checkout.pickup, { address: address ?? t.checkout.pickupUnknown })}
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
              <Field label={t.checkout.city}>
                <input name="city" autoComplete="address-level2" defaultValue={t.checkout.cityDefault} className={input} />
              </Field>
              <Field label={t.checkout.address} error={err.address}>
                <input
                  name="address"
                  autoComplete="street-address"
                  placeholder={t.checkout.addressPlaceholder}
                  className={input}
                  aria-invalid={!!err.address}
                />
              </Field>
            </div>
          )}
        </Step>

        <Step n={3} title={t.checkout.stepPayment}>
          <div className="flex flex-col gap-2.5">
            {PAYMENT_METHODS.map((p, i) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-3 text-[15px]">
                <input type="radio" name="payment_method" value={p.id} defaultChecked={i === 0} className="size-[18px] accent-brand" />
                {t.payment[p.id]}
              </label>
            ))}
          </div>
          <div className="mt-6">
            <Field label={t.checkout.comment}>
              <textarea name="comment" rows={3} placeholder={t.checkout.commentPlaceholder} className={textarea} />
            </Field>
          </div>
        </Step>
      </div>

      <aside className="h-fit rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-32">
        <p className="font-semibold">{t.checkout.yourOrder}</p>
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
                  {fmt(t.checkout.qty, { n: l.qty })}
                </span>
              </span>
              <span className="tabular-nums">{money(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-ink-2">{t.checkout.products}</dt>
            <dd className="tabular-nums">{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-2">{t.checkout.delivery}</dt>
            <dd className="tabular-nums">{delivery ? money(delivery) : t.checkout.free}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="font-medium">{t.checkout.total}</span>
          <span className="text-2xl font-semibold tabular-nums">{money(subtotal + delivery)}</span>
        </div>

        {state.error && (
          <p role="alert" className="mt-4 rounded-2xl bg-signal-soft px-3 py-2.5 text-sm text-signal">
            {errors[state.error]}
          </p>
        )}

        <button type="submit" disabled={pending} className={`${btn.primary} mt-5 w-full`}>
          {pending ? t.checkout.sending : t.checkout.submit}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-mute">
          {t.checkout.consent}{' '}
          <Link href={path('/privacy')} className="underline underline-offset-2">
            {t.checkout.consentLink}
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

'use client'

import { useState } from 'react'
import { useI18n } from '@/i18n/client'
import type { Product } from '@/lib/types'
import { BuyButtons } from './add-to-cart'
import { IconMinus, IconPlus } from './icons'

export function BuyBox({ product }: { product: Product }) {
  const { t, money, fmt } = useI18n()
  const { variants } = product
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0]
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? null)
  const [qty, setQty] = useState(1)

  const variant = variants.find((v) => v.id === variantId) ?? null
  const price = variant?.price ?? product.price
  const stock = variant?.stock ?? product.stock
  const oldPrice = !variant && product.old_price && product.old_price > price ? product.old_price : null

  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{money(price)}</span>
        {oldPrice && <span className="text-lg text-mute line-through tabular-nums">{money(oldPrice)}</span>}
        {product.unit_label && <span className="text-sm text-mute">{product.unit_label}</span>}
      </div>

      <p className={`mt-3 flex items-center gap-2 text-sm ${stock > 0 ? 'text-sage-dark' : 'text-signal'}`}>
        <span className={`size-2 rounded-full ${stock > 0 ? 'bg-sage' : 'bg-signal'}`} />
        {stock > 5 ? t.product.inStock : stock > 0 ? fmt(t.product.left, { n: stock }) : t.product.unavailable}
      </p>

      {variants.length > 1 && (
        <fieldset className="mt-6">
          <legend className="mb-2.5 text-sm font-medium text-ink-2">{t.product.dosage}</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariantId(v.id)
                  setQty(1)
                }}
                aria-pressed={v.id === variantId}
                className={`flex h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors ${
                  v.id === variantId ? 'border-ink bg-ink text-white' : 'border-line-strong hover:border-ink'
                } ${v.stock === 0 ? 'text-mute line-through decoration-1' : ''}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <div className="flex h-12 items-center rounded-full border border-line-strong">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label={t.product.decrease}
            className="flex h-full w-11 items-center justify-center disabled:text-line-strong"
          >
            <IconMinus size={16} />
          </button>
          <span className="min-w-8 text-center text-[16px] font-semibold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(Math.max(1, stock), 99, q + 1))}
            disabled={qty >= Math.min(stock, 99)}
            aria-label={t.product.increase}
            className="flex h-full w-11 items-center justify-center disabled:text-line-strong"
          >
            <IconPlus size={16} />
          </button>
        </div>

        <BuyButtons
          qty={qty}
          disabled={stock <= 0}
          line={{
            productId: product.id,
            variantId: variant?.id ?? null,
            variantLabel: variant?.label ?? null,
            slug: product.slug,
            name: product.name,
            price,
            image: product.images[0] ?? null,
            form: product.form,
            tone: product.category?.sort ?? null,
            pack: product.pack,
          }}
        />
      </div>
    </div>
  )
}

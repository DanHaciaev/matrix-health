import Link from 'next/link'
import { getI18n } from '@/i18n/server'
import { displayPrice, inStock } from '@/lib/catalog'
import { tone } from '@/lib/tones'
import type { Product } from '@/lib/types'
import { QuickAdd } from './add-to-cart'
import { IconArrow, IconShield } from './icons'
import { ProductVisual } from './product-visual'

export async function ProductCard({ product, hasDocs }: { product: Product; hasDocs?: boolean }) {
  const { t, path, money, fmt } = await getI18n()
  const price = displayPrice(product)
  const available = inStock(product)
  const c = tone(product.category?.sort)
  const href = path(`/product/${product.slug}`)
  const discount =
    product.old_price && product.old_price > price ? Math.round((1 - price / product.old_price) * 100) : 0

  return (
    <article className="group flex flex-col rounded-[28px] bg-surface p-2 ring-1 ring-line transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(15,26,68,0.25)]">
      <Link href={href} className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[22px] ${c.bg}`}>
        <div className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03]">
          <ProductVisual
            form={product.form}
            image={product.images[0]}
            alt={product.name}
            name={product.name}
            pack={product.pack}
            tone={product.category?.sort}
          />
        </div>

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 text-xs font-semibold">
          {product.is_new ? <span className="rounded-full bg-white px-2.5 py-1 text-ink">{t.product.new}</span> : <span />}
          {discount > 0 && <span className="rounded-full bg-signal px-2.5 py-1 text-white tabular-nums">−{discount}%</span>}
        </div>

        {!available && (
          <span className="absolute inset-0 flex items-end justify-center bg-white/45 pb-4 backdrop-grayscale">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-2">{t.product.outOfStock}</span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-2 pt-3 pb-2 sm:px-3 sm:pt-4 sm:pb-3">
        <p className={`text-[13px] font-medium ${c.text}`}>{product.category?.name}</p>
        <h3 className="mt-1 text-[16px] leading-snug font-semibold text-pretty">
          <Link href={href} className="hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-mute">
          {product.pack}
          {hasDocs && (
            <span className="inline-flex items-center gap-1 text-brand" title={t.product.docsBadge}>
              <IconShield size={14} /> COA
            </span>
          )}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="flex flex-col leading-tight">
            {product.old_price && product.old_price > price && (
              <span className="text-[13px] text-mute line-through tabular-nums">{money(product.old_price)}</span>
            )}
            <span className="text-[17px] font-bold whitespace-nowrap tabular-nums sm:text-lg">
              {product.variants.length > 1 && <span className="text-sm font-normal text-mute">{t.product.from} </span>}
              {money(price)}
            </span>
          </div>

          {available &&
            (product.variants.length > 1 ? (
              <Link
                href={href}
                aria-label={fmt(t.product.chooseAria, { name: product.name })}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-sm font-medium hover:border-brand hover:text-brand sm:h-10 sm:w-auto sm:px-4"
              >
                <IconArrow size={18} className="sm:hidden" />
                <span className="hidden sm:inline">{t.product.choose}</span>
              </Link>
            ) : (
              <QuickAdd
                name={product.name}
                line={{
                  productId: product.id,
                  variantId: product.variants[0]?.id ?? null,
                  variantLabel: product.variants[0]?.label ?? null,
                  slug: product.slug,
                  name: product.name,
                  price,
                  image: product.images[0] ?? null,
                  form: product.form,
                  tone: product.category?.sort ?? null,
                  pack: product.pack,
                }}
              />
            ))}
        </div>
      </div>
    </article>
  )
}

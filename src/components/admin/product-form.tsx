'use client'

import Link from 'next/link'
import { startTransition, useActionState, useState } from 'react'
import { deleteProduct, saveProduct } from '@/lib/admin/actions'
import { FORMS, PURPOSES } from '@/lib/constants'
import { slugify } from '@/lib/format'
import type { Category, Product } from '@/lib/types'
import { IconExternal } from '../icons'
import { btn, checkbox, input, label, textarea } from '../ui'
import { DeleteButton, FormMessage } from './controls'
import { ImageManager } from './image-manager'
import { RowsEditor } from './rows-editor'

const DEFAULT_SPECS = ['Форма выпуска', 'Количество', 'Производитель', 'Страна', 'Хранение', 'Срок годности'].map((l) => ({
  label: l,
  value: '',
}))

export function ProductForm({ product, categories }: { product: Product | null; categories: Category[] }) {
  const p = product
  const [state, action, pending] = useActionState(saveProduct, {})
  const [name, setName] = useState(p?.name ?? '')
  const [slug, setSlug] = useState(p?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(p))
  const [hasVariants, setHasVariants] = useState(Boolean(p?.variants.length))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
      className="grid gap-6 pb-24 xl:grid-cols-[1fr_360px]"
    >
      <input type="hidden" name="id" value={p?.id ?? ''} />

      <div className="space-y-6">
        <Box title="Основное">
          <div className="grid gap-4">
            <Field label="Название">
              <input
                name="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slugTouched) setSlug(slugify(e.target.value))
                }}
                placeholder="Например, Омега-3 1000 мг"
                className={input}
              />
            </Field>
            <Field label="Адрес страницы" hint={`Сайт: /product/${slug || '…'}`}>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }}
                className={`${input} font-mono text-sm`}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Фасовка" hint="Видна в карточке: «Флакон · 5 мг», «90 капсул»">
                <input name="pack" defaultValue={p?.pack ?? ''} className={input} />
              </Field>
              <Field label="Подпись к цене" hint="«за флакон», «за упаковку»">
                <input name="unit_label" defaultValue={p?.unit_label ?? ''} className={input} />
              </Field>
            </div>
            <Field label="Короткое описание" hint="1–2 предложения под названием">
              <textarea name="short_description" rows={2} defaultValue={p?.short_description ?? ''} className={textarea} />
            </Field>
          </div>
        </Box>

        <Box title="Фото">
          <ImageManager initial={p?.images ?? []} />
        </Box>

        <Box title="Описание и применение">
          <div className="grid gap-4">
            <Field label="Подробное описание" hint="Пустая строка между абзацами — новый абзац">
              <textarea name="description" rows={7} defaultValue={p?.description ?? ''} className={textarea} />
            </Field>
            <Field label="Способ применения и противопоказания">
              <textarea name="usage" rows={4} defaultValue={p?.usage ?? ''} className={textarea} />
            </Field>
            <Field label="Предупреждение" hint="Показывается в рамке внизу страницы товара">
              <textarea
                name="warning"
                rows={2}
                defaultValue={p?.warning ?? 'Не является лекарственным средством. Перед применением проконсультируйтесь со специалистом.'}
                className={textarea}
              />
            </Field>
          </div>
        </Box>

        <Box title="Состав">
          <RowsEditor
            name="composition"
            addLabel="Добавить компонент"
            initial={p?.composition ?? []}
            cols={[
              { key: 'name', placeholder: 'Компонент' },
              { key: 'amount', placeholder: 'Количество', width: 'w-36' },
            ]}
          />
        </Box>

        <Box title="Характеристики">
          <RowsEditor
            name="specs"
            addLabel="Добавить строку"
            initial={p?.specs.length ? p.specs : DEFAULT_SPECS}
            cols={[
              { key: 'label', placeholder: 'Название', width: 'w-44' },
              { key: 'value', placeholder: 'Значение' },
            ]}
          />
        </Box>
      </div>

      <div className="space-y-6">
        <Box title="Публикация">
          <div className="space-y-3">
            <Toggle name="is_published" label="Показывать на сайте" defaultChecked={p?.is_published ?? true} />
            <Toggle name="is_popular" label="В блоке «Чаще всего заказывают»" defaultChecked={p?.is_popular ?? false} />
            <Toggle name="is_new" label="Метка «Новинка»" defaultChecked={p?.is_new ?? !p} />
          </div>
          {p && (
            <Link href={`/product/${p.slug}`} target="_blank" className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
              <IconExternal size={14} /> Открыть на сайте
            </Link>
          )}
        </Box>

        <Box title="Цена и наличие">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Цена, лей">
              <input name="price" inputMode="decimal" required defaultValue={p?.price ?? ''} className={input} />
            </Field>
            <Field label="Старая цена">
              <input name="old_price" inputMode="decimal" defaultValue={p?.old_price ?? ''} placeholder="—" className={input} />
            </Field>
            <Field label="Остаток, шт.">
              <input name="stock" inputMode="numeric" defaultValue={p?.stock ?? 0} className={input} />
            </Field>
            <Field label="Порядок">
              <input name="sort" inputMode="numeric" defaultValue={p?.sort ?? 0} className={input} />
            </Field>
            <Field label="Артикул">
              <input name="sku" defaultValue={p?.sku ?? ''} className={`${input} font-mono text-sm`} />
            </Field>
            <Field label="Партия (LOT)">
              <input name="batch" defaultValue={p?.batch ?? ''} className={`${input} font-mono text-sm`} />
            </Field>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-[15px] font-medium">
            <input type="checkbox" className={checkbox} checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
            Есть дозировки / фасовки
          </label>
          {hasVariants ? (
            <div className="mt-3">
              <p className="mb-2 text-xs text-mute">У каждого варианта своя цена и остаток. Цена и остаток выше тогда не используются.</p>
              <RowsEditor
                name="variants"
                addLabel="Добавить вариант"
                initial={p?.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, stock: v.stock })) ?? [{ label: '', price: '', stock: '' }]}
                cols={[
                  { key: 'label', placeholder: '5 мг' },
                  { key: 'price', placeholder: 'Цена', width: 'w-20', inputMode: 'decimal' },
                  { key: 'stock', placeholder: 'Шт.', width: 'w-16', inputMode: 'numeric' },
                ]}
              />
            </div>
          ) : (
            <input type="hidden" name="variants" value="[]" />
          )}
        </Box>

        <Box title="Категория и фильтры">
          <div className="space-y-5">
            <Field label="Категория">
              <select name="category_id" defaultValue={p?.category_id ?? categories[0]?.id ?? ''} className={input}>
                <option value="">Без категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <fieldset>
              <legend className={label}>Форма выпуска</legend>
              <div className="flex flex-wrap gap-1.5">
                {FORMS.map((f) => (
                  <label key={f.id} className="cursor-pointer">
                    <input type="radio" name="form" value={f.id} defaultChecked={(p?.form ?? 'capsules') === f.id} className="peer sr-only" />
                    <span className="block rounded-md border border-line px-3 py-1.5 text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
                      {f.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className={label}>Назначение</legend>
              <div className="space-y-2">
                {PURPOSES.map((x) => (
                  <label key={x.id} className="flex cursor-pointer items-center gap-2.5 text-[15px]">
                    <input type="checkbox" name="purposes" value={x.id} defaultChecked={p?.purposes.includes(x.id)} className={checkbox} />
                    {x.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </Box>

        {p && (
          <Box title="Опасная зона">
            <p className="mb-3 text-sm text-mute">Удаление нельзя отменить. Чтобы просто убрать товар с сайта, выключите «Показывать на сайте».</p>
            <DeleteButton action={deleteProduct.bind(null, p.id)} confirm={`Удалить «${p.name}» навсегда?`} label="Удалить товар" />
          </Box>
        )}
      </div>

      {/* Панель сохранения всегда под рукой */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur lg:left-60">
        <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <button type="submit" disabled={pending} className={btn.smallPrimary}>
            {pending ? 'Сохраняем…' : p ? 'Сохранить изменения' : 'Создать товар'}
          </button>
          <Link href="/admin/products" className="text-sm text-mute hover:text-ink">
            Отмена
          </Link>
          <div className="min-w-0 flex-1 truncate">
            <FormMessage state={state} />
          </div>
        </div>
      </div>
    </form>
  )
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface">
      <h2 className="border-b border-line px-5 py-3 font-semibold">{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  )
}

function Field({ label: text, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={label}>{text}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  )
}

function Toggle({ name, label: text, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-[15px]">
      {text}
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-6 w-10 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  )
}

'use client'

import Link from 'next/link'
import { startTransition, useActionState, useState, type ReactNode } from 'react'
import { deleteProduct, saveProduct } from '@/lib/admin/actions'
import { slugify } from '@/lib/format'
import type { Category, FilterOption, Product, ProductText } from '@/lib/types'
import { IconExternal } from '../icons'
import { btn, checkbox, input, label, textarea } from '../ui'
import { DeleteButton, FormMessage } from './controls'
import { ImageManager } from './image-manager'
import { LangTabs, type EditLang } from './lang-tabs'
import { RowsEditor } from './rows-editor'

const DEFAULT_SPECS = ['Форма выпуска', 'Количество', 'Производитель', 'Страна', 'Хранение', 'Срок годности'].map((l) => ({
  label: l,
  value: '',
}))

const DEFAULT_WARNING = 'Не является лекарственным средством. Перед применением проконсультируйтесь со специалистом.'

export function ProductForm({
  product,
  categories,
  filters,
}: {
  product: Product | null
  categories: Category[]
  /** Варианты из Админка → Фильтры (включая скрытые) */
  filters: FilterOption[]
}) {
  const p = product
  const forms = filters.filter((f) => f.kind === 'form')
  const purposes = filters.filter((f) => f.kind === 'purpose')
  const defaultForm = p?.form ?? forms.find((f) => f.slug === 'vials')?.slug ?? forms[0]?.slug
  const [state, action, pending] = useActionState(saveProduct, {})
  const [name, setName] = useState(p?.name ?? '')
  const [slug, setSlug] = useState(p?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(p))
  const [hasVariants, setHasVariants] = useState(Boolean(p?.variants.length))
  const [lang, setLang] = useState<EditLang>('ru')

  const tr = p?.translations ?? {}
  const filled = { en: Boolean(tr.en?.name), ro: Boolean(tr.ro?.name) }

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
        <LangTabs value={lang} onChange={setLang} filled={filled} />

        {/* Все три языка в форме сразу — переключатель только показывает нужный */}
        <div className={lang === 'ru' ? 'space-y-6' : 'hidden'}>
          <TextFields
            prefix=""
            values={p ?? { warning: DEFAULT_WARNING, specs: DEFAULT_SPECS }}
            nameField={
              <>
                <Field label="Название">
                  <input
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (!slugTouched) setSlug(slugify(e.target.value))
                    }}
                    placeholder="Например, Омега-3 1000 мг"
                    className={input}
                  />
                </Field>
                <Field label="Адрес страницы" hint={`Сайт: /en/product/${slug || '…'} (и /ro/…, /ru/…)`}>
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
              </>
            }
          />
        </div>

        {(['en', 'ro'] as const).map((l) => (
          <div key={l} className={lang === l ? 'space-y-6' : 'hidden'}>
            <p className="rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand-dark">
              Пустые поля на сайте заменятся {l === 'ro' ? 'английским, а если нет и его — русским' : 'русским'} текстом.
              Фото, цены и остатки общие для всех языков.
            </p>
            <TextFields prefix={`tr_${l}_`} values={tr[l] ?? {}} />
          </div>
        ))}

        <Box title="Фото">
          <ImageManager initial={p?.images ?? []} />
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
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {(['en', 'ro', 'ru'] as const).map((l) => (
                <Link key={l} href={`/${l}/product/${p.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-brand hover:underline">
                  <IconExternal size={14} /> {l.toUpperCase()}
                </Link>
              ))}
            </div>
          )}
        </Box>

        <Box title="Цена и наличие">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Цена, €">
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
              <p className="mb-2 text-xs text-mute">
                У каждого варианта своя цена и остаток. Названия вариантов пишите так, чтобы они были понятны на всех
                языках, например «10 mg».
              </p>
              <RowsEditor
                name="variants"
                addLabel="Добавить вариант"
                initial={p?.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, stock: v.stock })) ?? [{ label: '', price: '', stock: '' }]}
                cols={[
                  { key: 'label', placeholder: '10 mg' },
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
                {forms.map((f) => (
                  <label key={f.slug} className="cursor-pointer" title={f.is_visible ? undefined : 'Скрыт в фильтрах сайта'}>
                    <input type="radio" name="form" value={f.slug} defaultChecked={defaultForm === f.slug} className="peer sr-only" />
                    <span className="block rounded-md border border-line px-3 py-1.5 text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
                      {f.name}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className={label}>Назначение</legend>
              <div className="space-y-2">
                {purposes.map((x) => (
                  <label key={x.slug} className="flex cursor-pointer items-center gap-2.5 text-[15px]">
                    <input type="checkbox" name="purposes" value={x.slug} defaultChecked={p?.purposes.includes(x.slug)} className={checkbox} />
                    {x.name}
                    {!x.is_visible && <span className="text-xs text-mute">· скрыт на сайте</span>}
                  </label>
                ))}
              </div>
            </fieldset>
            <Link href="/admin/filters" target="_blank" className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
              <IconExternal size={14} /> Нет нужного варианта? Добавьте в «Фильтры»
            </Link>
            <p className="-mt-3 text-xs text-mute">Откроется в новой вкладке — эта форма не сбросится. После добавления обновите страницу.</p>
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

/** Тексты товара на одном языке. prefix '' — русский (основные колонки), 'tr_en_' / 'tr_ro_' — переводы. */
function TextFields({ prefix, values: v, nameField }: { prefix: string; values: Partial<ProductText>; nameField?: ReactNode }) {
  const n = (field: string) => `${prefix}${field}`

  return (
    <>
      <Box title="Основное">
        <div className="grid gap-4">
          {nameField ?? (
            <Field label="Название">
              <input name={n('name')} defaultValue={v.name ?? ''} className={input} />
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Фасовка" hint="Видна в карточке: «Флакон · 5 мг», «90 капсул»">
              <input name={n('pack')} defaultValue={v.pack ?? ''} className={input} />
            </Field>
            <Field label="Подпись к цене" hint="«за флакон», «за упаковку»">
              <input name={n('unit_label')} defaultValue={v.unit_label ?? ''} className={input} />
            </Field>
          </div>
          <Field label="Короткое описание" hint="1–2 предложения под названием">
            <textarea name={n('short_description')} rows={2} defaultValue={v.short_description ?? ''} className={textarea} />
          </Field>
        </div>
      </Box>

      <Box title="Описание и применение">
        <div className="grid gap-4">
          <Field label="Подробное описание" hint="Пустая строка между абзацами — новый абзац">
            <textarea name={n('description')} rows={7} defaultValue={v.description ?? ''} className={textarea} />
          </Field>
          <Field label="Способ применения и противопоказания">
            <textarea name={n('usage')} rows={4} defaultValue={v.usage ?? ''} className={textarea} />
          </Field>
          <Field label="Предупреждение" hint="Показывается в рамке внизу страницы товара">
            <textarea name={n('warning')} rows={2} defaultValue={v.warning ?? ''} className={textarea} />
          </Field>
        </div>
      </Box>

      <Box title="Состав">
        <RowsEditor
          name={n('composition')}
          addLabel="Добавить компонент"
          initial={v.composition ?? []}
          cols={[
            { key: 'name', placeholder: 'Компонент' },
            { key: 'amount', placeholder: 'Количество', width: 'w-36' },
          ]}
        />
      </Box>

      <Box title="Характеристики">
        <RowsEditor
          name={n('specs')}
          addLabel="Добавить строку"
          initial={v.specs ?? []}
          cols={[
            { key: 'label', placeholder: 'Название', width: 'w-44' },
            { key: 'value', placeholder: 'Значение' },
          ]}
        />
      </Box>
    </>
  )
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface">
      <h2 className="border-b border-line px-5 py-3 font-semibold">{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  )
}

function Field({ label: text, hint, children }: { label: string; hint?: string; children: ReactNode }) {
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

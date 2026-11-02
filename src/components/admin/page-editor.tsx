'use client'

import { useState, useTransition } from 'react'
import { savePage } from '@/lib/admin/actions'
import { btn, input, textarea } from '../ui'
import { LangTabs, type EditLang } from './lang-tabs'

// Редактор текста страницы из таблицы pages. Поля описываются схемой (см. PAGE_SCHEMAS),
// поэтому так же можно будет править и другие страницы.

export type FieldDef = { key: string; label: string; long?: boolean }
export type SectionDef = {
  title: string
  fields: FieldDef[]
  /** Список однотипных пунктов (шаги, вопросы…) — их можно добавлять и удалять */
  list?: { key: string; item: string; fields: FieldDef[]; products?: boolean }
}

type Obj = Record<string, unknown>
type Item = Record<string, string | string[] | undefined>

export function PageEditor({
  slug,
  schema,
  content,
  translations,
  products,
}: {
  slug: string
  schema: SectionDef[]
  content: Obj
  translations: Partial<Record<'en' | 'ro', Obj>>
  /** Товары каталога — чтобы отмечать их у пунктов списка */
  products: { slug: string; name: string }[]
}) {
  const [lang, setLang] = useState<EditLang>('ru')
  const [data, setData] = useState<Record<EditLang, Obj>>({ ru: content, en: translations.en ?? {}, ro: translations.ro ?? {} })
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const cur = data[lang]
  const str = (o: Obj, key: string) => (typeof o[key] === 'string' ? (o[key] as string) : '')
  const listOf = (o: Obj, key: string) => (Array.isArray(o[key]) ? (o[key] as Item[]) : [])

  const setField = (key: string, value: string) => setData((d) => ({ ...d, [lang]: { ...d[lang], [key]: value } }))

  const setItem = (list: string, index: number, key: string, value: string | string[], forLang: EditLang = lang) =>
    setData((d) => {
      const items = [...listOf(d[forLang], list)]
      items[index] = { ...items[index], [key]: value }
      return { ...d, [forLang]: { ...d[forLang], [list]: items } }
    })

  // Пункты добавляются и удаляются сразу во всех языках, чтобы переводы не съехали
  const addItem = (list: string) =>
    setData((d) => {
      const length = listOf(d.ru, list).length
      const grow = (o: Obj) => {
        const items = [...listOf(o, list)]
        while (items.length < length) items.push({})
        return { ...o, [list]: [...items, {}] }
      }
      return { ru: grow(d.ru), en: grow(d.en), ro: grow(d.ro) }
    })

  const removeItem = (list: string, index: number) =>
    setData((d) => {
      const cut = (o: Obj) => ({ ...o, [list]: listOf(o, list).filter((_, i) => i !== index) })
      return { ru: cut(d.ru), en: cut(d.en), ro: cut(d.ro) }
    })

  const moveItem = (list: string, index: number, dir: -1 | 1) =>
    setData((d) => {
      const move = (o: Obj) => {
        const items = [...listOf(o, list)]
        if (index + dir < 0 || index + dir >= listOf(d.ru, list).length) return o
        while (items.length <= Math.max(index, index + dir)) items.push({})
        ;[items[index], items[index + dir]] = [items[index + dir], items[index]]
        return { ...o, [list]: items }
      }
      return { ru: move(d.ru), en: move(d.en), ro: move(d.ro) }
    })

  const filled = (l: 'en' | 'ro') => Object.values(data[l]).some((v) => (typeof v === 'string' ? v.trim() : Array.isArray(v) && v.length))

  const save = () =>
    start(async () => {
      setMessage(null)
      const error = await savePage(slug, data.ru, { en: data.en, ro: data.ro })
      setMessage(error ? { ok: false, text: error } : { ok: true, text: 'Сохранено — страница на сайте уже обновилась' })
    })

  const fieldInput = (f: FieldDef, value: string, onChange: (v: string) => void, placeholder?: string) =>
    f.long ? (
      <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${textarea} text-sm`} />
    ) : (
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${input} h-10 text-sm`} />
    )

  return (
    <div className="max-w-4xl space-y-6 pb-24">
      <LangTabs value={lang} onChange={setLang} filled={{ en: filled('en'), ro: filled('ro') }} />
      {lang !== 'ru' && (
        <p className="text-sm text-mute">Серым показан русский текст. Пустое поле на сайте заменится {lang === 'ro' ? 'английским, а если его нет — ' : ''}русским.</p>
      )}

      {schema.map((section) => (
        <section key={section.title} className="rounded-lg border border-line bg-surface">
          <h2 className="border-b border-line px-5 py-3.5 font-semibold">{section.title}</h2>
          <div className="space-y-4 p-5">
            {section.fields.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1 block text-sm font-medium text-ink-2">{f.label}</span>
                {fieldInput(f, str(cur, f.key), (v) => setField(f.key, v), lang === 'ru' ? undefined : str(data.ru, f.key))}
              </label>
            ))}

            {section.list && (
              <ListEditor
                def={section.list}
                lang={lang}
                items={listOf(data.ru, section.list.key)}
                current={listOf(cur, section.list.key)}
                products={products}
                fieldInput={fieldInput}
                onChange={(i, key, v) => setItem(section.list!.key, i, key, v)}
                onProducts={(i, v) => setItem(section.list!.key, i, 'products', v, 'ru')}
                onAdd={() => addItem(section.list!.key)}
                onRemove={(i) => removeItem(section.list!.key, i)}
                onMove={(i, dir) => moveItem(section.list!.key, i, dir)}
              />
            )}
          </div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur lg:left-60">
        <div className="flex max-w-4xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <button type="button" onClick={save} disabled={pending} className={btn.smallPrimary}>
            {pending ? 'Сохраняем…' : 'Сохранить'}
          </button>
          {message && <p className={`text-sm ${message.ok ? 'text-brand' : 'text-signal'}`}>{message.ok ? `✓ ${message.text}` : message.text}</p>}
        </div>
      </div>
    </div>
  )
}

function ListEditor({
  def,
  lang,
  items,
  current,
  products,
  fieldInput,
  onChange,
  onProducts,
  onAdd,
  onRemove,
  onMove,
}: {
  def: NonNullable<SectionDef['list']>
  lang: EditLang
  /** Пункты на русском — задают количество и порядок */
  items: Item[]
  current: Item[]
  products: { slug: string; name: string }[]
  fieldInput: (f: FieldDef, value: string, onChange: (v: string) => void, placeholder?: string) => React.ReactNode
  onChange: (index: number, key: string, value: string) => void
  onProducts: (index: number, value: string[]) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onMove: (index: number, dir: -1 | 1) => void
}) {
  const text = (item: Item | undefined, key: string) => (typeof item?.[key] === 'string' ? (item[key] as string) : '')

  return (
    <div className="space-y-3">
      {items.map((ruItem, i) => {
        const chosen = Array.isArray(ruItem.products) ? ruItem.products : []
        return (
          <div key={i} className="rounded-md border border-line bg-paper p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-mute">
                {def.item} {i + 1}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => onMove(i, -1)} disabled={i === 0} className={btn.ghost} aria-label="Выше">
                  ↑
                </button>
                <button type="button" onClick={() => onMove(i, 1)} disabled={i === items.length - 1} className={btn.ghost} aria-label="Ниже">
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => window.confirm(`Удалить «${text(ruItem, def.fields[0].key) || def.item}» во всех языках?`) && onRemove(i)}
                  className={`${btn.ghost} text-signal`}
                >
                  Удалить
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {def.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1 block text-xs font-semibold text-mute">{f.label}</span>
                  {fieldInput(f, text(current[i], f.key), (v) => onChange(i, f.key, v), lang === 'ru' ? undefined : text(ruItem, f.key))}
                </label>
              ))}
              {def.products && lang === 'ru' && (
                <fieldset>
                  <legend className="mb-1.5 text-xs font-semibold text-mute">Товары из каталога (общие для всех языков)</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {products.map((p) => {
                      const on = chosen.includes(p.slug)
                      return (
                        <button
                          key={p.slug}
                          type="button"
                          onClick={() => onProducts(i, on ? chosen.filter((s) => s !== p.slug) : [...chosen, p.slug])}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            on ? 'bg-brand text-white' : 'bg-surface text-ink-2 ring-1 ring-line hover:ring-ink'
                          }`}
                        >
                          {p.name}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              )}
            </div>
          </div>
        )
      })}
      <button type="button" onClick={onAdd} className={btn.small}>
        + {def.item}
      </button>
    </div>
  )
}

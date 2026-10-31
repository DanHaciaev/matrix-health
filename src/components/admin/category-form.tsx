'use client'

import { useActionState } from 'react'
import { deleteCategory, saveCategory } from '@/lib/admin/actions'
import type { Category } from '@/lib/types'
import { btn } from '../ui'
import { DeleteButton, FormMessage } from './controls'

const field = 'h-10 w-full min-w-0 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-brand'

const LANGS = [
  { prefix: '', label: 'Русский', required: true },
  { prefix: 'tr_en_', label: 'English', lang: 'en' as const },
  { prefix: 'tr_ro_', label: 'Română', lang: 'ro' as const },
]

export function CategoryForm({ category, count }: { category: Category | null; count?: number }) {
  const [state, action, pending] = useActionState(saveCategory, {})
  const c = category

  const valueOf = (lang: 'en' | 'ro' | undefined, key: 'name' | 'description') =>
    (lang ? c?.translations?.[lang]?.[key] : c?.[key]) ?? ''

  return (
    <form action={action} className="space-y-3 py-5">
      <input type="hidden" name="id" value={c?.id ?? ''} />

      <div className="grid gap-3 md:grid-cols-3">
        {LANGS.map((l) => (
          <div key={l.label} className="space-y-2">
            <p className="text-xs font-semibold text-mute">{l.label}</p>
            <input
              name={`${l.prefix}name`}
              required={l.required}
              defaultValue={valueOf(l.lang, 'name')}
              placeholder="Название"
              aria-label={`Название, ${l.label}`}
              className={field}
            />
            <input
              name={`${l.prefix}description`}
              defaultValue={valueOf(l.lang, 'description') ?? ''}
              placeholder="Подпись под названием"
              aria-label={`Подпись, ${l.label}`}
              className={field}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input name="slug" defaultValue={c?.slug ?? ''} placeholder="адрес (латиница)" aria-label="Адрес" className={`${field} w-48 font-mono`} />
        <input name="sort" inputMode="numeric" defaultValue={c?.sort ?? 0} aria-label="Порядок" title="Порядок (и цвет плиток)" className={`${field} w-20`} />
        <button type="submit" disabled={pending} className={c ? btn.small : btn.smallPrimary}>
          {pending ? '…' : c ? 'Сохранить' : 'Добавить'}
        </button>
        {c && (
          <DeleteButton
            action={deleteCategory.bind(null, c.id)}
            confirm={count ? `В категории ${count} товаров — они останутся без категории. Удалить?` : 'Удалить категорию?'}
          />
        )}
        <FormMessage state={state} />
      </div>
    </form>
  )
}

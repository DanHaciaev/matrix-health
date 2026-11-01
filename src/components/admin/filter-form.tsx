'use client'

import { useActionState, useState, useTransition } from 'react'
import { deleteFilterOption, saveFilterOption } from '@/lib/admin/actions'
import type { FilterOption } from '@/lib/types'
import { btn, checkbox } from '../ui'
import { FormMessage } from './controls'

const field = 'h-10 w-full min-w-0 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-brand'

const LANGS = [
  { prefix: '', label: 'Русский', required: true },
  { prefix: 'tr_en_', label: 'English', lang: 'en' as const },
  { prefix: 'tr_ro_', label: 'Română', lang: 'ro' as const },
]

/** Один вариант фильтра (назначение или форма выпуска) или форма нового варианта, если option = null */
export function FilterForm({
  option,
  kind,
  usedBy = 0,
  disabled,
}: {
  option: FilterOption | null
  kind: FilterOption['kind']
  /** Сколько товаров отмечено этим вариантом */
  usedBy?: number
  disabled?: boolean
}) {
  const [state, action, pending] = useActionState(saveFilterOption, {})
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const o = option

  const remove = () => {
    if (!o) return
    const warn =
      kind === 'purpose' && usedBy
        ? `Назначение «${o.name}» отмечено у товаров: ${usedBy}. Оно будет снято с них. Удалить?`
        : `Удалить «${o.name}»?`
    if (!window.confirm(warn)) return
    startDelete(async () => setDeleteError(await deleteFilterOption(o.id)))
  }

  return (
    <form action={action} className="space-y-3 py-5">
      <input type="hidden" name="id" value={o?.id ?? ''} />
      <input type="hidden" name="kind" value={kind} />

      <div className="grid gap-3 md:grid-cols-3">
        {LANGS.map((l) => (
          <label key={l.label} className="block">
            <span className="mb-1 block text-xs font-semibold text-mute">{l.label}</span>
            <input
              name={`${l.prefix}name`}
              required={l.required}
              disabled={disabled}
              defaultValue={(l.lang ? o?.translations?.[l.lang]?.name : o?.name) ?? ''}
              placeholder={l.lang === 'en' ? 'Brain and memory' : l.lang === 'ro' ? 'Creier și memorie' : 'Мозг и память'}
              className={field}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {o ? (
          <span className="font-mono text-xs text-mute" title="Адрес варианта в ссылках каталога — не меняется">
            {o.slug}
          </span>
        ) : (
          <input name="slug" disabled={disabled} placeholder="адрес (латиница, необязательно)" aria-label="Адрес" className={`${field} w-56 font-mono`} />
        )}
        <input
          name="sort"
          inputMode="numeric"
          disabled={disabled}
          defaultValue={o?.sort ?? 0}
          aria-label="Порядок"
          title="Порядок в списке фильтров"
          className={`${field} w-20`}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" name="is_visible" defaultChecked={o?.is_visible ?? true} disabled={disabled} className={checkbox} />
          Показывать на сайте
        </label>
        {o && <span className="text-xs text-mute">товаров: {usedBy}</span>}

        <div className="ml-auto flex items-center gap-2">
          <button type="submit" disabled={pending || disabled} className={o ? btn.small : btn.smallPrimary}>
            {pending ? '…' : o ? 'Сохранить' : 'Добавить'}
          </button>
          {o && (
            <button type="button" onClick={remove} disabled={deleting || disabled} className={btn.danger}>
              {deleting ? 'Удаляем…' : 'Удалить'}
            </button>
          )}
        </div>
      </div>

      <FormMessage state={deleteError ? { error: deleteError } : state} />
    </form>
  )
}

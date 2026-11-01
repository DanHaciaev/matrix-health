'use client'

import { useActionState } from 'react'
import { deleteService, saveService } from '@/lib/admin/actions'
import type { Service } from '@/lib/types'
import { btn, checkbox } from '../ui'
import { DeleteButton, FormMessage } from './controls'

const field = 'h-10 w-full min-w-0 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-brand'
const area = 'w-full min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed outline-none focus:border-brand'

const LANGS = [
  { prefix: '', label: 'Русский', required: true },
  { prefix: 'tr_en_', label: 'English', lang: 'en' as const },
  { prefix: 'tr_ro_', label: 'Română', lang: 'ro' as const },
]

/** Услуга (консультация, сопровождение) или форма новой услуги, если service = null */
export function ServiceForm({ service, disabled }: { service: Service | null; disabled?: boolean }) {
  const [state, action, pending] = useActionState(saveService, {})
  const s = service

  const text = (lang: 'en' | 'ro' | undefined, key: 'name' | 'summary') => (lang ? s?.translations?.[lang]?.[key] : s?.[key]) ?? ''
  const features = (lang: 'en' | 'ro' | undefined) => ((lang ? s?.translations?.[lang]?.features : s?.features) ?? []).join('\n')

  return (
    <form action={action} className="space-y-4 py-5">
      <input type="hidden" name="id" value={s?.id ?? ''} />

      <div className="grid gap-4 md:grid-cols-3">
        {LANGS.map((l) => (
          <div key={l.label} className="space-y-2">
            <p className="text-xs font-semibold text-mute">{l.label}</p>
            <input
              name={`${l.prefix}name`}
              required={l.required}
              disabled={disabled}
              defaultValue={text(l.lang, 'name')}
              placeholder="Название"
              aria-label={`Название, ${l.label}`}
              className={field}
            />
            <textarea
              name={`${l.prefix}summary`}
              rows={2}
              disabled={disabled}
              defaultValue={text(l.lang, 'summary') ?? ''}
              placeholder="Коротко, одной-двумя фразами"
              aria-label={`Описание, ${l.label}`}
              className={area}
            />
            <textarea
              name={`${l.prefix}features`}
              rows={5}
              disabled={disabled}
              defaultValue={features(l.lang)}
              placeholder={'Что входит — по пункту в строке:\nПодбор пептидов\nСписок анализов'}
              aria-label={`Что входит, ${l.label}`}
              className={area}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mute">Цена, €</span>
          <input
            name="price"
            inputMode="decimal"
            disabled={disabled}
            defaultValue={s?.price ?? ''}
            placeholder="по запросу"
            className={`${field} w-32`}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mute">Оплата</span>
          <select name="period" disabled={disabled} defaultValue={s?.period ?? 'once'} className={`${field} w-40`}>
            <option value="once">Разово</option>
            <option value="month">За месяц</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mute">Порядок</span>
          <input name="sort" inputMode="numeric" disabled={disabled} defaultValue={s?.sort ?? 0} className={`${field} w-20`} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mute">Адрес</span>
          <input name="slug" disabled={disabled} defaultValue={s?.slug ?? ''} placeholder="латиницей" className={`${field} w-44 font-mono`} />
        </label>
        <label className="flex h-10 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" defaultChecked={s?.is_published ?? true} disabled={disabled} className={checkbox} />
          Показывать на сайте
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button type="submit" disabled={pending || disabled} className={s ? btn.small : btn.smallPrimary}>
            {pending ? '…' : s ? 'Сохранить' : 'Добавить'}
          </button>
          {s && !disabled && <DeleteButton action={deleteService.bind(null, s.id)} confirm={`Удалить услугу «${s.name}»? Заявки по ней останутся.`} />}
        </div>
      </div>

      <FormMessage state={state} />
    </form>
  )
}

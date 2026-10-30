'use client'

import { useState, useTransition } from 'react'
import { refreshSite, setOrderStatus, setProductPublished } from '@/lib/admin/actions'
import { ORDER_STATUSES } from '@/lib/constants'

/** Смена статуса заказа прямо из списка */
export function StatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition()
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value
        start(() => setOrderStatus(id, next))
      }}
      aria-label="Статус заказа"
      className="h-9 rounded-md border border-line bg-surface px-2 text-sm font-medium outline-none focus:border-brand disabled:opacity-50"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
        </option>
      ))}
    </select>
  )
}

/** Переключатель «на сайте / скрыт» */
export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      aria-label={published ? 'Скрыть с сайта' : 'Показать на сайте'}
      disabled={pending}
      onClick={() => start(() => setProductPublished(id, !published))}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-50 ${published ? 'bg-brand' : 'bg-line-strong'}`}
    >
      <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${published ? 'translate-x-4' : ''}`} />
    </button>
  )
}

/** Кнопка удаления с подтверждением */
export function DeleteButton({ action, confirm, label = 'Удалить' }: { action: () => Promise<void>; confirm: string; label?: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirm)) start(() => action())
      }}
      className="inline-flex h-9 items-center rounded-md border border-signal/40 px-3.5 text-sm font-medium text-signal hover:bg-signal-soft disabled:opacity-50"
    >
      {pending ? 'Удаляем…' : label}
    </button>
  )
}

/** Кнопка «Обновить сайт»: подтягивает свежие данные из базы */
export function RefreshSiteButton() {
  const [pending, start] = useTransition()
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await refreshSite()
          setDone(true)
        })
      }
      className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-3.5 text-sm font-medium text-ink hover:border-ink disabled:opacity-50"
    >
      {pending ? 'Обновляем…' : done ? '✓ Сайт обновлён' : 'Обновить сайт'}
    </button>
  )
}

export function FormMessage({ state }: { state: { ok?: boolean; message?: string; error?: string } }) {
  if (state.error)
    return (
      <p role="alert" className="text-sm text-signal">
        {state.error}
      </p>
    )
  if (state.ok && state.message)
    return (
      <p role="status" className="text-sm text-brand">
        ✓ {state.message}
      </p>
    )
  return null
}

'use client'

import { useActionState, useTransition } from 'react'
import { saveRequestNote, setRequestStatus } from '@/lib/admin/actions'
import { REQUEST_STATUSES } from '@/lib/constants'
import { btn, textarea } from '../ui'
import { FormMessage } from './controls'

/** Смена статуса заявки прямо из списка */
export function RequestStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition()
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value
        start(() => setRequestStatus(id, next))
      }}
      aria-label="Статус заявки"
      className="h-9 rounded-md border border-line bg-surface px-2 text-sm font-medium outline-none focus:border-brand disabled:opacity-50"
    >
      {REQUEST_STATUSES.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
        </option>
      ))}
    </select>
  )
}

/** Заметка к заявке: до какого числа оплачено сопровождение, какие анализы назначены и т. п. */
export function RequestNote({ id, note }: { id: string; note: string | null }) {
  const [state, action, pending] = useActionState(saveRequestNote, {})

  return (
    <details className="group mt-3" open={Boolean(note)}>
      <summary className="cursor-pointer list-none text-sm font-medium text-brand hover:underline [&::-webkit-details-marker]:hidden">
        {note ? 'Заметка' : '+ Добавить заметку'}
      </summary>
      <form action={action} className="mt-2 space-y-2">
        <input type="hidden" name="id" value={id} />
        <textarea
          name="admin_note"
          rows={2}
          defaultValue={note ?? ''}
          placeholder="Видна только сотрудникам: оплачено до…, назначенные анализы, договорённости"
          className={`${textarea} text-sm`}
        />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className={btn.small}>
            {pending ? 'Сохраняем…' : 'Сохранить'}
          </button>
          <FormMessage state={state} />
        </div>
      </form>
    </details>
  )
}

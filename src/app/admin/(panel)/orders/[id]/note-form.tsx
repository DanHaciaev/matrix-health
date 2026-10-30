'use client'

import { useActionState } from 'react'
import { FormMessage } from '@/components/admin/controls'
import { btn, textarea } from '@/components/ui'
import { saveOrderNote } from '@/lib/admin/actions'

export function NoteForm({ id, note }: { id: string; note: string | null }) {
  const [state, action, pending] = useActionState(saveOrderNote, {})

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="admin_note"
        rows={4}
        defaultValue={note ?? ''}
        placeholder="Видна только сотрудникам: договорённости, трек-номер, что уточнить…"
        className={textarea}
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={btn.small}>
          {pending ? 'Сохраняем…' : 'Сохранить заметку'}
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  )
}

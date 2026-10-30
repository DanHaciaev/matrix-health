'use client'

import { useState } from 'react'
import { IconClose, IconPlus } from '../icons'

type Col = { key: string; placeholder: string; width?: string; inputMode?: 'numeric' | 'decimal' }
type RowData = Record<string, string | number | undefined>

let seq = 0
const withKey = (r: RowData): RowData & { _k: string } => ({ ...r, _k: `r${++seq}` })

/** Таблица строк с добавлением/удалением. Значение уходит в форму JSON-ом через скрытое поле. */
export function RowsEditor({ name, cols, initial, addLabel }: { name: string; cols: Col[]; initial: RowData[]; addLabel: string }) {
  const [rows, setRows] = useState(() => initial.map(withKey))

  const update = (k: string, key: string, value: string) => setRows((rs) => rs.map((r) => (r._k === k ? { ...r, [key]: value } : r)))
  const payload = rows.map(({ _k, ...r }) => (void _k, r))

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(payload)} />
      {rows.length > 0 && (
        <div className="mb-2 space-y-2">
          {rows.map((r) => (
            <div key={r._k} className="flex gap-2">
              {cols.map((c) => (
                <input
                  key={c.key}
                  value={String(r[c.key] ?? '')}
                  onChange={(e) => update(r._k, c.key, e.target.value)}
                  placeholder={c.placeholder}
                  inputMode={c.inputMode}
                  aria-label={c.placeholder}
                  className={`h-10 min-w-0 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-brand ${c.width ?? 'flex-1'}`}
                />
              ))}
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((x) => x._k !== r._k))}
                aria-label="Удалить строку"
                className="flex size-10 shrink-0 items-center justify-center rounded-md text-mute hover:bg-signal-soft hover:text-signal"
              >
                <IconClose size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, withKey({})])}
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-brand hover:bg-brand-soft"
      >
        <IconPlus size={16} /> {addLabel}
      </button>
    </div>
  )
}

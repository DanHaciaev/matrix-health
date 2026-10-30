'use client'

import { useActionState } from 'react'
import { deleteCategory, saveCategory } from '@/lib/admin/actions'
import type { Category } from '@/lib/types'
import { btn } from '../ui'
import { DeleteButton, FormMessage } from './controls'

const field = 'h-10 min-w-0 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-brand'

export function CategoryForm({ category, count }: { category: Category | null; count?: number }) {
  const [state, action, pending] = useActionState(saveCategory, {})
  const c = category

  return (
    <form action={action} className="grid gap-2 py-4 md:grid-cols-[1.2fr_1fr_1.6fr_70px_auto] md:items-start">
      <input type="hidden" name="id" value={c?.id ?? ''} />
      <input name="name" required defaultValue={c?.name ?? ''} placeholder="Название" aria-label="Название" className={field} />
      <input name="slug" defaultValue={c?.slug ?? ''} placeholder="адрес (латиница)" aria-label="Адрес" className={`${field} font-mono`} />
      <input name="description" defaultValue={c?.description ?? ''} placeholder="Подпись: «Витамины, минералы»" aria-label="Описание" className={field} />
      <input name="sort" inputMode="numeric" defaultValue={c?.sort ?? 0} aria-label="Порядок" title="Порядок" className={field} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className={c ? btn.small : btn.smallPrimary}>
          {pending ? '…' : c ? 'Сохранить' : 'Добавить'}
        </button>
        {c && (
          <DeleteButton
            action={deleteCategory.bind(null, c.id)}
            confirm={count ? `В категории ${count} товаров — они останутся без категории. Удалить?` : 'Удалить категорию?'}
          />
        )}
      </div>
      <div className="md:col-span-5">
        <FormMessage state={state} />
      </div>
    </form>
  )
}

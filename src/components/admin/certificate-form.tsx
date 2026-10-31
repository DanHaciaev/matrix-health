'use client'

import Link from 'next/link'
import { startTransition, useActionState } from 'react'
import { deleteCertificate, saveCertificate } from '@/lib/admin/actions'
import { DOC_TYPES } from '@/lib/constants'
import type { Certificate } from '@/lib/types'
import { IconFile } from '../icons'
import { btn, checkbox, input, label } from '../ui'
import { DeleteButton, FormMessage } from './controls'

type Opt = { id: string; name: string; batch: string | null }

export function CertificateForm({ cert, products }: { cert: Certificate | null; products: Opt[] }) {
  const [state, action, pending] = useActionState(saveCertificate, {})

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
      className="max-w-2xl space-y-5 rounded-lg border border-line bg-surface p-5 sm:p-6"
    >
      <input type="hidden" name="id" value={cert?.id ?? ''} />
      <input type="hidden" name="file_url" value={cert?.file_url ?? ''} />

      <label className="block">
        <span className={label}>Товар</span>
        <select name="product_id" defaultValue={cert?.product_id ?? ''} className={input}>
          <option value="">Не привязан к товару</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.batch ? ` — LOT ${p.batch}` : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <label className="block">
          <span className={label}>Название документа</span>
          <input name="title" required defaultValue={cert?.title ?? 'Сертификат анализа'} className={input} />
        </label>
        <label className="block">
          <span className={label}>Тип</span>
          <select name="doc_type" defaultValue={cert?.doc_type ?? 'COA'} className={input}>
            {DOC_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Название · English</span>
          <input
            name="tr_en_title"
            defaultValue={cert ? (cert.translations?.en?.title ?? '') : 'Certificate of Analysis'}
            placeholder="Certificate of Analysis"
            className={input}
          />
        </label>
        <label className="block">
          <span className={label}>Название · Română</span>
          <input
            name="tr_ro_title"
            defaultValue={cert ? (cert.translations?.ro?.title ?? '') : 'Certificat de analiză'}
            placeholder="Certificat de analiză"
            className={input}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={label}>Партия (LOT)</span>
          <input name="batch" defaultValue={cert?.batch ?? ''} className={`${input} font-mono text-sm`} />
        </label>
        <label className="block">
          <span className={label}>Дата выдачи</span>
          <input name="issued_at" type="date" defaultValue={cert?.issued_at ?? ''} className={input} />
        </label>
        <label className="block">
          <span className={label}>Лаборатория</span>
          <input name="lab" defaultValue={cert?.lab ?? ''} className={input} />
        </label>
      </div>

      <div>
        <span className={label}>Файл</span>
        {cert?.file_url && (
          <a href={cert.file_url} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 text-sm text-brand hover:underline">
            <IconFile size={16} /> Текущий файл
          </a>
        )}
        <input
          type="file"
          name="file"
          accept="application/pdf,image/*"
          className="block w-full text-sm text-ink-2 file:mr-3 file:h-9 file:rounded-md file:border file:border-line-strong file:bg-surface file:px-3 file:text-sm file:font-medium hover:file:border-ink"
        />
        <span className="mt-1 block text-xs text-mute">PDF или изображение до 15 МБ{cert?.file_url ? ' — заменит текущий файл' : ''}</span>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
        <input type="checkbox" name="is_published" defaultChecked={cert?.is_published ?? true} className={checkbox} />
        Показывать на сайте
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="submit" disabled={pending} className={btn.smallPrimary}>
          {pending ? 'Сохраняем…' : cert ? 'Сохранить' : 'Добавить документ'}
        </button>
        <Link href="/admin/certificates" className="text-sm text-mute hover:text-ink">
          Отмена
        </Link>
        <FormMessage state={state} />
        {cert && (
          <div className="ml-auto">
            <DeleteButton action={deleteCertificate.bind(null, cert.id)} confirm="Удалить документ и файл?" />
          </div>
        )}
      </div>
    </form>
  )
}

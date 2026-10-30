'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { IconArrowLeft, IconClose, IconUpload } from '../icons'

/** Фото товара: уже загруженные (можно убрать и поменять порядок) + новые файлы. */
export function ImageManager({ initial }: { initial: string[] }) {
  const [kept, setKept] = useState(initial)
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const moveFirst = (url: string) => setKept((k) => [url, ...k.filter((u) => u !== url)])

  return (
    <div>
      <input type="hidden" name="images_keep" value={JSON.stringify(kept)} />
      <input type="hidden" name="images_prev" value={JSON.stringify(initial)} />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {kept.map((url, i) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-line bg-sand">
            <Image src={url} alt="" fill sizes="120px" className="object-contain p-1" />
            {i === 0 && <span className="absolute bottom-1 left-1 rounded-sm bg-ink px-1.5 text-[11px] text-white">Главное</span>}
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              {i > 0 && (
                <button type="button" onClick={() => moveFirst(url)} title="Сделать главным" className="flex size-7 items-center justify-center rounded-sm bg-white shadow">
                  <IconArrowLeft size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setKept((k) => k.filter((u) => u !== url))}
                title="Убрать"
                className="flex size-7 items-center justify-center rounded-sm bg-white text-signal shadow"
              >
                <IconClose size={14} />
              </button>
            </div>
          </div>
        ))}

        {previews.map((src) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-md border border-dashed border-brand bg-brand-soft/40">
            {/* eslint-disable-next-line @next/next/no-img-element -- локальное превью до загрузки */}
            <img src={src} alt="" className="size-full object-contain p-1" />
            <span className="absolute bottom-1 left-1 rounded-sm bg-brand px-1.5 text-[11px] text-white">Новое</span>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-line-strong text-center text-xs text-mute hover:border-ink hover:text-ink">
          <IconUpload size={20} />
          Добавить
          <input
            ref={fileRef}
            type="file"
            name="images_new"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              previews.forEach((p) => URL.revokeObjectURL(p))
              setPreviews(Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)))
            }}
          />
        </label>
      </div>

      <p className="mt-2 text-xs text-mute">
        JPG, PNG или WebP до 5 МБ. Лучше квадратные, на светлом фоне. Новые фото загрузятся при сохранении.
        {previews.length > 0 && (
          <button
            type="button"
            className="ml-2 text-signal underline"
            onClick={() => {
              previews.forEach((p) => URL.revokeObjectURL(p))
              setPreviews([])
              if (fileRef.current) fileRef.current.value = ''
            }}
          >
            Отменить новые
          </button>
        )}
      </p>
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { tone as toneOf } from '@/lib/tones'
import { ProductVisual } from './product-visual'

export function ProductGallery({
  images,
  form,
  name,
  pack,
  tone,
}: {
  images: string[]
  form: string
  name: string
  pack: string | null
  tone: number | null | undefined
}) {
  const [active, setActive] = useState(0)
  const current = images[active]
  const t = toneOf(tone)

  return (
    <div className="flex flex-col gap-3">
      <div className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[32px] ${t.bg}`}>
        <div aria-hidden className="absolute size-[70%] rounded-full bg-white/35" />
        <ProductVisual
          form={form}
          image={current}
          alt={name}
          name={name}
          pack={pack}
          tone={tone}
          size="lg"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              aria-pressed={i === active}
              className={`relative aspect-square overflow-hidden rounded-2xl ring-offset-2 ring-offset-paper transition ${t.bg} ${
                i === active ? 'ring-2 ring-brand' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

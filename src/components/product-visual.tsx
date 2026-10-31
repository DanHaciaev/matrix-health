import Image from 'next/image'
import { tone as toneOf, type Tone } from '@/lib/tones'

type Size = 'sm' | 'md' | 'lg'

// Пока у товара нет фото, рисуем упаковку по форме выпуска: с объёмом,
// ребристой крышкой и этикеткой с названием в цвете категории.
export function ProductVisual({
  form,
  image,
  alt,
  size = 'md',
  name,
  pack,
  tone,
  sizes,
  priority,
}: {
  form: string
  image?: string | null
  alt: string
  size?: Size
  name?: string
  pack?: string | null
  /** Порядок категории (sort) — определяет цвет этикетки */
  tone?: number | null
  sizes?: string
  priority?: boolean
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        sizes={sizes ?? '(max-width: 768px) 50vw, 25vw'}
        priority={priority}
        className="object-contain p-[8%]"
      />
    )
  }

  const t = toneOf(tone)
  const scale = { sm: 'scale-[0.4]', md: 'scale-[0.72] sm:scale-[0.9] lg:scale-[1.05]', lg: 'scale-[1.3] sm:scale-[1.7]' }[size]
  const label = { name: shorten(name ?? alt), pack: pack ?? '' }

  return (
    <div role="img" aria-label={alt} className={`flex items-end justify-center drop-shadow-[0_18px_16px_rgba(15,26,68,0.16)] ${scale}`}>
      {form === 'vials' && <Vial t={t} {...label} />}
      {form === 'capsules' && <Jar t={t} {...label} />}
      {form === 'tablets' && <Carton t={t} {...label} />}
      {form === 'powder' && <Tub t={t} {...label} />}
      {form === 'liquid' && <Dropper t={t} {...label} />}
    </div>
  )
}

function shorten(s: string) {
  return s.length > 26 ? `${s.slice(0, 24).trim()}…` : s
}

type P = { t: Tone; name: string; pack: string }

const ribbed = 'bg-[repeating-linear-gradient(90deg,#0b1a5c_0_3px,#2a3a86_3px_5px)]'
const plastic = 'bg-linear-to-r from-[#e3e8f2] via-white to-[#d5dcea]'
const gloss = 'pointer-events-none absolute inset-y-2 left-[14%] w-[9%] rounded-full bg-white/45'

function Jar({ t, name, pack }: P) {
  return (
    <div className="flex flex-col items-center">
      <div className={`h-7 w-[72px] rounded-t-[7px] rounded-b-[2px] ${ribbed}`} />
      <div className="h-1.5 w-[80px] rounded-[2px] bg-[#cdd5e6]" />
      <div className={`relative h-[124px] w-[100px] overflow-hidden rounded-[16px] rounded-t-[10px] ${plastic}`}>
        <div className={`absolute inset-x-0 top-[22px] flex h-[66px] flex-col justify-center gap-1 px-2.5 ${t.label}`}>
          <span className="line-clamp-2 text-[8.5px] leading-[1.15] font-semibold tracking-wide text-white uppercase">{name}</span>
          <span className="h-px w-6 bg-white/50" />
          <span className="text-[7px] text-white/80">{pack}</span>
        </div>
        <span className={gloss} />
      </div>
    </div>
  )
}

function Vial({ t, name, pack }: P) {
  return (
    <div className="flex flex-col items-center">
      <div className={`h-4 w-10 rounded-t-[5px] ${t.label}`} />
      <div className="h-3 w-[46px] rounded-[2px] bg-linear-to-r from-[#aeb5c4] via-[#f1f3f7] to-[#a3abbb]" />
      <div className="h-2 w-8 bg-[#e8ecf4]" />
      <div className="relative h-[100px] w-[60px] overflow-hidden rounded-t-[8px] rounded-b-[14px] border border-white bg-linear-to-r from-[#dce3f0] via-white to-[#d0d8e8]">
        <div className="absolute inset-x-0 top-[18px] flex h-[50px] flex-col bg-white">
          <span className={`h-2 ${t.label}`} />
          <span className={`mt-1.5 line-clamp-2 px-1.5 text-[6.5px] leading-[1.15] font-semibold uppercase ${t.text}`}>{name}</span>
          <span className="mt-auto mb-1.5 px-1.5 text-[5.5px] text-mute">{pack}</span>
        </div>
        <span className="absolute inset-x-1.5 bottom-1 h-4 rounded-b-[10px] bg-[#f4f0e6]" />
        <span className={gloss} />
      </div>
    </div>
  )
}

function Tub({ t, name, pack }: P) {
  return (
    <div className="flex flex-col items-center">
      <div className={`h-5 w-[124px] rounded-t-[8px] rounded-b-[2px] ${ribbed}`} />
      <div className={`relative h-[92px] w-[132px] overflow-hidden rounded-t-[4px] rounded-b-[18px] ${plastic}`}>
        <div className={`absolute inset-x-0 top-[16px] flex h-[56px] items-center gap-2.5 px-3 ${t.label}`}>
          <span className="size-7 shrink-0 rounded-full border-2 border-white/80" />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="line-clamp-2 text-[8.5px] leading-[1.15] font-semibold tracking-wide text-white uppercase">{name}</span>
            <span className="text-[7px] text-white/80">{pack}</span>
          </span>
        </div>
        <span className={gloss} />
      </div>
    </div>
  )
}

function Carton({ t, name, pack }: P) {
  return (
    <div className="relative flex items-end pr-8">
      {/* Блистер за коробкой */}
      <div className="absolute right-0 bottom-3 grid w-[74px] rotate-[12deg] grid-cols-2 gap-1.5 rounded-[8px] border border-[#c9d0de] bg-linear-to-br from-[#f7f8fb] to-[#dfe4ee] p-2">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="aspect-square rounded-full border border-[#cdd3e0] bg-white" />
        ))}
      </div>
      <div className={`relative z-10 flex h-[128px] w-[96px] flex-col overflow-hidden rounded-[7px] ${t.label}`}>
        <div className="mt-5 bg-white px-2.5 py-2">
          <span className={`line-clamp-2 text-[8.5px] leading-[1.15] font-semibold uppercase ${t.text}`}>{name}</span>
          <span className="mt-0.5 block text-[6.5px] text-mute">{pack}</span>
        </div>
        <div className="mt-auto mb-3 ml-2.5 flex items-center gap-1">
          <span className="h-2.5 w-5 rounded-full bg-white/85" />
          <span className="size-2.5 rounded-full bg-white/55" />
        </div>
        <span className="pointer-events-none absolute inset-y-0 left-2 w-2.5 bg-white/12" />
      </div>
    </div>
  )
}

function Dropper({ t, name, pack }: P) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-7 w-5 rounded-t-full bg-linear-to-r from-[#0b1a5c] via-[#2a3a86] to-[#0b1a5c]" />
      <div className={`h-4 w-9 rounded-[3px] ${ribbed}`} />
      <div className="relative h-[100px] w-[64px] overflow-hidden rounded-t-[10px] rounded-b-[14px] bg-linear-to-r from-[#7a3e17] via-[#a85a26] to-[#6d3613]">
        <div className="absolute inset-x-0 top-[22px] flex h-[52px] flex-col bg-[#fbf8f2] px-1.5 py-1.5">
          <span className={`line-clamp-2 text-[6.5px] leading-[1.15] font-semibold uppercase ${t.text}`}>{name}</span>
          <span className={`mt-auto h-1 w-6 rounded-full ${t.label}`} />
          <span className="mt-1 text-[5.5px] text-mute">{pack}</span>
        </div>
        <span className={gloss} />
      </div>
    </div>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import mark from '../../public/brand/mark.png'

// Знак клиента (фигура в позе лотоса) — файл public/brand/mark.png, вырезан из public/logo.PNG.
export function LogoMark({ className = 'h-10 w-auto' }: { className?: string }) {
  return <Image src={mark} alt="" className={className} priority />
}

export function Logo({
  name,
  href,
  light = false,
  className = '',
}: {
  name: string
  href: string
  light?: boolean
  className?: string
}) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 whitespace-nowrap ${className}`} aria-label={name}>
      {light ? (
        <span className="flex size-12 items-center justify-center rounded-2xl bg-white p-1.5">
          <LogoMark className="h-auto w-full" />
        </span>
      ) : (
        <LogoMark className="h-11 w-auto" />
      )}
      <span className={`font-logo text-[22px] leading-none tracking-[0.04em] uppercase ${light ? 'text-white' : 'text-brand'}`}>
        {name}
      </span>
    </Link>
  )
}

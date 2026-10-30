import Link from 'next/link'

// Знак: аптечный крест, у которого одно плечо — лист. Рядом — название магазина из настроек.
export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="currentColor" />
      <path d="M16.5 9.5h7v7h7v7h-7v7h-7v-7h-7v-7h7z" fill="#fff" />
      <path d="M23.5 16.5c0-4.2 3-7.2 7.5-7.2 0 4.5-3 7.2-7.5 7.2z" fill="#f6c76b" />
    </svg>
  )
}

export function Logo({ name, light = false, className = '' }: { name: string; light?: boolean; className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 whitespace-nowrap ${light ? 'text-white' : 'text-ink'} ${className}`}>
      <LogoMark className={`size-9 shrink-0 ${light ? 'text-white/15' : 'text-brand'}`} />
      <span className="text-[19px] leading-none font-bold tracking-[-0.02em]">{name}</span>
    </Link>
  )
}

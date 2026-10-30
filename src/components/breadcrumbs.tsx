import Link from 'next/link'

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Навигация" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-mute">
      <Link href="/" className="hover:text-ink">
        Главная
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span className="text-line-strong">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-2">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

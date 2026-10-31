import Link from 'next/link'
import { getI18n } from '@/i18n/server'

/** Хлебные крошки. href пунктов — уже с языком (через i18n.path). */
export async function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const { t, path } = await getI18n()

  return (
    <nav aria-label={t.nav.breadcrumbs} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-mute">
      <Link href={path('/')} className="hover:text-ink">
        {t.nav.home}
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

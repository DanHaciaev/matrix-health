import type { Metadata } from 'next'

// Админка всегда рендерится по запросу (читает сессию), статическая оболочка ей не нужна.
export const instant = false

export const metadata: Metadata = {
  title: { default: 'Админка', template: '%s — Админка' },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: LayoutProps<'/admin'>) {
  return <div className="min-h-dvh bg-paper">{children}</div>
}

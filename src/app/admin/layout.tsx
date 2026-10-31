import type { Metadata } from 'next'
import { fontVariables } from '../fonts'
import '../globals.css'

// Админка — отдельный корневой layout: она на русском и не зависит от языка сайта.
// Всегда рендерится по запросу (читает сессию), статическая оболочка ей не нужна.
export const instant = false

export const metadata: Metadata = {
  title: { default: 'Админка', template: '%s — Админка' },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <html lang="ru" className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh bg-paper font-sans text-ink selection:bg-brand selection:text-white">{children}</body>
    </html>
  )
}

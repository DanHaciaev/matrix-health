import type { Metadata } from 'next'
import { LOCALES, LANG_NAMES } from '@/i18n/config'
import { fontVariables } from './fonts'
import './globals.css'

// 404 для адресов, которые не подошли ни к одному маршруту (например, неизвестный язык /de/...).
// Язык здесь неизвестен, поэтому предлагаем все три.
export const metadata: Metadata = { title: '404 — Page not found' }

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh items-center justify-center bg-paper px-6 font-sans text-ink">
        <div className="text-center">
          <p className="text-[clamp(6rem,18vw,11rem)] leading-none font-bold tracking-[-0.05em] text-brand-soft">404</p>
          <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
          <div className="mt-8 flex justify-center gap-3">
            {LOCALES.map((l) => (
              <a key={l} href={`/${l}`} className="rounded-full border border-line-strong bg-surface px-5 py-2.5 font-medium hover:border-brand hover:text-brand">
                {LANG_NAMES[l].name}
              </a>
            ))}
          </div>
        </div>
      </body>
    </html>
  )
}

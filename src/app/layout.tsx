import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Onest } from 'next/font/google'
import { getSettings } from '@/lib/data'
import './globals.css'

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin', 'cyrillic'],
})

// Только для номеров партий и артикулов
const mono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
})

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return {
    title: { default: s.store_name, template: `%s — ${s.store_name}` },
    description: s.tagline ?? undefined,
  }
}

export const viewport: Viewport = {
  themeColor: '#17694a',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ru" className={`${onest.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh bg-paper font-sans text-ink selection:bg-brand selection:text-white">
        {children}
      </body>
    </html>
  )
}

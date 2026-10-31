import type { Metadata, Viewport } from 'next'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { I18nProvider } from '@/i18n/client'
import { LOCALES } from '@/i18n/config'
import { DICTIONARIES } from '@/i18n/dictionaries'
import { getI18n } from '@/i18n/server'
import { getSettings } from '@/lib/data'
import { localizeSettings } from '@/lib/localize'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { fontVariables } from '../fonts'
import '../globals.css'

// Три языковые версии сайта собираются заранее: /en, /ro, /ru
export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata(): Promise<Metadata> {
  const [{ lang }, settings] = await Promise.all([getI18n(), getSettings()])
  const s = localizeSettings(settings, lang)
  return {
    title: { default: s.store_name, template: `%s — ${s.store_name}` },
    description: s.tagline ?? undefined,
  }
}

export const viewport: Viewport = {
  themeColor: '#0b2386',
}

export default async function SiteLayout({ children }: LayoutProps<'/[lang]'>) {
  const { lang, t } = await getI18n()

  return (
    <html lang={lang} className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh bg-paper font-sans text-ink selection:bg-brand selection:text-white">
        <I18nProvider lang={lang} dict={DICTIONARIES[lang]}>
          <div className="flex min-h-dvh flex-col overflow-x-clip">
            {!isSupabaseConfigured && <p className="bg-signal px-4 py-2 text-center text-sm text-white">{t.banner.notConnected}</p>}
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}

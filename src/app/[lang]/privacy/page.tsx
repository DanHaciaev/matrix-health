import type { Metadata } from 'next'
import { PageHead } from '@/components/page-head'
import { wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { getShop } from '@/lib/shop'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.meta.privacy }
}

export default async function PrivacyPage() {
  const { i18n, settings: s } = await getShop()
  const { t, fmt } = i18n
  const p = t.privacy

  const vars = {
    email: s.email ?? p.ourEmail,
    phone: s.phone ? fmt(p.phoneSuffix, { phone: s.phone }) : '',
  }

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead crumb={t.meta.privacy} title={t.meta.privacy} lead={fmt(p.lead, { store: s.store_name })} />
      <div className="max-w-3xl py-14">
        {p.sections.map((section, i) => (
          <section key={section.title} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[40px_1fr]">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">{i + 1}</span>
            <div>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 leading-relaxed text-ink-2">{fmt(section.text, vars)}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

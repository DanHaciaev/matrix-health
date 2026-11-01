import type { Metadata } from 'next'
import { IconPhone } from '@/components/icons'
import { PageHead } from '@/components/page-head'
import { wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { telHref } from '@/lib/format'
import { getShop } from '@/lib/shop'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.meta.contacts }
}

export default async function ContactsPage() {
  const { i18n, settings: s } = await getShop()
  const c = i18n.t.contacts

  const rows: { label: string; value: React.ReactNode }[] = []
  if (s.phone)
    rows.push({
      label: c.phone,
      value: (
        <a href={telHref(s.phone)} className="tabular-nums hover:text-brand">
          {s.phone}
        </a>
      ),
    })
  if (s.email)
    rows.push({
      label: c.email,
      value: (
        <a href={`mailto:${s.email}`} className="hover:text-brand">
          {s.email}
        </a>
      ),
    })
  if (s.address) rows.push({ label: c.address, value: s.address })
  if (s.working_hours) rows.push({ label: c.hours, value: s.working_hours })

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead crumb={i18n.t.meta.contacts} title={i18n.t.meta.contacts} lead={c.lead} />

      <div className="grid gap-12 py-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <dl className="border-t border-line-strong text-lg">
          {rows.map((r) => (
            <div key={r.label} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[180px_1fr] sm:gap-6">
              <dt className="text-[15px] text-mute">{r.label}</dt>
              <dd className="font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>

        <div className="h-fit rounded-[32px] bg-brand p-8 text-white sm:p-10">
          <p className="text-2xl font-semibold tracking-[-0.02em]">{c.cardTitle}</p>
          <p className="mt-3 leading-relaxed text-white/70">{c.cardText}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {s.phone && (
              <a
                href={telHref(s.phone)}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-semibold text-brand-dark tabular-nums hover:brightness-105"
              >
                <IconPhone size={18} /> {s.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { IconPhone } from '@/components/icons'
import { PageHead } from '@/components/page-head'
import { btn, wrap } from '@/components/ui'
import { getI18n } from '@/i18n/server'
import { telHref } from '@/lib/format'
import { getShop, getShopServices } from '@/lib/shop'
import { ConsultationPlanner } from './consultation-planner'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.meta.consultation, description: t.meta.consultationDescription }
}

export default async function ConsultationPage() {
  const [{ i18n, settings: s }, services] = await Promise.all([getShop(), getShopServices()])
  const { t } = i18n
  const c = t.consultation

  const steps = (
    <section className="pb-12 lg:pb-16">
      <h2 className="text-2xl font-semibold tracking-[-0.02em]">{c.stepsTitle}</h2>
      <ol className="mt-6 grid gap-px overflow-hidden rounded-[28px] bg-line ring-1 ring-line md:grid-cols-3">
        {c.steps.map((step, i) => (
          <li key={step.title} className="bg-surface p-6 lg:p-8">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
            <p className="mt-4 text-lg font-semibold">{step.title}</p>
            <p className="mt-1.5 leading-relaxed text-ink-2">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )

  return (
    <div className={`${wrap} pt-6 lg:pt-8`}>
      <PageHead
        crumb={t.nav.consultation}
        title={
          <>
            {c.titleStart} <span className="text-brand">{c.titleAccent}</span>
          </>
        }
        lead={c.lead}
      />

      {services.length > 0 ? (
        <ConsultationPlanner services={services} hours={s.working_hours}>
          {steps}
        </ConsultationPlanner>
      ) : (
        // Услуги ещё не заведены в базе — предлагаем связаться напрямую
        <section className="py-12 lg:py-14">
          <div className="flex flex-col gap-6 rounded-[32px] bg-periwinkle p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-xl text-lg leading-relaxed text-ink-2">{c.empty}</p>
            <div className="flex flex-wrap gap-3">
              {s.phone && (
                <a href={telHref(s.phone)} className={btn.dark}>
                  <IconPhone size={18} /> {s.phone}
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

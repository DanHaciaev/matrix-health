'use client'

import Link from 'next/link'
import { startTransition, useActionState, useRef, useState } from 'react'
import { IconArrow, IconCheck } from '@/components/icons'
import { btn, input, label, textarea } from '@/components/ui'
import { useI18n } from '@/i18n/client'
import { orderNo } from '@/lib/format'
import { CONTACT_METHODS } from '@/lib/constants'
import type { Service } from '@/lib/types'
import { requestService, type RequestState } from './actions'

/** Карточки услуг и форма заявки. Кнопка «Выбрать» на карточке отмечает услугу в форме и прокручивает к ней. */
export function ConsultationPlanner({ services, hours, children }: { services: Service[]; hours: string | null; children?: React.ReactNode }) {
  const { t } = useI18n()
  const c = t.consultation
  const [selected, setSelected] = useState(services[0]?.id ?? '')
  // Пока посетитель сам ничего не выбрал, карточки не подсвечиваются
  const [picked, setPicked] = useState(false)
  // Новый ключ — чистая форма для следующей заявки
  const [round, setRound] = useState(0)
  const formRef = useRef<HTMLElement>(null)

  const select = (id: string) => {
    setSelected(id)
    setPicked(true)
  }

  const choose = (id: string) => {
    select(id)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section className="grid gap-4 py-12 md:grid-cols-2 lg:py-14">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} selected={picked && selected === s.id} onChoose={() => choose(s.id)} />
        ))}
      </section>

      {children}

      <section
        ref={formRef}
        id="request"
        className="grid scroll-mt-32 gap-10 rounded-[32px] bg-surface p-6 ring-1 ring-line sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:p-14"
      >
        <div>
          <h2 className="text-[clamp(1.9rem,3.6vw,2.75rem)] leading-[1.08] font-bold tracking-[-0.03em]">{c.formTitle}</h2>
          <p className="mt-3 text-lg leading-relaxed text-ink-2">{c.formLead}</p>
          {hours && <p className="mt-1 text-mute">{hours}</p>}
          <p className="mt-8 max-w-sm rounded-2xl bg-sand px-4 py-3 text-sm leading-relaxed text-ink-2">{c.disclaimer}</p>
        </div>

        <RequestForm
          key={round}
          services={services}
          selected={selected}
          onSelect={select}
          hours={hours}
          onAgain={() => setRound((r) => r + 1)}
        />
      </section>
    </>
  )
}

function usePrice() {
  const { t, money } = useI18n()
  return (s: Service) =>
    s.price === null ? t.consultation.priceOnRequest : s.period === 'month' ? `${money(s.price)} ${t.consultation.perMonth}` : money(s.price)
}

function ServiceCard({ service: s, selected, onChoose }: { service: Service; selected: boolean; onChoose: () => void }) {
  const { t, money } = useI18n()
  const c = t.consultation
  // Ежемесячное сопровождение — тёмная карточка, разовая консультация — светлая
  const dark = s.period === 'month'

  return (
    <article
      className={`flex flex-col rounded-[28px] p-7 transition-shadow sm:p-9 ${dark ? 'bg-brand text-white' : 'bg-periwinkle'} ${
        selected ? 'ring-2 ring-offset-4 ring-offset-paper ' + (dark ? 'ring-brand' : 'ring-periwinkle-ink/50') : ''
      }`}
    >
      <p className={`text-sm font-semibold ${dark ? 'text-accent' : 'text-periwinkle-ink'}`}>{dark ? c.monthly : c.once}</p>
      <h2 className="mt-3 text-[clamp(1.6rem,2.6vw,2rem)] leading-[1.1] font-bold tracking-[-0.025em] text-balance">{s.name}</h2>
      {s.summary && <p className={`mt-3 max-w-md text-[16px] leading-relaxed ${dark ? 'text-white/75' : 'text-ink-2'}`}>{s.summary}</p>}

      {s.features.length > 0 && (
        <ul className="mt-7 space-y-3">
          {s.features.map((f) => (
            <li key={f} className="flex gap-3 text-[15px] leading-snug">
              <span
                className={`mt-px flex size-5 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-white/15 text-accent' : 'bg-white text-brand'}`}
              >
                <IconCheck size={13} strokeWidth={2.4} />
              </span>
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Распорка: цена и кнопка прижаты к низу карточки, но не ближе 2rem к тексту */}
      <div className="min-h-8 flex-1" />
      <div className={`flex flex-wrap items-end justify-between gap-4 border-t pt-6 ${dark ? 'border-white/15' : 'border-periwinkle-ink/15'}`}>
        {s.price === null ? (
          <p className="text-xl font-semibold">{c.priceOnRequest}</p>
        ) : (
          <p className="flex items-baseline gap-1.5">
            <span className="text-[40px] leading-none font-bold tracking-[-0.03em] tabular-nums">{money(s.price)}</span>
            {dark && <span className="text-white/70">{c.perMonth}</span>}
          </p>
        )}
        <button
          type="button"
          onClick={onChoose}
          className={`inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-transform hover:scale-[1.02] ${
            dark ? 'bg-accent text-brand-dark' : 'bg-brand text-white'
          }`}
        >
          {selected ? (
            <>
              <IconCheck size={18} /> {c.chosen}
            </>
          ) : (
            <>
              {c.choose} <IconArrow size={18} />
            </>
          )}
        </button>
      </div>
    </article>
  )
}

function RequestForm({
  services,
  selected,
  onSelect,
  hours,
  onAgain,
}: {
  services: Service[]
  selected: string
  onSelect: (id: string) => void
  hours: string | null
  onAgain: () => void
}) {
  const { t, path, fmt, lang } = useI18n()
  const c = t.consultation
  const priceOf = usePrice()
  const [state, submit, pending] = useActionState(requestService, {} as RequestState)

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-start justify-center rounded-3xl bg-meadow p-8 sm:p-10">
        <span className="flex size-12 items-center justify-center rounded-full bg-sage text-white">
          <IconCheck size={24} strokeWidth={2.4} />
        </span>
        <p className="mt-5 text-2xl font-bold tracking-[-0.02em]">{c.successTitle}</p>
        <p className="mt-2 max-w-md leading-relaxed text-ink-2">
          {fmt(c.successText, { n: state.number ? orderNo(state.number) : '', hours: hours ? ` (${hours})` : '' })}
        </p>
        <button type="button" onClick={onAgain} className={`${btn.outline} mt-7 bg-white/60`}>
          {c.another}
        </button>
      </div>
    )
  }

  const err = Object.fromEntries(Object.entries(state.fields ?? {}).map(([k, code]) => [k, c.errors[code]])) as Partial<Record<string, string>>

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // Отправляем вручную, чтобы при ошибке введённые данные не сбрасывались
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => submit(fd))
      }}
      className="space-y-6"
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {services.length > 1 ? (
        <fieldset>
          <legend className={label}>{c.service}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label
                key={s.id}
                className={`flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors ${
                  selected === s.id ? 'border-brand bg-brand-soft ring-1 ring-brand' : 'border-line-strong hover:border-ink'
                }`}
              >
                <input type="radio" name="service_id" value={s.id} checked={selected === s.id} onChange={() => onSelect(s.id)} className="sr-only" />
                <span className="leading-snug font-medium">{s.name}</span>
                <span className="mt-1 text-sm text-mute tabular-nums">{priceOf(s)}</span>
              </label>
            ))}
          </div>
          {err.service && <p className="mt-1.5 text-sm text-signal">{err.service}</p>}
        </fieldset>
      ) : (
        <input type="hidden" name="service_id" value={selected} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.name} error={err.customer_name}>
          <input name="customer_name" autoComplete="name" className={input} aria-invalid={!!err.customer_name} />
        </Field>
        <Field label={c.phone} error={err.phone}>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+373" className={input} aria-invalid={!!err.phone} />
        </Field>
      </div>

      <fieldset>
        <legend className={label}>{c.contactMethod}</legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_METHODS.map((m, i) => (
            <label key={m} className="cursor-pointer">
              <input type="radio" name="contact_method" value={m} defaultChecked={i === 0} className="peer sr-only" />
              <span className="flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink-2 transition-colors peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand-dark peer-focus-visible:ring-4 peer-focus-visible:ring-brand/15 hover:border-ink">
                {c.contactMethods[m]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label={c.goal} hint={c.goalHint}>
        <textarea name="comment" rows={4} placeholder={c.goalPlaceholder} className={textarea} />
      </Field>

      {state.error && (
        <p role="alert" className="rounded-2xl bg-signal-soft px-3 py-2.5 text-sm text-signal">
          {c.errors[state.error]}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <button type="submit" disabled={pending} className={`${btn.primary} shrink-0`}>
          {pending ? c.sending : c.submit}
        </button>
        <p className="text-xs leading-relaxed text-mute">
          {c.consent}{' '}
          <Link href={path('/privacy')} className="underline underline-offset-2">
            {t.checkout.consentLink}
          </Link>
          .
        </p>
      </div>
    </form>
  )
}

function Field({ label: text, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={label}>{text}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm text-signal">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-sm text-mute">{hint}</span>
      )}
    </label>
  )
}

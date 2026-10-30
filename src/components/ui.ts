// Общие наборы классов. Держим их здесь, чтобы кнопки и поля выглядели одинаково везде.

export const wrap = 'mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10'

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50'

export const btn = {
  primary: `${btnBase} h-12 px-6 bg-brand text-white hover:bg-brand-dark`,
  dark: `${btnBase} h-12 px-6 bg-ink text-white hover:bg-ink-2`,
  outline: `${btnBase} h-12 px-6 border border-line-strong bg-surface text-ink hover:border-brand hover:text-brand`,
  ghost: `${btnBase} h-10 px-4 text-ink-2 hover:bg-sand hover:text-ink`,
  small: `${btnBase} h-9 px-4 text-sm border border-line-strong bg-surface text-ink hover:border-brand hover:text-brand`,
  smallPrimary: `${btnBase} h-9 px-4 text-sm bg-brand text-white hover:bg-brand-dark`,
  danger: `${btnBase} h-9 px-4 text-sm border border-signal/40 text-signal hover:bg-signal-soft`,
}

export const input =
  'h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink placeholder:text-mute/70 outline-none transition-colors hover:border-line-strong focus:border-brand focus:ring-4 focus:ring-brand/10'

export const textarea =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-mute/70 outline-none transition-colors hover:border-line-strong focus:border-brand focus:ring-4 focus:ring-brand/10'

export const label = 'mb-1.5 block text-sm font-medium text-ink-2'

export const checkbox = 'size-[18px] shrink-0 rounded accent-brand'

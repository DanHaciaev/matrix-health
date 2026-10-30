import { statusMeta } from '@/lib/constants'

export function AdminTitle({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-mute">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}

const TONES = {
  signal: 'bg-signal-soft text-signal',
  brand: 'bg-brand-soft text-brand-dark',
  ink: 'bg-ink text-white',
  mute: 'bg-sand text-mute',
}

export function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status)
  return <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[meta.tone]}`}>{meta.label}</span>
}

export function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-line bg-surface ${className}`}>
      {title && <h2 className="border-b border-line px-5 py-3.5 font-semibold">{title}</h2>}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-line-strong px-6 py-14 text-center text-ink-2">{children}</div>
}

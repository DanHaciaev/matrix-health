import { getI18n } from '@/i18n/server'
import type { Certificate } from '@/lib/types'
import { IconCheck, IconFile } from './icons'

// Карточка документа партии — показывает, как выглядит сертификат на сайте.
export async function LabSheet({ cert, className = '' }: { cert: Certificate | undefined; className?: string }) {
  if (!cert) return null
  const { t, date } = await getI18n()

  const rows: [string, string, boolean?][] = [
    [t.lab.product, cert.product?.name ?? '—'],
    [t.lab.batch, cert.batch ?? '—', true],
    [t.lab.lab, cert.lab ?? '—'],
    [t.lab.date, date(cert.issued_at), true],
  ]

  return (
    <div className={`rounded-[28px] bg-surface p-6 shadow-[0_24px_60px_-30px_rgba(15,26,68,0.35)] sm:p-7 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <IconFile size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{cert.title}</p>
          <p className="text-sm text-mute">{t.docTypes[cert.doc_type] ?? cert.doc_type}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white">
          <IconCheck size={14} /> {t.lab.complies}
        </span>
      </div>

      <dl className="mt-5 divide-y divide-line rounded-2xl bg-paper px-4 text-sm">
        {rows.map(([k, v, mono]) => (
          <div key={k} className="flex justify-between gap-4 py-3">
            <dt className="text-mute">{k}</dt>
            <dd className={`text-right font-medium ${mono ? 'font-mono' : ''}`}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useI18n } from '@/i18n/client'

export function ErrorView({ error, retry }: { error: unknown; retry: () => void }) {
  const { t } = useI18n()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-7xl font-bold tracking-[-0.04em] text-brand-soft">{t.error.oops}</p>
      <h1 className="mt-4 text-2xl font-semibold">{t.error.title}</h1>
      <p className="mt-2 text-ink-2">{t.error.text}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 h-12 rounded-full bg-ink px-6 font-medium text-white hover:bg-ink-2"
      >
        {t.error.retry}
      </button>
    </div>
  )
}

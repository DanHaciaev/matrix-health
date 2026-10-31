'use client'

export type EditLang = 'ru' | 'en' | 'ro'

const TABS: { id: EditLang; label: string; note?: string }[] = [
  { id: 'ru', label: 'Русский', note: 'основной' },
  { id: 'en', label: 'English' },
  { id: 'ro', label: 'Română' },
]

/** Вкладки языков в формах админки. Точка — перевод ещё не заполнен. */
export function LangTabs({
  value,
  onChange,
  filled,
}: {
  value: EditLang
  onChange: (lang: EditLang) => void
  filled: Partial<Record<'en' | 'ro', boolean>>
}) {
  return (
    <div role="tablist" aria-label="Язык текстов" className="sticky top-14 z-10 flex gap-1 rounded-full bg-sand p-1 lg:top-2">
      {TABS.map((t) => {
        const active = t.id === value
        const missing = t.id !== 'ru' && !filled[t.id]
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors ${
              active ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {t.label}
            {t.note && <span className="hidden text-xs font-normal text-mute sm:inline">· {t.note}</span>}
            {missing && <span className="size-1.5 rounded-full bg-signal" title="Перевод не заполнен" />}
          </button>
        )
      })}
    </div>
  )
}

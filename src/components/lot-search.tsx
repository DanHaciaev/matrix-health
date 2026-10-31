import Form from 'next/form'
import { getI18n } from '@/i18n/server'
import { IconSearch } from './icons'

// Поиск документа по номеру партии. Обычная GET-форма на /{язык}/certificates.
export async function LotSearch({ onDark, defaultValue }: { onDark?: boolean; defaultValue?: string }) {
  const { t, path } = await getI18n()

  return (
    <Form
      action={path('/certificates')}
      className={`flex w-full max-w-xl items-center gap-1.5 rounded-full p-1.5 ${onDark ? 'bg-white' : 'bg-surface ring-1 ring-line-strong focus-within:ring-2 focus-within:ring-brand'}`}
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{t.lot.aria}</span>
        <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mute" />
        <input
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={t.lot.placeholder}
          className="h-11 w-full rounded-full bg-transparent pr-2 pl-10 text-[15px] text-ink outline-none placeholder:text-mute"
        />
      </label>
      <button type="submit" className="h-11 shrink-0 rounded-full bg-brand px-5 text-[15px] font-medium text-white transition-colors hover:bg-brand-dark">
        {t.lot.button}
      </button>
    </Form>
  )
}

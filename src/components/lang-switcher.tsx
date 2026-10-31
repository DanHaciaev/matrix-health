'use client'

import { useState } from 'react'
import { useI18n } from '@/i18n/client'
import { LANG_COOKIE, LANG_NAMES, LOCALES, type Lang } from '@/i18n/config'
import { IconDown } from './icons'
import { SelectMenu } from './select-menu'

const OPTIONS = LOCALES.map((l) => ({ id: l, label: LANG_NAMES[l].short }))

/**
 * Выбор языка: кнопка «EN ⌄», в списке — только два других языка.
 * Язык не пишется в адресе, а хранится в cookie на год. После выбора страница перезагружается
 * по тому же адресу — так весь сайт (и уже загруженные в браузер страницы) сразу на новом языке.
 */
export function LangSwitcher({ align = 'right' }: { align?: 'left' | 'right' }) {
  const { lang, t } = useI18n()
  const [shown, setShown] = useState(lang)

  const switchTo = (next: Lang) => {
    setShown(next)
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    window.location.reload()
  }

  return (
    <SelectMenu<Lang>
      label={t.header.language}
      value={shown}
      options={OPTIONS}
      onChange={switchTo}
      plain
      hideSelected
      align={align}
      buttonClassName="h-11 pr-2.5 pl-3.5"
      menuClassName="w-20"
      renderValue={(o) => <span className="font-semibold text-ink">{o.label}</span>}
      renderOption={(o) => (
        <span className="w-full text-center font-semibold" title={LANG_NAMES[o.id].name}>
          {o.label}
          <span className="sr-only"> — {LANG_NAMES[o.id].name}</span>
        </span>
      )}
    />
  )
}

/** Та же кнопка без логики — пока страница загружается */
export function LangSwitcherFallback({ lang }: { lang: Lang }) {
  return (
    <span className="flex h-11 items-center gap-2 rounded-full pr-2.5 pl-3.5 text-sm">
      <span className="font-semibold text-ink">{LANG_NAMES[lang].short}</span>
      <IconDown size={16} className="text-mute" />
    </span>
  )
}

'use client'

import { createContext, use, useMemo, type ReactNode } from 'react'
import type { Lang } from './config'
import type { Dictionary } from './dictionaries/en'
import { makeI18n } from '.'

const I18nContext = createContext<{ lang: Lang; dict: Dictionary } | null>(null)

/** Отдаёт язык и словарь клиентским компонентам (кнопки, корзина, фильтры) */
export function I18nProvider({ lang, dict, children }: { lang: Lang; dict: Dictionary; children: ReactNode }) {
  const value = useMemo(() => ({ lang, dict }), [lang, dict])
  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n() {
  const ctx = use(I18nContext)
  if (!ctx) throw new Error('useI18n нужно вызывать внутри I18nProvider')
  return useMemo(() => makeI18n(ctx.lang, ctx.dict), [ctx])
}

import { notFound } from 'next/navigation'
import { lang as langParam } from 'next/root-params'
import { hasLocale, type Lang } from './config'
import { DICTIONARIES } from './dictionaries'
import { makeI18n } from '.'

// Язык берётся из адреса (/en, /ro, /ru) — без передачи через пропсы.
// Работает только в серверных компонентах внутри app/[lang].

export async function getLang(): Promise<Lang> {
  const value = await langParam()
  if (!hasLocale(value)) notFound()
  return value
}

export async function getI18n() {
  const lang = await getLang()
  return makeI18n(lang, DICTIONARIES[lang])
}

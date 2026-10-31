// Языки сайта. Английский — основной: он открывается, если язык не выбран и браузер не подсказал другой.
export const LOCALES = ['en', 'ro', 'ru'] as const
export type Lang = (typeof LOCALES)[number]
export const DEFAULT_LANG: Lang = 'en'

// Cookie, в которой запоминается выбор посетителя (ставит переключатель языка)
export const LANG_COOKIE = 'hm_lang'

export const LANG_NAMES: Record<Lang, { short: string; name: string }> = {
  en: { short: 'EN', name: 'English' },
  ro: { short: 'RO', name: 'Română' },
  ru: { short: 'RU', name: 'Русский' },
}

// Локаль для форматирования цен, дат и множественного числа
export const INTL_LOCALE: Record<Lang, string> = {
  en: 'en-IE',
  ro: 'ro-RO',
  ru: 'ru-RU',
}

export function hasLocale(value: string | undefined | null): value is Lang {
  return LOCALES.includes(value as Lang)
}

/** Выбирает язык из заголовка Accept-Language браузера */
export function matchLanguage(acceptLanguage: string | null): Lang | null {
  if (!acceptLanguage) return null
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)
  // «mo» — устаревший код молдавского, это румынский
  const found = ranked.map((r) => (r.lang === 'mo' ? 'ro' : r.lang)).find((l) => hasLocale(l))
  return (found as Lang | undefined) ?? null
}

/**
 * Адрес страницы. Язык в адресе не пишется — он хранится в cookie посетителя,
 * поэтому ссылка одинакова для всех языков: localePath('ro', '/catalog') → '/catalog'.
 * Параметр lang оставлен, чтобы при желании легко вернуть префиксы (/ro/catalog).
 */
export function localePath(_lang: Lang, path: string) {
  return path === '' ? '/' : path.startsWith('/') ? path : `/${path}`
}

/** Убирает префикс языка из адреса: '/ro/catalog' → '/catalog' */
export function stripLocale(pathname: string) {
  return pathname.replace(new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`), '') || '/'
}

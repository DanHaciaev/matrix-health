import { DICTIONARIES } from '@/i18n/dictionaries'
import type { FilterOption } from './types'

// Варианты фильтров «по умолчанию». Нужны, только пока в базе нет таблицы filter_options
// (не запущен supabase/filters.sql). После этого всё редактируется в Админка → Фильтры.

const { ru, en, ro } = DICTIONARIES

function defaults(kind: FilterOption['kind'], names: Record<string, string>): FilterOption[] {
  return Object.keys(names).map((slug, i) => ({
    id: `default-${kind}-${slug}`,
    kind,
    slug,
    name: names[slug],
    translations: {
      en: { name: (en[kind === 'form' ? 'forms' : 'purposes'] as Record<string, string>)[slug] },
      ro: { name: (ro[kind === 'form' ? 'forms' : 'purposes'] as Record<string, string>)[slug] },
    },
    sort: i + 1,
    is_visible: true,
  }))
}

export const DEFAULT_FILTERS: FilterOption[] = [...defaults('purpose', ru.purposes), ...defaults('form', ru.forms)]

/** Название варианта по slug; если варианта нет — сам slug */
export function filterName(filters: FilterOption[], kind: FilterOption['kind'], slug: string) {
  return filters.find((f) => f.kind === kind && f.slug === slug)?.name ?? slug
}

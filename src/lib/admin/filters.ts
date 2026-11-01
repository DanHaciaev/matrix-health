import 'server-only'
import { DEFAULT_FILTERS } from '../filters'
import type { FilterOption } from '../types'
import type { requireAdmin } from './auth'

type Sb = Awaited<ReturnType<typeof requireAdmin>>['sb']

/**
 * Все варианты фильтров для админки (включая скрытые).
 * ready = false — таблицы ещё нет (не запущен supabase/filters.sql), отдаём встроенный список.
 */
export async function getAdminFilters(sb: Sb): Promise<{ filters: FilterOption[]; ready: boolean }> {
  const { data, error } = await sb.from('filter_options').select('*').order('sort').order('name')
  if (error) return { filters: DEFAULT_FILTERS, ready: false }
  return { filters: (data ?? []) as FilterOption[], ready: true }
}

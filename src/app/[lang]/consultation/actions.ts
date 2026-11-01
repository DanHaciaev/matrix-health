'use server'

import type { Dictionary } from '@/i18n/dictionaries'
import { CONTACT_METHODS } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createPublicClient } from '@/lib/supabase/public'

// Ошибки возвращаются кодами — форма показывает текст на языке посетителя
export type RequestError = keyof Dictionary['consultation']['errors']

export type RequestState = {
  ok?: boolean
  number?: number
  error?: RequestError
  fields?: Partial<Record<'service' | 'customer_name' | 'phone', RequestError>>
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim()
const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

export async function requestService(_prev: RequestState, fd: FormData): Promise<RequestState> {
  // Ловушка для ботов: поле скрыто от людей
  if (str(fd, 'website')) return { ok: true, number: 0 }

  const service = str(fd, 'service_id')
  const request = {
    customer_name: str(fd, 'customer_name'),
    phone: str(fd, 'phone'),
    contact_method: str(fd, 'contact_method'),
    comment: str(fd, 'comment'),
  }

  const fields: RequestState['fields'] = {}
  if (!isUuid(service)) fields.service = 'service'
  if (request.customer_name.length < 2) fields.customer_name = 'name'
  if (request.phone.replace(/\D/g, '').length < 8) fields.phone = 'phone'
  if (!(CONTACT_METHODS as readonly string[]).includes(request.contact_method)) request.contact_method = 'phone'
  if (Object.keys(fields).length) return { error: 'check', fields }

  if (!isSupabaseConfigured) return { error: 'notConnected' }

  const { data, error } = await createPublicClient().rpc('request_service', { p_service: service, p_request: request })

  if (error) {
    // Тексты ошибок request_service — на русском; переводим известные в коды
    if (/недоступна/i.test(error.message)) return { error: 'unavailable' }
    if (/имя/i.test(error.message)) return { error: 'check', fields: { customer_name: 'name' } }
    if (/телефон/i.test(error.message)) return { error: 'check', fields: { phone: 'phone' } }
    return { error: 'failed' }
  }

  return { ok: true, number: Number(data) }
}

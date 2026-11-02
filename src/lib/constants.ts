// Назначения и формы выпуска для фильтров — в базе (таблица filter_options, Админка → Фильтры)

export const SORTS = [
  { id: 'popular', label: 'Сначала популярные' },
  { id: 'cheap', label: 'Сначала дешевле' },
  { id: 'expensive', label: 'Сначала дороже' },
  { id: 'new', label: 'Новинки' },
] as const

export type SortId = (typeof SORTS)[number]['id']

export const DOC_TYPES = ['COA', 'HPLC', 'Соответствие', 'Другое'] as const

export const ORDER_STATUSES = [
  { id: 'new', label: 'Новый', tone: 'signal' },
  { id: 'confirmed', label: 'Подтверждён', tone: 'brand' },
  { id: 'shipped', label: 'Отправлен', tone: 'brand' },
  { id: 'done', label: 'Выполнен', tone: 'ink' },
  { id: 'cancelled', label: 'Отменён', tone: 'mute' },
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]['id']

// Доставляет только курьер магазина. Почта и самовывоз остались в базе для старых заказов.
export const DELIVERY_LABELS: Record<string, string> = {
  courier: 'Курьер магазина',
  post: 'Почта Молдовы',
  pickup: 'Самовывоз',
}

// Терминала у курьера нет, поэтому картой при получении не платят
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Наличными при получении' },
  { id: 'transfer', label: 'Переводом на карту' },
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['id']

// Подписи для админки и уведомлений — со старым способом «картой» для прежних заказов
export const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Наличными при получении',
  card: 'Картой при получении',
  transfer: 'Переводом на карту',
}

// Заявки на консультацию и сопровождение
export const REQUEST_STATUSES = [
  { id: 'new', label: 'Новая', tone: 'signal' },
  { id: 'in_work', label: 'В работе', tone: 'brand' },
  { id: 'done', label: 'Завершена', tone: 'ink' },
  { id: 'cancelled', label: 'Отменена', tone: 'mute' },
] as const

export type RequestStatus = (typeof REQUEST_STATUSES)[number]['id']

/** Как клиенту удобнее, чтобы с ним связались */
export const CONTACT_METHODS = ['phone', 'viber', 'whatsapp'] as const

export type ContactMethod = (typeof CONTACT_METHODS)[number]

// Telegram — для старых заявок, на сайте его больше нет
export const CONTACT_LABELS: Record<string, string> = {
  phone: 'Звонок',
  telegram: 'Telegram',
  viber: 'Viber',
  whatsapp: 'WhatsApp',
}

export const PAGE_SIZE = 12

export function statusMeta(id: string) {
  return ORDER_STATUSES.find((s) => s.id === id) ?? ORDER_STATUSES[0]
}

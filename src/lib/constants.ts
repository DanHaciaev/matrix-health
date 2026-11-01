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

export const DELIVERY_METHODS = [
  { id: 'courier', label: 'Курьер', hint: 'По Кишинёву — на следующий день' },
  { id: 'post', label: 'Почта Молдовы', hint: 'По всей стране, 2–4 дня' },
  { id: 'pickup', label: 'Самовывоз', hint: 'Бесплатно, из пункта выдачи' },
] as const

export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]['id']

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Наличными при получении' },
  { id: 'card', label: 'Картой при получении' },
  { id: 'transfer', label: 'Переводом на карту' },
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['id']

export const PAGE_SIZE = 12

export function statusMeta(id: string) {
  return ORDER_STATUSES.find((s) => s.id === id) ?? ORDER_STATUSES[0]
}

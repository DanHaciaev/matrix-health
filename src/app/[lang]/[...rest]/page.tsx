import { notFound } from 'next/navigation'

// Любой неизвестный адрес внутри языка (/ro/что-угодно) показывает 404 с шапкой и подвалом сайта
export default function UnknownPage() {
  notFound()
}

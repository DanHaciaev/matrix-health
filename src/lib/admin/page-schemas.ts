import type { SectionDef } from '@/components/admin/page-editor'

// Какие поля у каждой страницы из таблицы pages и как они подписаны в админке.
// Новая страница = строка в pages + схема здесь + вёрстка в app/[lang]/…

export const PAGE_SCHEMAS: Record<string, SectionDef[]> = {
  peptides: [
    {
      title: 'Заголовок',
      fields: [
        { key: 'titleStart', label: 'Начало заголовка' },
        { key: 'titleAccent', label: 'Выделенная часть (синим)' },
        { key: 'lead', label: 'Подзаголовок', long: true },
      ],
    },
    {
      title: 'Что такое пептиды',
      fields: [
        { key: 'whatTitle', label: 'Заголовок' },
        { key: 'whatText', label: 'Текст', long: true },
        { key: 'peptide', label: 'Карточка «Пептид»: название' },
        { key: 'peptideText', label: 'Карточка «Пептид»: текст', long: true },
        { key: 'protein', label: 'Карточка «Белок»: название' },
        { key: 'proteinText', label: 'Карточка «Белок»: текст', long: true },
      ],
    },
    {
      title: 'Как работают',
      fields: [{ key: 'howTitle', label: 'Заголовок раздела' }],
      list: { key: 'how', item: 'Шаг', fields: [{ key: 'title', label: 'Название' }, { key: 'text', label: 'Текст', long: true }] },
    },
    {
      title: 'Что изучают',
      fields: [
        { key: 'areasTitle', label: 'Заголовок раздела' },
        { key: 'areasNote', label: 'Пояснение под заголовком', long: true },
      ],
      list: {
        key: 'areas',
        item: 'Направление',
        fields: [{ key: 'title', label: 'Название' }, { key: 'text', label: 'Текст', long: true }],
        products: true,
      },
    },
    {
      title: 'Как применяют',
      fields: [{ key: 'useTitle', label: 'Заголовок раздела' }],
      list: { key: 'use', item: 'Пункт', fields: [{ key: 'title', label: 'Название' }, { key: 'text', label: 'Текст', long: true }] },
    },
    {
      title: 'Что важно знать',
      fields: [{ key: 'safetyTitle', label: 'Заголовок раздела' }],
      list: { key: 'safety', item: 'Пункт', fields: [{ key: 'title', label: 'Название' }, { key: 'text', label: 'Текст', long: true }] },
    },
    {
      title: 'Вопросы',
      fields: [{ key: 'faqTitle', label: 'Заголовок раздела' }],
      list: { key: 'faq', item: 'Вопрос', fields: [{ key: 'q', label: 'Вопрос' }, { key: 'a', label: 'Ответ', long: true }] },
    },
    {
      title: 'Внизу страницы',
      fields: [
        { key: 'ctaTitle', label: 'Блок консультации: заголовок' },
        { key: 'ctaText', label: 'Блок консультации: текст', long: true },
        { key: 'disclaimer', label: 'Пометка мелким шрифтом', long: true },
      ],
    },
  ],
}

/** Адрес страницы на сайте — для ссылки «Открыть на сайте» */
export const PAGE_PATHS: Record<string, string> = { peptides: '/peptides' }

import Link from 'next/link'
import { AdminTitle, Empty } from '@/components/admin/parts'
import { requireAdmin } from '@/lib/admin/auth'
import { PAGE_PATHS } from '@/lib/admin/page-schemas'
import { dateTime } from '@/lib/format'

export const metadata = { title: 'Страницы' }

export default async function PagesPage() {
  const { sb } = await requireAdmin()
  const { data, error } = await sb.from('pages').select('slug, title, updated_at').order('title')

  return (
    <>
      <AdminTitle title="Страницы" sub="Тексты страниц сайта на трёх языках" />

      {error ? (
        <p className="max-w-3xl rounded-lg border border-signal/30 bg-signal-soft px-4 py-3 text-sm text-ink-2">
          <b className="text-signal">Нужно один раз выполнить SQL.</b> Откройте Supabase → SQL Editor и запустите файл{' '}
          <code className="font-mono">supabase/pages.sql</code> — он создаст страницу «Что такое пептиды» с готовым текстом.
        </p>
      ) : !data?.length ? (
        <Empty>Страниц пока нет.</Empty>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {data.map((p) => (
            <li key={p.slug} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
              <Link href={`/admin/pages/${p.slug}`} className="min-w-0 flex-1 font-medium hover:text-brand">
                {p.title}
                <span className="block text-sm font-normal text-mute">Изменена {dateTime(p.updated_at)}</span>
              </Link>
              {PAGE_PATHS[p.slug] && (
                <a href={PAGE_PATHS[p.slug]} target="_blank" rel="noreferrer" className="text-sm text-brand hover:underline">
                  Открыть на сайте
                </a>
              )}
              <Link href={`/admin/pages/${p.slug}`} className="inline-flex h-9 items-center rounded-md border border-line-strong px-3.5 text-sm font-medium hover:border-ink">
                Редактировать
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

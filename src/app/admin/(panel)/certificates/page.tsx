import Form from 'next/form'
import Link from 'next/link'
import { AdminTitle, Empty } from '@/components/admin/parts'
import { IconPlus, IconSearch } from '@/components/icons'
import { btn } from '@/components/ui'
import { requireAdmin } from '@/lib/admin/auth'
import { date } from '@/lib/format'
import type { Certificate } from '@/lib/types'

export const metadata = { title: 'Сертификаты' }

export default async function AdminCertificatesPage(props: PageProps<'/admin/certificates'>) {
  const { sb } = await requireAdmin()
  const { q, saved } = await props.searchParams
  const query = typeof q === 'string' ? q.trim().toLowerCase() : ''

  const { data } = await sb
    .from('certificates')
    .select('*, product:products(slug, name, category:categories(slug))')
    .order('issued_at', { ascending: false, nullsFirst: false })

  const all = (data ?? []) as Certificate[]
  const list = all.filter((c) => !query || [c.batch, c.title, c.lab, c.product?.name].some((v) => v?.toLowerCase().includes(query)))

  return (
    <>
      <AdminTitle title="Сертификаты" sub={`${all.length} документов · ${all.filter((c) => !c.file_url).length} без файла`}>
        <Link href="/admin/certificates/new" className={btn.smallPrimary}>
          <IconPlus size={16} /> Добавить документ
        </Link>
      </AdminTitle>

      {saved && <p className="mb-5 rounded-md bg-brand-soft px-4 py-3 text-sm text-brand-dark">✓ Документ сохранён и опубликован на сайте</p>}

      <Form action="/admin/certificates" className="relative mb-5 w-full sm:w-80">
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mute" />
        <input
          name="q"
          defaultValue={typeof q === 'string' ? q : ''}
          placeholder="Партия, товар, лаборатория"
          className="h-9 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-brand"
        />
      </Form>

      {list.length === 0 ? (
        <Empty>{all.length ? 'Ничего не найдено' : 'Документов пока нет. Загрузите первый PDF.'}</Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[720px] text-[15px]">
            <thead className="border-b border-line text-left text-sm text-mute">
              <tr>
                <th className="px-4 py-3 font-normal">Документ</th>
                <th className="px-4 py-3 font-normal">Товар</th>
                <th className="px-4 py-3 font-normal">Партия</th>
                <th className="px-4 py-3 font-normal">Дата</th>
                <th className="px-4 py-3 font-normal">Файл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((c) => (
                <tr key={c.id} className={`hover:bg-paper ${c.is_published ? '' : 'text-mute'}`}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/certificates/${c.id}`} className="font-medium hover:text-brand">
                      {c.title}
                    </Link>
                    <span className="block text-sm text-mute">
                      {c.doc_type}
                      {!c.is_published && ' · скрыт'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{c.product?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm">{c.batch ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm text-ink-2">{date(c.issued_at)}</td>
                  <td className="px-4 py-3 text-sm">
                    {c.file_url ? (
                      <a href={c.file_url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                        Открыть
                      </a>
                    ) : (
                      <span className="text-signal">нет файла</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

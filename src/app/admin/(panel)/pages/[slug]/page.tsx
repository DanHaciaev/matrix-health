import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminTitle } from '@/components/admin/parts'
import { PageEditor } from '@/components/admin/page-editor'
import { requireAdmin } from '@/lib/admin/auth'
import { PAGE_PATHS, PAGE_SCHEMAS } from '@/lib/admin/page-schemas'

export const metadata = { title: 'Редактирование страницы' }

export default async function EditPagePage(props: PageProps<'/admin/pages/[slug]'>) {
  const { slug } = await props.params
  const schema = PAGE_SCHEMAS[slug]
  if (!schema) notFound()

  const { sb } = await requireAdmin()
  const [{ data: page }, { data: products }] = await Promise.all([
    sb.from('pages').select('*').eq('slug', slug).maybeSingle(),
    sb.from('products').select('slug, name').order('name'),
  ])
  if (!page) notFound()

  return (
    <>
      <AdminTitle
        title={page.title}
        sub={
          <>
            <Link href="/admin/pages" className="text-brand hover:underline">
              Страницы
            </Link>
            {PAGE_PATHS[slug] && (
              <>
                {' · '}
                <a href={PAGE_PATHS[slug]} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                  Открыть на сайте
                </a>
              </>
            )}
          </>
        }
      />
      <PageEditor
        // Ключ меняется после сохранения — редактор берёт свежие данные из базы
        key={page.updated_at}
        slug={slug}
        schema={schema}
        content={page.content ?? {}}
        translations={page.translations ?? {}}
        products={products ?? []}
      />
    </>
  )
}

import Link from 'next/link'
import { CertificateForm } from '@/components/admin/certificate-form'
import { AdminTitle } from '@/components/admin/parts'
import { IconArrowLeft } from '@/components/icons'
import { requireAdmin } from '@/lib/admin/auth'

export const metadata = { title: 'Новый документ' }

export default async function NewCertificatePage() {
  const { sb } = await requireAdmin()
  const { data } = await sb.from('products').select('id, name, batch').order('name')

  return (
    <>
      <Link href="/admin/certificates" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink">
        <IconArrowLeft size={16} /> Сертификаты
      </Link>
      <AdminTitle title="Новый документ" />
      <CertificateForm cert={null} products={data ?? []} />
    </>
  )
}

import { NotFoundView } from '@/components/not-found-view'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <NotFoundView />
      </main>
      <SiteFooter />
    </div>
  )
}

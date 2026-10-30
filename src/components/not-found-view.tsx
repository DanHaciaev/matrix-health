import Link from 'next/link'
import { LotSearch } from './lot-search'
import { btn, wrap } from './ui'

export function NotFoundView({ title = 'Такой страницы нет' }: { title?: string }) {
  return (
    <div className={`${wrap} grid gap-10 py-20 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-20 lg:py-32`}>
      <p className="text-[clamp(6rem,18vw,13rem)] leading-none font-bold tracking-[-0.05em] text-brand-soft">404</p>
      <div>
        <h1 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-0.03em]">{title}</h1>
        <p className="mt-3 max-w-md text-lg text-ink-2">
          Возможно, товар сняли с продажи или ссылка устарела. Начните с каталога или найдите документ по номеру
          партии.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/catalog" className={btn.primary}>
            В каталог
          </Link>
          <Link href="/" className={btn.outline}>
            На главную
          </Link>
        </div>
        <div className="mt-10 max-w-xl">
          <LotSearch />
        </div>
      </div>
    </div>
  )
}

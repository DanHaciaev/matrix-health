import { Breadcrumbs } from './breadcrumbs'

export function PageHead({ title, lead, crumb }: { title: React.ReactNode; lead?: string; crumb: string }) {
  return (
    <div className="border-b border-line pb-10 lg:pb-14">
      <Breadcrumbs items={[{ label: crumb }]} />
      <h1 className="mt-6 max-w-3xl text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      {lead && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">{lead}</p>}
    </div>
  )
}

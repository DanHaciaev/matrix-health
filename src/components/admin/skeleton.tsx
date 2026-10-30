// Заглушка на время загрузки страницы админки.
// Свой loading.tsx в папке каждой страницы делает переходы по меню мгновенными:
// скелет показывается сразу, данные подгружаются следом.
export function AdminSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Загрузка">
      <div className="h-9 w-56 rounded bg-sand" />
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-lg bg-sand" />
        ))}
      </div>
      <div className="h-80 rounded-lg bg-sand" />
    </div>
  )
}

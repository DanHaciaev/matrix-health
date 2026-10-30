'use client'

import { useEffect } from 'react'

export function ErrorView({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-7xl font-bold tracking-[-0.04em] text-brand-soft">Ой</p>
      <h1 className="mt-4 text-2xl font-semibold">Что-то пошло не так</h1>
      <p className="mt-2 text-ink-2">Обновите страницу. Если ошибка повторяется — позвоните нам, оформим заказ по телефону.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 h-12 rounded-full bg-ink px-6 font-medium text-white hover:bg-ink-2"
      >
        Попробовать ещё раз
      </button>
    </div>
  )
}

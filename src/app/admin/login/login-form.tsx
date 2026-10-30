'use client'

import { useActionState } from 'react'
import { btn, input, label } from '@/components/ui'
import { login } from '@/lib/admin/actions'

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, {})

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className={label}>Email</span>
        <input name="email" type="email" autoComplete="email" required className={input} />
      </label>
      <label className="block">
        <span className={label}>Пароль</span>
        <input name="password" type="password" autoComplete="current-password" required className={input} />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-signal">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${btn.dark} w-full`}>
        {pending ? 'Входим…' : 'Войти'}
      </button>
    </form>
  )
}

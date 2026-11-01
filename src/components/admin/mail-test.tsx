'use client'

import { useState, useTransition } from 'react'
import { sendTestEmail } from '@/lib/admin/actions'
import { btn } from '../ui'

/** Состояние почты и кнопка тестового письма */
export function MailTest({ user, configured }: { user: string; configured: boolean }) {
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const test = () =>
    start(async () => {
      const error = await sendTestEmail()
      setMessage(error ? { ok: false, text: `Не отправилось: ${error}` } : { ok: true, text: `Письмо отправлено на ${user} — проверьте почту` })
    })

  return (
    <div className="space-y-5 text-[15px]">
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[160px_1fr]">
        <dt className="text-mute">Отправитель</dt>
        <dd>{configured ? <span className="font-medium">{user}</span> : <span className="text-signal">не подключён — нет GMAIL_USER и GMAIL_APP_PASSWORD</span>}</dd>
      </dl>

      <ol className="list-decimal space-y-1.5 pl-5 text-ink-2">
        <li>В аккаунте Google включите двухэтапную аутентификацию (Аккаунт Google → Безопасность).</li>
        <li>
          Откройте{' '}
          <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-brand hover:underline">
            myaccount.google.com/apppasswords
          </a>
          , создайте пароль приложения (название любое, например «Сайт») и скопируйте 16 букв.
        </li>
        <li>
          На Vercel добавьте <code className="font-mono text-ink">GMAIL_USER</code> (адрес Gmail) и{' '}
          <code className="font-mono text-ink">GMAIL_APP_PASSWORD</code> (эти 16 букв), затем Redeploy.
        </li>
        <li>Нажмите «Отправить тестовое письмо» — пример письма о заказе придёт на этот же Gmail.</li>
      </ol>

      <button type="button" onClick={test} disabled={pending || !configured} className={btn.smallPrimary}>
        {pending ? 'Отправляем…' : 'Отправить тестовое письмо'}
      </button>

      {message && (
        <p role="status" className={`text-sm ${message.ok ? 'text-brand' : 'text-signal'}`}>
          {message.ok ? '✓ ' : ''}
          {message.text}
        </p>
      )}
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { findTelegramChats, sendTelegramTest } from '@/lib/admin/actions'
import type { TelegramChat } from '@/lib/telegram'
import { btn } from '../ui'

/** Настройка бота: найти chat id получателя и отправить тестовое сообщение */
export function TelegramBot({ username, hasToken, chatIds }: { username: string | null; hasToken: boolean; chatIds: string[] }) {
  const [finding, startFind] = useTransition()
  const [testing, startTest] = useTransition()
  const [chats, setChats] = useState<TelegramChat[] | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const find = () =>
    startFind(async () => {
      setMessage(null)
      const res = await findTelegramChats()
      if (res.error) setMessage({ ok: false, text: res.error })
      setChats(res.chats ?? null)
    })

  const test = () =>
    startTest(async () => {
      const error = await sendTelegramTest()
      setMessage(error ? { ok: false, text: error } : { ok: true, text: 'Сообщение отправлено — проверьте Telegram' })
    })

  return (
    <div className="space-y-5 text-[15px]">
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[160px_1fr]">
        <dt className="text-mute">Бот</dt>
        <dd>
          {username ? (
            <a href={`https://t.me/${username}`} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">
              @{username}
            </a>
          ) : hasToken ? (
            <span className="text-signal">токен задан, но Telegram его не принимает — проверьте TELEGRAM_BOT_TOKEN</span>
          ) : (
            <span className="text-signal">не подключён — нет TELEGRAM_BOT_TOKEN</span>
          )}
        </dd>
        <dt className="text-mute">Кому приходит</dt>
        <dd>
          {chatIds.length ? (
            <span className="font-mono">{chatIds.join(', ')}</span>
          ) : (
            <span className="text-signal">никому — не задан TELEGRAM_CHAT_ID</span>
          )}
        </dd>
      </dl>

      <ol className="list-decimal space-y-1.5 pl-5 text-ink-2">
        <li>
          Получатель открывает бота{username ? ` @${username}` : ''} в Telegram и нажимает «Start». Можно и добавить бота в
          группу — тогда заявки увидят все её участники.
        </li>
        <li>Нажмите «Найти чаты» и скопируйте ID нужного чата.</li>
        <li>
          Вставьте ID в переменную <code className="font-mono text-ink">TELEGRAM_CHAT_ID</code> (Vercel → Settings →
          Environment Variables; несколько получателей — через запятую) и сделайте Redeploy.
        </li>
        <li>Нажмите «Отправить тест» — в чат придёт сообщение от бота.</li>
      </ol>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={find} disabled={finding || !username} className={btn.small}>
          {finding ? 'Ищем…' : 'Найти чаты'}
        </button>
        <button type="button" onClick={test} disabled={testing || !username || !chatIds.length} className={btn.smallPrimary}>
          {testing ? 'Отправляем…' : 'Отправить тест'}
        </button>
      </div>

      {chats &&
        (chats.length ? (
          <ul className="divide-y divide-line rounded-md border border-line">
            {chats.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
                <span className="font-medium">{c.name}</span>
                {c.username && <span className="text-mute">@{c.username}</span>}
                <span className="text-sm text-mute">{c.type === 'private' ? 'личный чат' : 'группа'}</span>
                <code className="ml-auto rounded bg-sand px-2 py-0.5 font-mono text-sm select-all">{c.id}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-mute">
            Пока никто не писал боту. Пусть получатель откроет бота и нажмёт «Start», затем нажмите «Найти чаты» ещё раз.
          </p>
        ))}

      {message && (
        <p role="status" className={`text-sm ${message.ok ? 'text-brand' : 'text-signal'}`}>
          {message.ok ? '✓ ' : ''}
          {message.text}
        </p>
      )}
    </div>
  )
}

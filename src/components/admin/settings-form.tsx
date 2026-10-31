'use client'

import { startTransition, useActionState } from 'react'
import { saveSettings } from '@/lib/admin/actions'
import type { Settings } from '@/lib/types'
import { btn, input, label, textarea } from '../ui'
import { FormMessage } from './controls'

// Поля настроек, у которых есть английская и румынская версии
const TRANSLATED = [
  { key: 'tagline', label: 'Слоган', long: false },
  { key: 'working_hours', label: 'Часы работы', long: false },
  { key: 'address', label: 'Адрес', long: false },
  { key: 'delivery_info', label: 'О доставке', long: true },
  { key: 'payment_info', label: 'Способы оплаты', long: true },
] as const

export function SettingsForm({ settings: s }: { settings: Settings }) {
  const [state, action, pending] = useActionState(saveSettings, {})

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
      className="max-w-3xl space-y-6"
    >
      <Group title="Магазин" note="Название показывается в шапке, подвале и заголовках страниц.">
        <F label="Название">
          <input name="store_name" required defaultValue={s.store_name} className={input} />
        </F>
        <F label="Слоган" wide>
          <input name="tagline" defaultValue={s.tagline ?? ''} className={input} />
        </F>
      </Group>

      <Group title="Контакты">
        <F label="Телефон">
          <input name="phone" defaultValue={s.phone ?? ''} placeholder="+373 …" className={input} />
        </F>
        <F label="Email">
          <input name="email" type="email" defaultValue={s.email ?? ''} className={input} />
        </F>
        <F label="Telegram (ссылка)">
          <input name="telegram" defaultValue={s.telegram ?? ''} placeholder="https://t.me/…" className={input} />
        </F>
        <F label="Часы работы">
          <input name="working_hours" defaultValue={s.working_hours ?? ''} className={input} />
        </F>
        <F label="Адрес / пункт самовывоза" wide>
          <input name="address" defaultValue={s.address ?? ''} className={input} />
        </F>
      </Group>

      <Group title="Доставка и оплата" note="Стоимость доставки считается автоматически в корзине и при оформлении заказа.">
        <F label="Стоимость доставки, €">
          <input name="delivery_cost" inputMode="decimal" defaultValue={s.delivery_cost} className={input} />
        </F>
        <F label="Бесплатная доставка от, €">
          <input name="free_delivery_from" inputMode="decimal" defaultValue={s.free_delivery_from} className={input} />
        </F>
        <F label="Дополнительно о доставке" wide>
          <textarea name="delivery_info" rows={3} defaultValue={s.delivery_info ?? ''} className={textarea} />
        </F>
        <F label="Способы оплаты (свой текст вместо стандартного списка)" wide>
          <textarea name="payment_info" rows={3} defaultValue={s.payment_info ?? ''} className={textarea} />
        </F>
      </Group>

      <Group
        title="Переводы: English и Română"
        note="Тексты выше — на русском. Здесь — для английской и румынской версий сайта. Пустое поле заменится русским текстом."
      >
        {TRANSLATED.map((f) => (
          <div key={f.key} className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
            {(['en', 'ro'] as const).map((l) => (
              <F key={l} label={`${f.label} · ${l === 'en' ? 'English' : 'Română'}`}>
                {f.long ? (
                  <textarea name={`tr_${l}_${f.key}`} rows={2} defaultValue={s.translations?.[l]?.[f.key] ?? ''} className={textarea} />
                ) : (
                  <input name={`tr_${l}_${f.key}`} defaultValue={s.translations?.[l]?.[f.key] ?? ''} className={input} />
                )}
              </F>
            ))}
          </div>
        ))}
      </Group>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
        <button type="submit" disabled={pending} className={btn.smallPrimary}>
          {pending ? 'Сохраняем…' : 'Сохранить настройки'}
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  )
}

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface">
      <div className="border-b border-line px-5 py-3">
        <h2 className="font-semibold">{title}</h2>
        {note && <p className="mt-0.5 text-sm text-mute">{note}</p>}
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function F({ label: text, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className={label}>{text}</span>
      {children}
    </label>
  )
}

'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { IconCheck, IconDown } from './icons'

type Option<T extends string> = { id: T; label: string }

/**
 * Выпадающий список в стиле сайта вместо системного <select>.
 * Клавиатура: ↑/↓ — выбор, Enter/пробел — подтвердить, Esc — закрыть, Home/End — к краям.
 */
export function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  label,
  renderValue,
  renderOption,
  buttonClassName,
  menuClassName = 'w-64',
  plain = false,
  align = 'right',
  hideSelected = false,
}: {
  value: T
  options: readonly Option<T>[]
  onChange: (value: T) => void
  /** Подпись перед значением, например «Сортировка» */
  label?: string
  /** Своё содержимое кнопки (по умолчанию — подпись и название выбранного пункта) */
  renderValue?: (option: Option<T>) => ReactNode
  /** Своё содержимое пункта списка (по умолчанию — название) */
  renderOption?: (option: Option<T>) => ReactNode
  buttonClassName?: string
  menuClassName?: string
  /** Кнопка без рамки — подсветка только при наведении */
  plain?: boolean
  /** С какой стороны кнопки раскрывается список */
  align?: 'left' | 'right'
  /** Не показывать в списке выбранный пункт — он и так виден на кнопке */
  hideSelected?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const id = useId()

  const current = options.find((o) => o.id === value) ?? options[0]
  const items = hideSelected ? options.filter((o) => o.id !== value) : options

  // Клик мимо списка закрывает его
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // Фокус переходит в список, чтобы работали стрелки
  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  const openMenu = () => {
    setActive(Math.max(0, items.findIndex((o) => o.id === value)))
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  const choose = (option: Option<T>) => {
    close()
    if (option.id !== value) onChange(option.id)
  }

  const onButtonKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      openMenu()
    }
  }

  const onListKey = (e: KeyboardEvent) => {
    const last = items.length - 1
    const moves: Record<string, () => number> = {
      ArrowDown: () => Math.min(last, active + 1),
      ArrowUp: () => Math.max(0, active - 1),
      Home: () => 0,
      End: () => last,
    }
    if (moves[e.key]) {
      e.preventDefault()
      setActive(moves[e.key]())
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(items[active])
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault()
      close()
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={renderValue ? label : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onButtonKey}
        className={`flex items-center gap-2 rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          buttonClassName ?? 'h-10 pr-3 pl-4'
        } ${
          plain
            ? open
              ? 'bg-sand'
              : 'hover:bg-sand'
            : `border bg-surface ${open ? 'border-brand ring-4 ring-brand/10' : 'border-line-strong hover:border-brand'}`
        }`}
      >
        {renderValue ? (
          renderValue(current)
        ) : (
          <>
            {label && <span className="hidden text-mute sm:inline">{label}:</span>}
            <span className="font-semibold text-ink">{current.label}</span>
          </>
        )}
        <IconDown size={16} className={`text-mute transition-transform duration-200 ${open ? 'rotate-180 text-brand' : ''}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onListKey}
          className={`absolute top-full z-50 mt-2 rounded-2xl bg-surface p-1.5 shadow-[0_18px_44px_-14px_rgba(15,26,68,0.28)] ring-1 ring-line outline-none transition duration-150 ease-out starting:-translate-y-1 starting:scale-95 starting:opacity-0 ${
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          } ${menuClassName}`}
        >
          {items.map((o, i) => {
            const selected = o.id === value
            return (
              <li
                key={o.id}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(o)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
                  i === active ? 'bg-brand-soft' : ''
                } ${selected ? 'font-semibold text-brand' : 'text-ink-2'}`}
              >
                {renderOption ? (
                  renderOption(o)
                ) : (
                  <>
                    {o.label}
                    {selected && <IconCheck size={17} className="shrink-0" />}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

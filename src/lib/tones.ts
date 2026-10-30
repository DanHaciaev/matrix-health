// Пастельные оттенки категорий. Цвет берётся по порядку категории (поле sort),
// поэтому новая категория из админки сама получит свой цвет.
// Классы записаны целиком, чтобы Tailwind их нашёл.
export const TONES = [
  { bg: 'bg-sky', label: 'bg-sky-ink', text: 'text-sky-ink' },
  { bg: 'bg-lilac', label: 'bg-lilac-ink', text: 'text-lilac-ink' },
  { bg: 'bg-peach', label: 'bg-peach-ink', text: 'text-peach-ink' },
  { bg: 'bg-mint', label: 'bg-mint-ink', text: 'text-mint-ink' },
] as const

export type Tone = (typeof TONES)[number]

export function tone(sort: number | null | undefined): Tone {
  return TONES[Math.abs(sort ?? 3) % TONES.length]
}

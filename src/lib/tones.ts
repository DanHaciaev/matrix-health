// Пастельные оттенки категорий из палитры логотипа. Цвет берётся по порядку категории (поле sort),
// поэтому новая категория из админки сама получит свой цвет.
// Классы записаны целиком, чтобы Tailwind их нашёл.
export const TONES = [
  { bg: 'bg-cream', label: 'bg-cream-ink', text: 'text-cream-ink' },
  { bg: 'bg-periwinkle', label: 'bg-periwinkle-ink', text: 'text-periwinkle-ink' },
  { bg: 'bg-meadow', label: 'bg-meadow-ink', text: 'text-meadow-ink' },
  { bg: 'bg-mist', label: 'bg-mist-ink', text: 'text-mist-ink' },
] as const

export type Tone = (typeof TONES)[number]

export function tone(sort: number | null | undefined): Tone {
  return TONES[Math.abs(sort ?? 3) % TONES.length]
}

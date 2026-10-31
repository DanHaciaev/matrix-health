import type { Lang } from '../config'
import en, { type Dictionary } from './en'
import ro from './ro'
import ru from './ru'

export const DICTIONARIES: Record<Lang, Dictionary> = { en, ro, ru }
export type { Dictionary }

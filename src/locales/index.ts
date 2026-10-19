import { de } from './de.js'
import { en } from './en.js'
import { fr } from './fr.js'
import { it } from './it.js'

export { de, en, fr, it }

export const locales = { en, fr, de, it } as const

export type LocaleCode = keyof typeof locales

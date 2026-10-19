import { de } from './de.js'
import { enGB } from './en-gb.js'
import { en } from './en.js'
import { fr } from './fr.js'
import { it } from './it.js'

export { de, en, enGB, fr, it }

export const locales = { en, 'en-GB': enGB, fr, de, it } as const

export type LocaleCode = keyof typeof locales

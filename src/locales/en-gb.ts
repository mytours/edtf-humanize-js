import type { Locale } from '../locale.js'
import { en } from './en.js'

/** British English: day-first dates ('1 July 1975'), otherwise as en */
export const enGB: Locale = {
  ...en,
  code: 'en-GB',
  formats: {
    ...en.formats,
    day: '%-d %B %Y',
    dayMonth: '%-d %B',
  },
}

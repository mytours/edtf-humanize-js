import { describe, expect, it } from 'vitest'

import { humanize, type LocaleCode } from '../src/index.js'

// Ported from spec/edtf/humanize_edtf_2019_spec.rb (mytours/edtf-humanize#1)
const examples: Record<string, [locale: LocaleCode, edtf: string, expected: string][]> = {
  'prefix qualifiers': [
    ['en', '2004-06-~11', 'circa June 11, 2004'],
    ['en', '?2004-06-11', 'June 11, 2004?'],
    ['en', '2004-06-%11', 'circa June 11, 2004?'],
    ['en', '1984%', 'circa 1984?'],
  ],
  'open and unknown interval ends': [
    ['en', '1985/..', 'since 1985'],
    ['en', '../1985-04', 'until April 1985'],
    ['en', '1985/', '1985 to unknown date'],
    ['en', '/1985', 'unknown date to 1985'],
  ],
  'hemisphere seasons': [
    ['en', '2001-25', 'spring 2001 (Northern Hemisphere)'],
    ['en', '2001-31~', 'circa autumn 2001 (Southern Hemisphere)'],
    ['en', '2001-21^southern', 'spring 2001 (Southern Hemisphere)'],
    ['en', '2001-24^northern', 'winter 2001 (Northern Hemisphere)'],
    ['fr', '2001-29', 'printemps 2001 (hémisphère sud)'],
    ['de', '2001-29', 'Frühling 2001 (Südhalbkugel)'],
    ['it', '2001-29', 'primavera 2001 (emisfero australe)'],
  ],
  'quarters, quadrimesters and semestrals': [
    ['en', '2001-33', 'first quarter of 2001'],
    ['en', '2001-36?', 'fourth quarter of 2001?'],
    ['en', '2001-37', 'first third of 2001'],
    ['en', '2001-38', 'second third of 2001'],
    ['en', '2001-40', 'first half of 2001'],
    ['en', '2001-41~', 'circa second half of 2001'],
    ['fr', '2001-34', 'deuxième trimestre 2001'],
    ['fr', '2001-40', 'premier semestre 2001'],
    ['de', '2001-34', '2. Quartal 2001'],
    ['de', '2001-40', '1. Halbjahr 2001'],
    ['it', '2001-34', 'secondo trimestre 2001'],
    ['it', '2001-40', 'primo semestre 2001'],
  ],
  'significant digits': [
    ['en', '1950S2', '1950 (estimated, between 1900 and 1999)'],
    ['en', 'Y171010000S3', '171010000 (estimated, between 171000000 and 171999999)'],
    ['en', '-1859S2', '-1859 (estimated, between -1899 and -1800)'],
    ['en', '1859S4', '1859'],
    ['fr', '1950S2', '1950 (estimé, entre 1900 et 1999)'],
    ['de', '1950S2', '1950 (geschätzt, zwischen 1900 und 1999)'],
    ['it', '1950S2', '1950 (stimato, tra il 1900 e il 1999)'],
  ],
  'exponential years': [['en', 'Y17E7', '170000000']],
  'unspecified digits in any position': [
    ['en', '1XXX', '1000 to 1999 (year unknown)'],
    ['en', '1XXX-12', 'December, 1000 to 1999 (year unknown)'],
    ['en', '1X99', '1X99 (year unknown)'],
    ['en', '1X99-07-04', 'July 4, 1X99 (year unknown)'],
    ['en', 'XXXX-12-25', 'December 25 (year unknown)'],
    ['en', 'XXXX-12', 'December (year unknown)'],
    ['en', 'XXXX-12-XX', 'December (exact date unknown)'],
    ['en', 'XXXX-XX', 'unknown'],
    ['en', '1984-1X', '1984 (month unknown)'],
    ['en', '1984-12-1X', 'December 1984 (day unknown)'],
    ['fr', '1XXX', '1000 à 1999 (année inconnue)'],
    ['fr', 'XXXX-12-25', '25 Décembre (année inconnue)'],
    ['de', 'XXXX-12-25', '25. Dezember (Jahr unbekannt)'],
    ['it', 'XXXX-12-25', '25 dicembre (anno sconosciuto)'],
  ],
  sets: [['en', '[1667,1668-?12,1670..1672]', '1667, December 1668?, 1670, 1671 or 1672']],
}

describe('humanize EDTF 2019', () => {
  for (const [feature, cases] of Object.entries(examples)) {
    describe(feature, () => {
      it.each(cases)('[%s] %s => %s', (locale, edtf, expected) => {
        expect(humanize(edtf, { locale })).toBe(expected)
      })
    })
  }
})

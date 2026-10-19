import { describe, expect, it } from 'vitest'

import { humanize } from '../src/index.js'

// Ported from the Ruby gem's spec/edtf/humanize_en_spec.rb
const examples: Record<string, [edtf: string, expected: string][]> = {
  decades: [
    ['199x', '1990s'],
    ['199', '1990s'],
    ['-001x', '10s BCE'],
  ],
  centuries: [
    ['19xx', '20th century'],
    ['00xx', '1st century'],
    ['10xx', '11th century'],
    ['20xx', '21st century'],
    ['-01xx', '2nd century BCE'],
    ['19', '20th century'],
  ],
  intervals: [
    ['1970/1980', '1970 to 1980'],
    ['198X/199X', '1980s (year unknown) to 1990s (year unknown)'],
    ['19XX/20XX', '20th century (year unknown) to 21st century (year unknown)'],
    ['1985/199X', '1985 to 1990s (year unknown)'],
    ['1970~/1980~', 'circa 1970 to circa 1980'],
  ],
  'open and unknown intervals': [
    ['1970/open', 'since 1970'],
    ['unknown/1970', 'unknown date to 1970'],
    ['1970/unknown', '1970 to unknown date'],
  ],
  'ISO dates': [
    ['1975-07-01', 'July 1, 1975'],
    ['1975?', '1975?'],
  ],
  'unspecified years': [
    ['197X', '1970s (year unknown)'],
    ['19XX', '20th century (year unknown)'],
    ['197u', '1970s (year unknown)'],
    ['00XX', '1st century (year unknown)'],
    ['01XX', '2nd century (year unknown)'],
    ['-01XX', '2nd century BCE (year unknown)'],
    ['-001X', '10s BCE (year unknown)'],
    ['198X-05', 'May, 1980s (year unknown)'],
    ['198X-05-03', 'May 3, 1980s (year unknown)'],
    ['00XX-05', 'May, 1st century (year unknown)'],
    ['[198X,1990]', '1980s (year unknown) or 1990'],
  ],
  'unspecified months and days': [
    ['1990-XX', '1990 (month unknown)'],
    ['1990-05-XX', 'May 1990 (day unknown)'],
    ['1990-XX-XX', '1990 (exact date unknown)'],
    // Known limitation: the known day is dropped, as the day formats need a month
    ['1990-XX-15', '1990 (month unknown)'],
    ['198X-05-XX', 'May, 1980s (exact date unknown)'],
    ['198X-XX-XX', '1980s (exact date unknown)'],
    ['[1990-XX,1991]', '1990 (month unknown) or 1991'],
    ['1990-XX/1991', '1990 (month unknown) to 1991'],
  ],
  seasons: [
    ['1975-22', 'summer 1975'],
    ['1975-22~', 'circa summer 1975'],
    ['1975-22?~', 'circa summer 1975?'],
  ],
  sets: [
    ['[1980, 1981, 1983]', '1980, 1981 or 1983'],
    ['{1980, 1981, 1983}', '1980, 1981 and 1983'],
    ['[1980, 1981]', '1980 or 1981'],
    ['[..1980]', 'on or before 1980'],
    ['[1980..]', 'on or after 1980'],
    ['{..1980}', 'on and before 1980'],
    ['{1980..}', 'on and after 1980'],
  ],
  'unknown values': [['XXXX', 'unknown']],
}

describe('humanize in English', () => {
  for (const [feature, cases] of Object.entries(examples)) {
    describe(feature, () => {
      it.each(cases)('%s => %s', (edtf, expected) => {
        expect(humanize(edtf)).toBe(expected)
        expect(humanize(edtf, { locale: 'en' })).toBe(expected)
      })
    })
  }
})

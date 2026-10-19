import { describe, expect, it } from 'vitest'
import { enGB, humanize, locales } from '../src/index.js'

const gb = (edtf: string) => humanize(edtf, { locale: 'en-GB' })

describe('en-GB', () => {
  it.each([
    ['1975-07-01', '1 July 1975'],
    ['1975-07', 'July 1975'],
    ['2004-06-~11', 'circa 11 June 2004'],
    ['XXXX-12-25', '25 December (year unknown)'],
    ['1970-07-01/1980-08-03', '1 July 1970 to 3 August 1980'],
    ['[..1980-05-04]', 'on or before 4 May 1980'],
    ['1990~', 'circa 1990'],
    ['198X', '1980s (year unknown)'],
  ])('%s => %s', (edtf, expected) => {
    expect(gb(edtf)).toBe(expected)
  })

  it('is exported and listed with the other locales', () => {
    expect(locales['en-GB']).toBe(enGB)
    expect(enGB.code).toBe('en-GB')
  })
})

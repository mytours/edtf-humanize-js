import edtf from 'edtf'
import { describe, expect, it } from 'vitest'

import {
  en,
  humanize,
  InvalidEdtfError,
  normalizeLegacySyntax,
  type EdtfValue,
  type Locale,
} from '../src/index.js'
import { toRoman } from '../src/roman.js'

describe('humanize', () => {
  it('accepts values parsed by edtf.js', () => {
    expect(humanize(edtf('1975-07-01') as EdtfValue)).toBe('July 1, 1975')
    expect(humanize(edtf('1970/1980') as EdtfValue, { locale: 'fr' })).toBe('De 1970 à 1980')
  })

  it('ignores surrounding whitespace', () => {
    expect(humanize(' 1975 ')).toBe('1975')
  })

  it('throws InvalidEdtfError for invalid EDTF', () => {
    expect(() => humanize('not a date')).toThrow(InvalidEdtfError)
    expect(() => humanize('1975-13')).toThrow('Invalid EDTF: "1975-13"')
  })

  it('keeps the parser error as the cause', () => {
    try {
      humanize('nope')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidEdtfError)
      expect((error as InvalidEdtfError).input).toBe('nope')
      expect((error as InvalidEdtfError).cause).toBeInstanceOf(Error)
    }
  })

  it('rejects unknown locale codes', () => {
    // @ts-expect-error: 'es' is not a built-in locale
    expect(() => humanize('1975', { locale: 'es' })).toThrow(RangeError)
    // @ts-expect-error: not an own property
    expect(() => humanize('1975', { locale: 'toString' })).toThrow(RangeError)
  })

  it('accepts a custom locale', () => {
    const custom: Locale = {
      ...en,
      code: 'en-x-custom',
      terms: {
        ...en.terms,
        unknown: 'n.d.',
        approximatePrefix: { year: 'ca. ', month: 'ca. ', day: 'ca. ' },
      },
    }
    expect(humanize('XXXX', { locale: custom })).toBe('n.d.')
    expect(humanize('1950~', { locale: custom })).toBe('ca. 1950')
  })

  it('humanizes season intervals', () => {
    expect(humanize('2001-21/2001-23')).toBe('spring 2001 to autumn 2001')
  })

  it('humanizes negative and early dates', () => {
    expect(humanize('0099')).toBe('0099')
  })

  it('writes years before 1 as BCE, counting astronomically like ISO 8601', () => {
    // Year 0000 is 1 BCE, so -0044 is 45 BCE
    expect(humanize('0000')).toBe('1 BCE')
    expect(humanize('-0044-03-15')).toBe('March 15, 45 BCE')
    expect(humanize('-0500')).toBe('501 BCE')
    expect(humanize('-0500~')).toBe('circa 501 BCE')
    expect(humanize('Y-170000002')).toBe('170000003 BCE')
    expect(humanize('-0044-03-15', { locale: 'de' })).toBe('15. März 45 v. Chr.')
    expect(humanize('-0044/0010')).toBe('45 BCE to 0010')
  })

  it('humanizes month ranges in sets', () => {
    expect(humanize('[1990-05..1990-07]')).toBe('May 1990, June 1990 or July 1990')
  })

  it('summarises set ranges of more than three dates instead of listing them', () => {
    expect(humanize('[1950..1960]')).toBe('1950 to 1960')
    expect(humanize('[1667,1668,1670..1680]')).toBe('1667, 1668 or 1670 to 1680')
    expect(humanize('{1960,1970..1979}')).toBe('1960 and 1970 to 1979')
    expect(humanize('[1950..1960]', { locale: 'fr' })).toBe('1950 à 1960')
    expect(humanize('[1950-05..1960-06]', { locale: 'de' })).toBe('Mai 1950 - Juni 1960')
  })

  it('summarises day ranges in sets without listing every day', () => {
    const start = performance.now()
    expect(humanize('[1890-01-01..2020-12-25]')).toBe('January 1, 1890 to December 25, 2020')
    expect(performance.now() - start).toBeLessThan(100)
  })
})

describe('normalizeLegacySyntax', () => {
  it.each([
    ['199x', '199'],
    ['19xx', '19'],
    ['-01xx', '-01'],
    ['1970/open', '1970/..'],
    ['unknown/1970', '/1970'],
    ['197u', '197X'],
    ['1990-uu', '1990-XX'],
    ['1975-22?~', '1975-22%'],
    ['1975-22~?', '1975-22%'],
    ['2001-21^southern', '2001-29'],
    ['2001-22^northern', '2001-26'],
  ])('%s => %s', (legacy, modern) => {
    expect(normalizeLegacySyntax(legacy)).toBe(modern)
  })

  it.each(['1985/..', '2004-06-~11', '1950S2', 'Y17E7', '[1667,1668-?12,1670..1672]', '2001-29'])(
    'leaves EDTF 2019 %s unchanged',
    (modern) => {
      expect(normalizeLegacySyntax(modern)).toBe(modern)
    },
  )
})

describe('toRoman', () => {
  it.each([
    [1, 'I'],
    [4, 'IV'],
    [9, 'IX'],
    [14, 'XIV'],
    [20, 'XX'],
    [21, 'XXI'],
    [40, 'XL'],
    [90, 'XC'],
    [400, 'CD'],
    [1999, 'MCMXCIX'],
    [4000, 'MMMM'],
  ])('%i => %s', (number, roman) => {
    expect(toRoman(number)).toBe(roman)
  })
})

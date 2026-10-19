import { describe, expect, it } from 'vitest'
import { en, humanize } from '../src/index.js'

const parts = (edtf: string, locale: 'en' | 'fr' | 'de' | 'it' = 'en') =>
  humanize(edtf, { locale, qualifiers: 'parts' })

describe("qualifiers: 'parts'", () => {
  it('names the parts that are qualified when they differ', () => {
    expect(parts('1982-?03-~12')).toBe('March 12, 1982 (month uncertain, day approximate)')
    expect(parts('2004-06-~11')).toBe('June 11, 2004 (day approximate)')
    expect(parts('?2004-06-11')).toBe('June 11, 2004 (year uncertain)')
    expect(parts('2004-%06')).toBe('June 2004 (month approximate and uncertain)')
  })

  it('keeps the whole-date wording when every part shares a qualifier', () => {
    expect(parts('1984~')).toBe('circa 1984')
    expect(parts('1984-05-03%')).toBe('circa May 3, 1984?')
    expect(parts('~1982-~03-~12')).toBe('circa March 12, 1982')
  })

  it('applies to interval ends', () => {
    expect(parts('~1890/1905-05-?03')).toBe('circa 1890 to May 3, 1905 (day uncertain)')
  })

  it('has wording in every built-in locale', () => {
    expect(parts('1982-?03-~12', 'fr')).toBe('12 Mars 1982 (mois incertain, jour approximatif)')
    expect(parts('1982-?03-~12', 'de')).toBe('12. März 1982 (Monat unsicher, Tag ungefähr)')
    expect(parts('1982-?03-~12', 'it')).toBe('12 marzo 1982 (mese incerto, giorno approssimativo)')
  })

  it('falls back to whole-date wording for a custom locale without the terms', () => {
    const { qualifiedParts, ...terms } = en.terms
    expect(qualifiedParts).toBeDefined()
    expect(humanize('2004-06-~11', { locale: { ...en, terms }, qualifiers: 'parts' })).toBe(
      'circa June 11, 2004',
    )
  })

  it('is off by default, matching the Ruby gem', () => {
    expect(humanize('1982-?03-~12')).toBe('circa March 12, 1982?')
  })
})

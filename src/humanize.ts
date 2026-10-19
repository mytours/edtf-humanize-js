import * as edtf from 'edtf'

import { normalizeLegacySyntax } from './legacy.js'
import type { Locale, Precision, SeasonName, SetTerms } from './locale.js'
import { locales, type LocaleCode } from './locales/index.js'
import type {
  EdtfDate,
  EdtfInterval,
  EdtfIntervalEndpoint,
  EdtfSeason,
  EdtfSet,
  EdtfSetRangeEnd,
  EdtfValue,
  EdtfYear,
} from './types.js'

export interface HumanizeOptions {
  /** A built-in locale code or a Locale object; defaults to 'en' */
  readonly locale?: LocaleCode | Locale
}

/** Thrown when a string is not valid EDTF */
export class InvalidEdtfError extends Error {
  override readonly name = 'InvalidEdtfError'

  constructor(
    readonly input: string,
    options?: ErrorOptions,
  ) {
    super(`Invalid EDTF: ${JSON.stringify(input)}`, options)
  }
}

/**
 * Describes an EDTF date in words.
 *
 * @param input An EDTF string ('1975-07-01', '198X', '1970/1980~', ...) or a
 *   value already parsed by edtf.js
 * @throws {InvalidEdtfError} when input is a string that is not valid EDTF
 *
 * @example
 * humanize('1975-07-01') // 'July 1, 1975'
 * humanize('2001-33') // 'first quarter of 2001'
 * humanize('198X/199X', { locale: 'fr' }) // 'Des années 1980 (année inconnue) aux années 1990 (année inconnue)'
 */
export function humanize(input: string | EdtfValue, options: HumanizeOptions = {}): string {
  const value = typeof input === 'string' ? parse(input) : input
  return new Humanizer(resolveLocale(options.locale)).value(value)
}

function parse(input: string): EdtfValue {
  let parsed: edtf.ParseResult
  try {
    // Level 3 enables qualified seasons ('2001-21~') and season intervals
    parsed = edtf.parse(normalizeLegacySyntax(input), { level: 3 })
  } catch (error) {
    throw new InvalidEdtfError(input, { cause: error })
  }
  return new edtf[parsed.type](parsed) as EdtfValue
}

function resolveLocale(locale: LocaleCode | Locale = 'en'): Locale {
  if (typeof locale !== 'string') return locale

  // Guard against codes that slip past the type, e.g. from user settings
  if (!Object.hasOwn(locales, locale)) throw new RangeError(`Unknown locale: ${locale}`)
  return locales[locale]
}

// Bits of edtf.js qualification bitmasks: one per year digit, two each for
// the month and day digits
const YEAR = 0b1111
const MONTH = 0b11_0000
const DAY = 0b1100_0000

const PRECISIONS: readonly Precision[] = ['year', 'month', 'day']

// Set ranges with more dates than this are written 'from to' instead of listed
const LISTED_RANGE_LIMIT = 3

// EDTF 2019 season codes 21-41
const SEASONS: readonly SeasonName[] = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'spring',
  'summer',
  'autumn',
  'winter',
  'spring',
  'summer',
  'autumn',
  'winter',
  'quarter1',
  'quarter2',
  'quarter3',
  'quarter4',
  'quadrimester1',
  'quadrimester2',
  'quadrimester3',
  'semestral1',
  'semestral2',
]

/** A Date or Year reduced to what the humanizer needs */
interface DateParts {
  readonly year: number
  /** 1-12 */
  readonly month: number
  readonly day: number
  readonly precision: Precision
  readonly unspecified: number
  readonly uncertain: boolean
  readonly approximate: boolean
  readonly significant: number | undefined
}

/** How much of the year is unspecified */
type YearKind = 'decade' | 'century' | 'millennium' | 'all' | 'digits'

type UnknownPart = 'year' | 'month' | 'day'

function dateParts(date: EdtfDate | EdtfYear): DateParts {
  if (date.type === 'Year') {
    const significant = date.significant
    return {
      year: date.year,
      month: 1,
      day: 1,
      precision: 'year',
      unspecified: 0,
      uncertain: false,
      approximate: false,
      significant:
        significant !== undefined && Number.isFinite(significant) ? significant : undefined,
    }
  }

  const [year = 0, month = 0, day = 1] = date.values
  return {
    year,
    month: month + 1,
    day,
    precision: PRECISIONS[date.precision - 1] ?? 'year',
    unspecified: date.unspecified.value,
    uncertain: date.uncertain.value !== 0,
    approximate: date.approximate.value !== 0,
    significant: undefined,
  }
}

/** -100 => '-0100', 1950 => '1950', 170000000 => '170000000' (strftime %Y) */
function formatYear(year: number): string {
  return `${year < 0 ? '-' : ''}${String(Math.abs(year)).padStart(4, '0')}`
}

function fill(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)
}

/** '1980, 1981 or 1983' */
function toSentence(items: readonly string[], terms: SetTerms): string {
  if (items.length < 3) return items.join(terms.twoDatesConnector)

  return `${items.slice(0, -1).join(terms.datesConnector)}${terms.lastDateConnector}${String(items.at(-1))}`
}

type SetEntry = EdtfSet['values'][number]

function isRange(entry: SetEntry): entry is readonly [EdtfSetRangeEnd, EdtfSetRangeEnd] {
  return Array.isArray(entry)
}

function isEndpoint(value: EdtfInterval['lower']): value is EdtfIntervalEndpoint {
  return typeof value === 'object' && value !== null
}

class Humanizer {
  constructor(private readonly locale: Locale) {}

  private get terms(): Locale['terms'] {
    return this.locale.terms
  }

  value(value: EdtfValue): string {
    switch (value.type) {
      case 'Date':
      case 'Year':
        return this.date(dateParts(value))
      case 'Decade':
        return this.decade(value.year)
      case 'Century':
        return this.locale.century(value.year)
      case 'Season':
        return this.season(value)
      case 'Interval':
        return this.interval(value)
      case 'Set':
      case 'List':
        return this.set(value)
    }
  }

  // '199' => 1990s, '-001' => 10s BCE
  private decade(year: number): string {
    const { decadePrefix, decadeSuffix, bcSuffix } = this.terms
    return `${decadePrefix}${String(Math.abs(year))}${decadeSuffix}${year < 0 ? bcSuffix : ''}`
  }

  // '1999-21~' => circa spring 1999; '2001-29' => spring 2001 (Southern Hemisphere)
  private season(season: EdtfSeason): string {
    const { terms } = this
    const uncertain = season.uncertain.value !== 0
    const approximate = season.approximate.value !== 0
    const name = SEASONS[season.season - 21]

    return [
      uncertain ? terms.uncertainPrefix : '',
      approximate ? terms.approximatePrefix.year : '',
      name === undefined ? String(season.season) : this.locale.seasons[name],
      ` ${String(season.year)}`,
      approximate ? terms.approximateSuffix.year : '',
      uncertain ? terms.uncertainSuffix : '',
      this.hemisphere(season.season),
    ].join('')
  }

  private hemisphere(code: number): string {
    if (code >= 25 && code <= 28) return this.terms.seasonHemisphere.northern
    if (code >= 29 && code <= 32) return this.terms.seasonHemisphere.southern
    return ''
  }

  // '1990~' => circa 1990
  private date(date: DateParts): string {
    const { terms } = this
    return [
      date.approximate ? terms.approximatePrefix[date.precision] : '',
      date.uncertain ? terms.uncertainPrefix : '',
      this.unspecified(date),
      date.uncertain ? terms.uncertainSuffix : '',
      date.approximate ? terms.approximateSuffix[date.precision] : '',
    ].join('')
  }

  // '198X'       => 1980s (year unknown)
  // '198X-05'    => May, 1980s (year unknown)
  // '1990-XX'    => 1990 (month unknown)
  // '198X-05-XX' => May, 1980s (exact date unknown)
  // 'XXXX-XX'    => unknown
  private unspecified(date: DateParts): string {
    const display = this.withUnspecifiedYear(date)
    if (yearKind(date) === 'all' && knownPrecision(date) === 'year') return display

    return this.annotateUnknownParts(display, unknownParts(date))
  }

  private withUnspecifiedYear(date: DateParts): string {
    const display = this.format(this.precisionFormat(knownPrecision(date)), date)

    switch (yearKind(date)) {
      case undefined:
        return this.withSignificantDigits(date, display)
      case 'decade':
      case 'century':
      case 'millennium':
        return this.withYearSpan(date, display, this.yearSpan(date))
      case 'all':
        return this.withoutYear(date)
      case 'digits':
        return replaceYear(display, date.year, maskedYear(date))
    }
  }

  private withYearSpan(date: DateParts, display: string, span: string): string {
    switch (knownPrecision(date)) {
      case 'year':
        return span
      case 'month':
        return fill(this.terms.unspecifiedYearWithMonth, { month: this.monthName(date), span })
      case 'day':
        return replaceYear(display, date.year, span)
    }
  }

  // A year with unspecified trailing digits is one unknown year within a
  // decade, century or millennium, not the whole span
  private yearSpan(date: DateParts): string {
    switch (yearKind(date)) {
      case 'decade':
        return this.decade(date.year)
      case 'century':
        return this.locale.century(date.year)
      default:
        return fill(this.terms.unspecifiedYearRange, this.yearRange(date.year, 1000))
    }
  }

  // 'XXXX-12-25' => December 25
  private withoutYear(date: DateParts): string {
    switch (knownPrecision(date)) {
      case 'day':
        return this.format(this.locale.formats.dayMonth, date)
      case 'month':
        return this.monthName(date)
      case 'year':
        return this.terms.unknown
    }
  }

  // '1950S2' => 1950 (estimated, between 1900 and 1999)
  private withSignificantDigits(date: DateParts, display: string): string {
    if (date.significant === undefined) return display

    const insignificant = String(Math.abs(date.year)).length - date.significant
    if (insignificant <= 0) return display

    return fill(this.terms.significantDigits, {
      year: display,
      ...this.yearRange(date.year, 10 ** insignificant),
    })
  }

  /** The first and last years of the span of size years containing year: (1950, 100) => 1900, 1999 */
  private yearRange(year: number, size: number): { from: string; to: string } {
    const first = Math.abs(year) - (Math.abs(year) % size)
    const [from, to] = [first, first + size - 1]
      .map((y) => (year < 0 ? -y : y))
      .sort((a, b) => a - b)
      .map((y) => this.format(this.locale.formats.year, { year: y, month: 1, day: 1 }))
    return { from: from ?? '', to: to ?? '' }
  }

  // [month] => (month unknown), [month, day] => (exact date unknown)
  private annotateUnknownParts(display: string, parts: readonly UnknownPart[]): string {
    const [part, ...rest] = parts
    if (part === undefined) return display

    const note =
      rest.length === 0 ? this.terms.unknownParts[part] : this.terms.unknownParts.exactDate
    return `${display} ${note}`
  }

  private interval(interval: EdtfInterval): string {
    const { lower, upper } = interval
    const { terms } = this

    if (lower === Infinity || upper === Infinity) {
      // '../1980' => until 1980, '1980/..' => since 1980
      if (isEndpoint(upper)) return this.openEnded(terms.openStartInterval, upper)
      if (isEndpoint(lower)) return this.openEnded(terms.openEndInterval, lower)
      return terms.unknown
    }

    // '/1980' => unknown date to 1980, '1980/' => 1980 to unknown date
    if (!isEndpoint(lower))
      return isEndpoint(upper) ? this.openEnded(terms.unknownStartInterval, upper) : terms.unknown
    if (!isEndpoint(upper)) return this.openEnded(terms.unknownEndInterval, lower)

    const span = this.spanInterval(lower, upper)
    if (span !== undefined) return span

    return `${this.intervalPrefix(lower)}${this.endpoint(lower)}${this.intervalConnector(upper)}${this.endpoint(upper)}`
  }

  private openEnded(
    templates: Locale['terms']['openEndInterval'],
    endpoint: EdtfIntervalEndpoint,
  ): string {
    return fill(templates[endpointPrecision(endpoint)], { date: this.endpoint(endpoint) })
  }

  private endpoint(endpoint: EdtfIntervalEndpoint): string {
    return endpoint.type === 'Season' ? this.season(endpoint) : this.date(dateParts(endpoint))
  }

  private intervalPrefix(lower: EdtfIntervalEndpoint): string {
    return this.terms.intervalPrefix[endpointPrecision(lower)]
  }

  private intervalConnector(upper: EdtfIntervalEndpoint): string {
    const approximate = upper.type !== 'Year' && upper.approximate.value !== 0
    if (approximate) return this.terms.intervalConnectorApproximate

    return this.terms.intervalConnector[endpointPrecision(upper)]
  }

  // Decade and century endpoints in languages that contract the article
  // with the preposition: '198X/199X' => Des années 1980 aux années 1990
  private spanInterval(
    lower: EdtfIntervalEndpoint,
    upper: EdtfIntervalEndpoint,
  ): string | undefined {
    const words = this.locale.spanInterval
    if (words === undefined || lower.type !== 'Date' || upper.type !== 'Date') return undefined

    const from = dateParts(lower)
    const to = dateParts(upper)
    const fromSpan = this.spanPhrase(from, words.decadeFrom, words.centuryFrom)
    const toSpan = this.spanPhrase(to, words.decadeTo, words.centuryTo)
    if (fromSpan === undefined && toSpan === undefined) return undefined

    const fromPhrase = fromSpan ?? `${this.intervalPrefix(lower)}${this.date(from)}`
    const toPhrase =
      toSpan === undefined ? `${this.intervalConnector(upper)}${this.date(to)}` : ` ${toSpan}`
    return `${fromPhrase}${toPhrase}`
  }

  // Des années 1980 (année inconnue), au XXIe siècle (année inconnue).
  // Only year-precision endpoints; '198X-05' keeps the ordinary wording.
  private spanPhrase(date: DateParts, decade: string, century: string): string | undefined {
    if (knownPrecision(date) !== 'year') return undefined

    let phrase: string
    switch (yearKind(date)) {
      case 'decade': {
        const years =
          date.year < 0 ? `${String(Math.abs(date.year))}${this.terms.bcSuffix}` : String(date.year)
        phrase = `${decade} ${years}`
        break
      }
      case 'century':
        phrase = `${century} ${this.locale.century(date.year)}`
        break
      default:
        return undefined
    }
    return this.annotateUnknownParts(phrase, unknownParts(date))
  }

  // '[1980,1981]' => 1980 or 1981, '{..1980}' => on and before 1980
  private set(set: EdtfSet): string {
    const terms = set.type === 'Set' ? this.terms.exclusiveSet : this.terms.inclusiveSet
    const entries = set.values.flatMap((entry) =>
      isRange(entry) ? this.setRange(...entry) : [this.value(entry)],
    )
    const last = entries.length - 1

    if (set.earlier && entries[0] !== undefined) entries[0] = `${terms.earlierPrefix}${entries[0]}`
    if (set.later && entries[last] !== undefined)
      entries[last] = `${terms.laterPrefix}${entries[last]}`

    return toSentence(entries, terms)
  }

  // '1670..1672' => 1670, 1671, 1672; '1670..1680' => 1670 to 1680.
  // Counts lazily, so a range of days over centuries isn't expanded.
  private setRange(from: EdtfSetRangeEnd, to: EdtfSetRangeEnd): string[] {
    const dates: EdtfDate[] = []
    for (const date of from.through(to)) {
      if (dates.length === LISTED_RANGE_LIMIT) {
        const connector = this.terms.intervalConnector[dateParts(to).precision]
        return [`${this.value(from)}${connector}${this.value(to)}`]
      }
      dates.push(date)
    }
    return dates.map((date) => this.value(date))
  }

  private precisionFormat(precision: Precision): string {
    return this.locale.formats[precision]
  }

  private monthName(date: Pick<DateParts, 'month'>): string {
    return this.locale.monthNames[date.month - 1] ?? String(date.month)
  }

  /** A small strftime: %B, %-d, %d, %-m, %m, %Y and %% */
  private format(pattern: string, date: Pick<DateParts, 'year' | 'month' | 'day'>): string {
    return pattern.replace(/%(-?)([BdmY%])/g, (match, unpadded: string, directive: string) => {
      const pad = (n: number): string => (unpadded ? String(n) : String(n).padStart(2, '0'))
      switch (directive) {
        case 'B':
          return this.monthName(date)
        case 'd':
          return pad(date.day)
        case 'm':
          return pad(date.month)
        case 'Y':
          return formatYear(date.year)
        case '%':
          return '%'
        default:
          return match
      }
    })
  }
}

function endpointPrecision(endpoint: EdtfIntervalEndpoint): Precision {
  return endpoint.type === 'Date' ? dateParts(endpoint).precision : 'year'
}

// '1990-XX' has month precision, but only the year is known
function knownPrecision(date: DateParts): Precision {
  if (date.unspecified & MONTH) return 'year'
  if (date.unspecified & DAY) return 'month'
  return date.precision
}

// '198X' => decade, '19XX' => century, '1XXX' => millennium,
// 'XXXX-12' => all, '1X99' => digits
function yearKind(date: DateParts): YearKind | undefined {
  switch (date.unspecified & YEAR) {
    case 0:
      return undefined
    case 0b1000:
      return 'decade'
    case 0b1100:
      return 'century'
    case 0b1110:
      return 'millennium'
    case 0b1111:
      return 'all'
    default:
      return 'digits'
  }
}

function unknownParts(date: DateParts): UnknownPart[] {
  const parts: UnknownPart[] = []
  if (date.unspecified & YEAR) parts.push('year')
  if (date.unspecified & MONTH) parts.push('month')
  if (date.unspecified & DAY) parts.push('day')
  return parts
}

// '1X99' => 1X99. Bit i of the mask is the i-th year digit from the left.
function maskedYear(date: DateParts): string {
  const digits = formatYear(date.year).split('')
  const offset = digits.length - 4
  for (let i = 0; i < 4; i++) {
    if (date.unspecified & (1 << i)) digits[offset + i] = 'X'
  }
  return digits.join('')
}

// Match the zero-padded year as formatted, so years 0-999 and negative
// years ('00XX', '-01XX') are found
function replaceYear(display: string, year: number, replacement: string): string {
  return display.replace(formatYear(year), () => replacement)
}

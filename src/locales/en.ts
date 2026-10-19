import type { Locale } from '../locale.js'
import { centuryNumber, same } from './shared.js'

const ordinalSuffixes: Readonly<Record<string, string>> = { one: 'st', two: 'nd', few: 'rd' }
const ordinalRules = new Intl.PluralRules('en', { type: 'ordinal' })

/** 1 => '1st', 11 => '11th', 21 => '21st' */
function ordinalize(number: number): string {
  return `${String(number)}${ordinalSuffixes[ordinalRules.select(number)] ?? 'th'}`
}

export const en: Locale = {
  code: 'en',
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  seasons: {
    spring: 'spring',
    summer: 'summer',
    autumn: 'autumn',
    winter: 'winter',
    quarter1: 'first quarter of',
    quarter2: 'second quarter of',
    quarter3: 'third quarter of',
    quarter4: 'fourth quarter of',
    quadrimester1: 'first third of',
    quadrimester2: 'second third of',
    quadrimester3: 'third third of',
    semestral1: 'first half of',
    semestral2: 'second half of',
  },
  formats: {
    day: '%B %-d, %Y',
    month: '%B %Y',
    year: '%Y',
    dayMonth: '%B %-d',
  },
  terms: {
    approximatePrefix: same('circa '),
    approximateSuffix: same(''),
    uncertainPrefix: '',
    uncertainSuffix: '?',
    decadePrefix: '',
    decadeSuffix: 's',
    bcSuffix: ' BCE',
    intervalPrefix: same(''),
    intervalConnector: same(' to '),
    intervalConnectorApproximate: ' to ',
    openStartInterval: same('until {date}'),
    openEndInterval: same('since {date}'),
    unknownStartInterval: same('unknown date to {date}'),
    unknownEndInterval: same('{date} to unknown date'),
    exclusiveSet: {
      datesConnector: ', ',
      lastDateConnector: ' or ',
      twoDatesConnector: ' or ',
      earlierPrefix: 'on or before ',
      laterPrefix: 'on or after ',
    },
    inclusiveSet: {
      datesConnector: ', ',
      lastDateConnector: ' and ',
      twoDatesConnector: ' and ',
      earlierPrefix: 'on and before ',
      laterPrefix: 'on and after ',
    },
    seasonHemisphere: {
      northern: ' (Northern Hemisphere)',
      southern: ' (Southern Hemisphere)',
    },
    significantDigits: '{year} (estimated, between {from} and {to})',
    unknown: 'unknown',
    unknownParts: {
      year: '(year unknown)',
      month: '(month unknown)',
      day: '(day unknown)',
      exactDate: '(exact date unknown)',
    },
    unspecifiedYearWithMonth: '{month}, {span}',
    unspecifiedYearRange: '{from} to {to}',
  },
  century: (year) => `${ordinalize(centuryNumber(year))} century${year < 0 ? ' BCE' : ''}`,
}

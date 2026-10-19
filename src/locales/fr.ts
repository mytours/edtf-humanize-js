import type { Locale } from '../locale.js'
import { toRoman } from '../roman.js'
import { centuryNumber, same } from './shared.js'

export const fr: Locale = {
  code: 'fr',
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
  seasons: {
    spring: 'printemps',
    summer: 'été',
    autumn: 'automne',
    winter: 'hiver',
    quarter1: 'premier trimestre',
    quarter2: 'deuxième trimestre',
    quarter3: 'troisième trimestre',
    quarter4: 'quatrième trimestre',
    quadrimester1: 'premier quadrimestre',
    quadrimester2: 'deuxième quadrimestre',
    quadrimester3: 'troisième quadrimestre',
    semestral1: 'premier semestre',
    semestral2: 'second semestre',
  },
  formats: {
    day: '%-d %B %Y',
    month: '%B %Y',
    year: '%Y',
    dayMonth: '%-d %B',
  },
  terms: {
    approximatePrefix: same(''),
    approximateSuffix: same(' environ'),
    uncertainPrefix: '',
    uncertainSuffix: '?',
    decadePrefix: 'Les années ',
    decadeSuffix: '',
    bcSuffix: ' avant J.C.',
    intervalPrefix: { year: 'De ', month: 'De ', day: 'Du ' },
    intervalConnector: { year: ' à ', month: ' à ', day: ' au ' },
    intervalConnectorApproximate: ' à ',
    openStartInterval: {
      year: "Jusqu'en {date}",
      month: "Jusqu'en {date}",
      day: "Jusqu'au {date}",
    },
    openEndInterval: { year: 'Depuis {date}', month: 'Depuis {date}', day: 'Depuis le {date}' },
    unknownStartInterval: {
      year: "date inconnue jusqu'en {date}",
      month: "date inconnue jusqu'en {date}",
      day: 'date inconnue au {date}',
    },
    unknownEndInterval: same('{date} à date inconnue'),
    exclusiveSet: {
      datesConnector: ', ',
      lastDateConnector: ' ou ',
      twoDatesConnector: ' ou ',
      earlierPrefix: 'Le ou avant ',
      laterPrefix: 'Le ou après ',
    },
    inclusiveSet: {
      datesConnector: ', ',
      lastDateConnector: ' et ',
      twoDatesConnector: ' et ',
      earlierPrefix: 'Le et avant ',
      laterPrefix: 'Le et après ',
    },
    seasonHemisphere: {
      northern: ' (hémisphère nord)',
      southern: ' (hémisphère sud)',
    },
    significantDigits: '{year} (estimé, entre {from} et {to})',
    unknown: 'Inconnue',
    unknownParts: {
      year: '(année inconnue)',
      month: '(mois inconnu)',
      day: '(jour inconnu)',
      exactDate: '(date exacte inconnue)',
    },
    unspecifiedYearWithMonth: '{month} {span}',
    unspecifiedYearRange: '{from} à {to}',
    qualifiedParts: {
      year: {
        approximate: 'année approximative',
        uncertain: 'année incertaine',
        both: 'année approximative et incertaine',
      },
      month: {
        approximate: 'mois approximatif',
        uncertain: 'mois incertain',
        both: 'mois approximatif et incertain',
      },
      day: {
        approximate: 'jour approximatif',
        uncertain: 'jour incertain',
        both: 'jour approximatif et incertain',
      },
      connector: ', ',
      template: ' ({parts})',
    },
  },
  // 19XX => XXe siècle, 00XX => Ier siècle
  century: (year) =>
    `${toRoman(centuryNumber(year))}${centuryNumber(year) === 1 ? 'er' : 'e'} siècle` +
    (year < 0 ? ' avant J.C.' : ''),
  spanInterval: {
    decadeFrom: 'Des années',
    decadeTo: 'aux années',
    centuryFrom: 'Du',
    centuryTo: 'au',
  },
}

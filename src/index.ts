export { humanize, InvalidEdtfError, type HumanizeOptions } from './humanize.js'
export { normalizeLegacySyntax } from './legacy.js'
export { de, en, enGB, fr, it, locales, type LocaleCode } from './locales/index.js'
export type {
  ByPrecision,
  Locale,
  PartQualifierTerms,
  Precision,
  SeasonName,
  SetTerms,
} from './locale.js'
export type {
  EdtfBitmask,
  EdtfCentury,
  EdtfDate,
  EdtfDecade,
  EdtfInterval,
  EdtfIntervalEndpoint,
  EdtfSeason,
  EdtfSet,
  EdtfValue,
  EdtfYear,
} from './types.js'

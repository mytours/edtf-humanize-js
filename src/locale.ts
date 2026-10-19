export type Precision = 'year' | 'month' | 'day'

/** A term that varies with the precision of the date it applies to */
export type ByPrecision = Readonly<Record<Precision, string>>

/** How to describe one qualified part: 'month uncertain' */
export interface PartQualifierTerms {
  readonly approximate: string
  readonly uncertain: string
  /** Approximate and uncertain ('%') */
  readonly both: string
}

export type SeasonName =
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter'
  | 'quarter1'
  | 'quarter2'
  | 'quarter3'
  | 'quarter4'
  | 'quadrimester1'
  | 'quadrimester2'
  | 'quadrimester3'
  | 'semestral1'
  | 'semestral2'

export interface SetTerms {
  /** Between all but the last two dates: '1980, 1981 or 1983' */
  readonly datesConnector: string
  /** Between the last two of three or more dates */
  readonly lastDateConnector: string
  /** Between exactly two dates */
  readonly twoDatesConnector: string
  /** '[..1980]' => on or before 1980 */
  readonly earlierPrefix: string
  /** '[1980..]' => on or after 1980 */
  readonly laterPrefix: string
}

/**
 * Text for one language. Templates use `{name}` placeholders. Date formats use
 * strftime directives: `%B` (month name), `%-d` (day), `%d` (zero-padded day),
 * `%-m` / `%m` (month number), `%Y` (year, at least four digits) and `%%`.
 *
 * To adjust a built-in locale, spread it:
 * `{ ...en, terms: { ...en.terms, unknown: 'n.d.' } }`
 */
export interface Locale {
  readonly code: string
  /** January to December */
  readonly monthNames: readonly string[]
  readonly seasons: Readonly<Record<SeasonName, string>>
  readonly formats: {
    /** October 5, 1995 */
    readonly day: string
    /** October 1995 */
    readonly month: string
    /** 1995 */
    readonly year: string
    /** October 5 (the year is unknown) */
    readonly dayMonth: string
  }
  readonly terms: {
    readonly approximatePrefix: ByPrecision
    readonly approximateSuffix: ByPrecision
    readonly uncertainPrefix: string
    readonly uncertainSuffix: string
    readonly decadePrefix: string
    readonly decadeSuffix: string
    readonly bcSuffix: string
    readonly intervalPrefix: ByPrecision
    readonly intervalConnector: ByPrecision
    /** Used instead of intervalConnector when the end date is approximate */
    readonly intervalConnectorApproximate: string
    /** '../1980' => until 1980 ({date}) */
    readonly openStartInterval: ByPrecision
    /** '1980/..' => since 1980 ({date}) */
    readonly openEndInterval: ByPrecision
    /** '/1980' => unknown date to 1980 ({date}) */
    readonly unknownStartInterval: ByPrecision
    /** '1980/' => 1980 to unknown date ({date}) */
    readonly unknownEndInterval: ByPrecision
    /** '[a,b]': one of the dates */
    readonly exclusiveSet: SetTerms
    /** '{a,b}': all of the dates */
    readonly inclusiveSet: SetTerms
    readonly seasonHemisphere: { readonly northern: string; readonly southern: string }
    /** '1950S2' => {year} (estimated, between {from} and {to}) */
    readonly significantDigits: string
    readonly unknown: string
    readonly unknownParts: {
      readonly year: string
      readonly month: string
      readonly day: string
      /** More than one part is unknown */
      readonly exactDate: string
    }
    /** '198X-05' => {month}, {span} */
    readonly unspecifiedYearWithMonth: string
    /** '1XXX' => {from} to {to} */
    readonly unspecifiedYearRange: string
    /**
     * Used with `qualifiers: 'parts'` when the parts of a date are qualified
     * differently: '1982-?03-~12' => March 12, 1982 (month uncertain, day
     * approximate). `template` wraps the joined `{parts}`. Omit to always use
     * the whole-date wording.
     */
    readonly qualifiedParts?: {
      readonly year: PartQualifierTerms
      readonly month: PartQualifierTerms
      readonly day: PartQualifierTerms
      readonly connector: string
      readonly template: string
    }
  }
  /** The name of the century containing year: 1950 => '20th century' */
  readonly century: (year: number) => string
  /**
   * Wording for intervals with a decade or century endpoint, for languages
   * that contract the preposition with the article: '198X/199X' =>
   * 'Des années 1980 aux années 1990'. Omit to use the ordinary interval terms.
   */
  readonly spanInterval?: {
    readonly decadeFrom: string
    readonly decadeTo: string
    readonly centuryFrom: string
    readonly centuryTo: string
  }
}

// Structural types for the edtf.js objects this library reads. Anything
// returned by `edtf()` from the `edtf` package satisfies EdtfValue.

/** An edtf.js qualification bitmask; non-zero when any part is qualified. */
export interface EdtfBitmask {
  readonly value: number
}

/** '1975-07-01', '1990-XX', '1984%' */
export interface EdtfDate {
  readonly type: 'Date'
  /** [year, month (0-based), day], as far as the precision goes */
  readonly values: readonly number[]
  /** 1 = year, 2 = month, 3 = day */
  readonly precision: number
  readonly uncertain: EdtfBitmask
  readonly approximate: EdtfBitmask
  readonly unspecified: EdtfBitmask
}

/** 'Y170000002', 'Y17E7', '1950S2' */
export interface EdtfYear {
  readonly type: 'Year'
  readonly year: number
  /** Significant digits; NaN or undefined when not given */
  readonly significant?: number
}

/** '199' (the 1990s) */
export interface EdtfDecade {
  readonly type: 'Decade'
  readonly year: number
}

/** '19' (the 20th century) */
export interface EdtfCentury {
  readonly type: 'Century'
  readonly year: number
}

/** '2001-21' (spring) through '2001-41' (second half) */
export interface EdtfSeason {
  readonly type: 'Season'
  readonly year: number
  readonly season: number
  readonly uncertain: EdtfBitmask
  readonly approximate: EdtfBitmask
}

export type EdtfIntervalEndpoint = EdtfDate | EdtfYear | EdtfSeason

/** '1970/1980'; an open end ('..') is Infinity, an unknown end ('') is null */
export interface EdtfInterval {
  readonly type: 'Interval'
  readonly lower: EdtfIntervalEndpoint | number | null
  readonly upper: EdtfIntervalEndpoint | number | null
}

/** The ends of a range inside a set: '1670..1672' */
export interface EdtfSetRangeEnd extends EdtfDate {
  /** Every date from this one to end, at this date's precision */
  through(end: EdtfSetRangeEnd): Iterable<EdtfDate>
}

/** '[1980,1981]' (Set: one of) or '{1980,1981}' (List: all of) */
export interface EdtfSet extends Iterable<EdtfValue> {
  readonly type: 'Set' | 'List'
  /** Members as written; a range is a pair of its ends */
  readonly values: readonly (EdtfValue | readonly [EdtfSetRangeEnd, EdtfSetRangeEnd])[]
  readonly earlier: boolean
  readonly later: boolean
}

export type EdtfValue =
  EdtfDate | EdtfYear | EdtfDecade | EdtfCentury | EdtfSeason | EdtfInterval | EdtfSet

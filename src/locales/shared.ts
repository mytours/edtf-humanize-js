import type { ByPrecision } from '../locale.js'

/** The same term at every precision */
export function same(term: string): ByPrecision {
  return { year: term, month: term, day: term }
}

/** 1-based number of the century containing year: 1950 => 20, -100 => 2 */
export function centuryNumber(year: number): number {
  return Math.floor(Math.abs(year) / 100) + 1
}

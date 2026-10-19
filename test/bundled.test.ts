import * as edtf from 'edtf'
import { afterEach, describe, expect, it } from 'vitest'
import { humanize } from '../src/index.js'

// Bundlers rename edtf.js's `class Date` (it shadows the global) to Date$1 or
// similar, and edtf.js derives each value's `type` from its class name.
function renameDate(): () => void {
  const proto = (edtf.Date as unknown as { prototype: object }).prototype
  const own = Object.getOwnPropertyDescriptor(proto, 'type')
  Object.defineProperty(proto, 'type', { configurable: true, get: () => 'Date$1' })
  return () => {
    if (own) Object.defineProperty(proto, 'type', own)
    else Reflect.deleteProperty(proto, 'type')
  }
}

describe('when a bundler renames edtf.js classes', () => {
  let restore: (() => void) | undefined
  afterEach(() => {
    restore?.()
    restore = undefined
  })

  it('still labels dates, intervals and sets', () => {
    restore = renameDate()
    expect(humanize('1975-07-01')).toBe('July 1, 1975')
    expect(humanize('1990~')).toBe('circa 1990')
    expect(humanize('1970/1980')).toBe('1970 to 1980')
    expect(humanize('[1980,1981]')).toBe('1980 or 1981')
    expect(humanize('2001-21/2001-23')).toBe('spring 2001 to autumn 2001')
  })
})

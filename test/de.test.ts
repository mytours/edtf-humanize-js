import { describe, expect, it } from 'vitest'

import { humanize } from '../src/index.js'

// Ported from the Ruby gem's spec/edtf/humanize_de_spec.rb
const cases: [edtf: string, expected: string][] = [
  ['199x', '1990er Jahre'],
  ['-001x', '10er Jahre v. Chr.'],
  ['19xx', '20. Jahrhundert'],
  ['-01xx', '2. Jahrhundert v. Chr.'],
  ['1970/1980', '1970 - 1980'],
  ['198X/199X', '1980er Jahre (Jahr unbekannt) - 1990er Jahre (Jahr unbekannt)'],
  ['19XX/20XX', '20. Jahrhundert (Jahr unbekannt) - 21. Jahrhundert (Jahr unbekannt)'],
  ['1970/open', '1970 - '],
  ['unknown/1970', 'unbekanntes Datum bis 1970'],
  ['1970/unknown', '1970 bis unbekanntes Datum'],
  ['1970~/1980~', 'circa 1970 - circa 1980'],
  ['1975-07-01', '1. Juli 1975'],
  ['1975?', '1975 ?'],
  ['197X', '1970er Jahre (Jahr unbekannt)'],
  ['19XX', '20. Jahrhundert (Jahr unbekannt)'],
  ['198X-05', 'Mai 1980er Jahre (Jahr unbekannt)'],
  ['1990-XX', '1990 (Monat unbekannt)'],
  ['1990-XX-XX', '1990 (genaues Datum unbekannt)'],
  ['1975-22', 'Sommer 1975'],
  ['1975-22~', 'circa Sommer 1975'],
  ['1975-22?~', 'circa Sommer 1975 ?'],
  ['[1980, 1981, 1983]', '1980, 1981 oder 1983'],
  ['{1980, 1981, 1983}', '1980, 1981 und 1983'],
  ['{1980, 1981}', '1980 und 1981'],
  ['[..1980]', 'vor 1980'],
  ['[1980..]', 'nach 1980'],
  ['{..1980}', 'vor 1980'],
  ['{1980..}', 'nach 1980'],
  ['XXXX', 'Datum unbekannt'],
]

describe('humanize in German', () => {
  it.each(cases)('%s => %s', (edtf, expected) => {
    expect(humanize(edtf, { locale: 'de' })).toBe(expected)
  })
})

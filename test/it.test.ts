import { describe, expect, it } from 'vitest'

import { humanize } from '../src/index.js'

// Ported from the Ruby gem's spec/edtf/humanize_it_spec.rb
const cases: [edtf: string, expected: string][] = [
  ['199x', 'anni 1990'],
  ['-001x', 'anni 10 a. C.'],
  ['19xx', 'XX secolo'],
  ['1970/1980', '1970 - 1980'],
  ['198X/199X', 'anni 1980 (anno sconosciuto) - anni 1990 (anno sconosciuto)'],
  ['19XX/20XX', 'XX secolo (anno sconosciuto) - XXI secolo (anno sconosciuto)'],
  ['1970/open', '1970 - '],
  ['unknown/1970', 'data sconosciuta a 1970'],
  ['1970/unknown', '1970 a data sconosciuta'],
  ['1970~/1980~', 'circa 1970 - circa 1980'],
  ['1975-07-01', '1 luglio 1975'],
  ['1975?', '1975 ?'],
  ['197X', 'anni 1970 (anno sconosciuto)'],
  ['19XX', 'XX secolo (anno sconosciuto)'],
  ['198X-05', 'maggio anni 1980 (anno sconosciuto)'],
  ['1990-XX', '1990 (mese sconosciuto)'],
  ['1990-XX-XX', '1990 (data esatta sconosciuta)'],
  ['1975-22', 'estate 1975'],
  ['1975-22~', 'circa estate 1975'],
  ['1975-22?~', 'circa estate 1975 ?'],
  ['[1980, 1981, 1983]', '1980, 1981 o 1983'],
  ['{1980, 1981, 1983}', '1980, 1981 e 1983'],
  ['[..1980]', 'prima di 1980'],
  ['[1980..]', 'dopo 1980'],
  ['{..1980}', 'prima di 1980'],
  ['{1980..}', 'dopo 1980'],
  ['XXXX', 'data sconosciuta'],
]

describe('humanize in Italian', () => {
  it.each(cases)('%s => %s', (edtf, expected) => {
    expect(humanize(edtf, { locale: 'it' })).toBe(expected)
  })
})

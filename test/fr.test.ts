import { describe, expect, it } from 'vitest'

import { humanize } from '../src/index.js'

// Ported from the Ruby gem's spec/edtf/humanize_fr_spec.rb
const cases: [edtf: string, expected: string][] = [
  ['199x', 'Les années 1990'],
  ['-001x', 'Les années 10 avant J.C.'],
  ['19xx', 'XXe siècle'],
  ['00xx', 'Ier siècle'],
  ['1970/1980', 'De 1970 à 1980'],
  ['198X/199X', 'Des années 1980 (année inconnue) aux années 1990 (année inconnue)'],
  ['19XX/20XX', 'Du XXe siècle (année inconnue) au XXIe siècle (année inconnue)'],
  ['1985/199X', 'De 1985 aux années 1990 (année inconnue)'],
  ['198X/1995', 'Des années 1980 (année inconnue) à 1995'],
  ['198X-05/1995', 'De Mai Les années 1980 (année inconnue) à 1995'],
  ['1970/open', 'Depuis 1970'],
  ['unknown/1970', "date inconnue jusqu'en 1970"],
  ['1970/unknown', '1970 à date inconnue'],
  ['1970~/1980~', 'De 1970 environ à 1980 environ'],
  ['1975-07-01', '1 Juillet 1975'],
  ['1975?', '1975?'],
  ['197X', 'Les années 1970 (année inconnue)'],
  ['19XX', 'XXe siècle (année inconnue)'],
  ['198X-05', 'Mai Les années 1980 (année inconnue)'],
  ['1990-XX', '1990 (mois inconnu)'],
  ['1990-XX-XX', '1990 (date exacte inconnue)'],
  ['1975-22', 'été 1975'],
  ['1975-22~', 'été 1975 environ'],
  ['1975-22?~', 'été 1975 environ?'],
  ['[1980, 1981, 1983]', '1980, 1981 ou 1983'],
  ['{1980, 1981, 1983}', '1980, 1981 et 1983'],
  ['[..1980]', 'Le ou avant 1980'],
  ['[1980..]', 'Le ou après 1980'],
  ['{..1980}', 'Le et avant 1980'],
  ['{1980..}', 'Le et après 1980'],
  ['XXXX', 'Inconnue'],
]

describe('humanize in French', () => {
  it.each(cases)('%s => %s', (edtf, expected) => {
    expect(humanize(edtf, { locale: 'fr' })).toBe(expected)
  })
})

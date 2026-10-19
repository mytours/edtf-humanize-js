// Checks the built CommonJS entry point, which unit tests (run from source) don't cover
const assert = require('node:assert/strict')
const { humanize } = require('edtf-humanize')

assert.equal(humanize('1975-07-01'), 'July 1, 1975')
assert.equal(
  humanize('198X/199X', { locale: 'fr' }),
  'Des années 1980 (année inconnue) aux années 1990 (année inconnue)',
)
console.log('CommonJS build OK')

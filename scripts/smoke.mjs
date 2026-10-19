// Checks the built ES module entry point, which unit tests (run from source) don't cover
import assert from 'node:assert/strict'
import { humanize } from 'edtf-humanize'

assert.equal(humanize('1975-07-01'), 'July 1, 1975')
assert.equal(humanize('2001-29', { locale: 'de' }), 'Frühling 2001 (Südhalbkugel)')
console.log('ES module build OK')

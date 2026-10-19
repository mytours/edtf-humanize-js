# edtf-humanize

Turn [Extended Date/Time Format (EDTF)](https://www.loc.gov/standards/datetime/) strings into human-readable text, in English, French, German and Italian.

```ts
import { humanize } from 'edtf-humanize'

humanize('1975-07-01') // 'July 1, 1975'
humanize('1990~') // 'circa 1990'
humanize('198X') // '1980s (year unknown)'
humanize('2001-33') // 'first quarter of 2001'
humanize('1970/1980', { locale: 'fr' }) // 'De 1970 à 1980'
```

A TypeScript port of the Ruby [edtf-humanize](https://github.com/corylown/edtf-humanize) gem, including EDTF 2019 (ISO 8601-2) support from [mytours/edtf-humanize#1](https://github.com/mytours/edtf-humanize/pull/1). Parsing is done by [edtf.js](https://github.com/inukshuk/edtf.js).

- Works in Node.js 20+ and browsers, as an ES module or CommonJS
- Type declarations included
- No global state: the locale is passed per call

## Installation

```sh
npm install edtf-humanize
```

## Usage

`humanize(input, options?)` takes an EDTF string, or a value already parsed by edtf.js, and returns a string.

```ts
import edtf from 'edtf'
import { humanize, InvalidEdtfError } from 'edtf-humanize'

humanize('1985/..') // 'since 1985'
humanize(edtf('1985-04')) // 'April 1985'

try {
  humanize('not a date')
} catch (error) {
  if (error instanceof InvalidEdtfError) console.log(error.input) // 'not a date'
}
```

### Examples

| EDTF                         | `humanize`                               |
| ---------------------------- | ---------------------------------------- |
| `1975-07-01`                 | July 1, 1975                             |
| `1975-07`                    | July 1975                                |
| `1975?`                      | 1975?                                    |
| `1975~`                      | circa 1975                               |
| `1984%`                      | circa 1984?                              |
| `2004-06-~11`                | circa June 11, 2004                      |
| `199x` or `199`              | 1990s                                    |
| `19xx` or `19`               | 20th century                             |
| `1970/1980`                  | 1970 to 1980                             |
| `1970~/1980~`                | circa 1970 to circa 1980                 |
| `1985/..` or `1985/open`     | since 1985                               |
| `../1985-04`                 | until April 1985                         |
| `1985/` or `1985/unknown`    | 1985 to unknown date                     |
| `/1985` or `unknown/1985`    | unknown date to 1985                     |
| `1975-22`                    | summer 1975                              |
| `2001-29`                    | spring 2001 (Southern Hemisphere)        |
| `2001-33`                    | first quarter of 2001                    |
| `2001-37`                    | first third of 2001                      |
| `2001-40`                    | first half of 2001                       |
| `[1980, 1981, 1983]`         | 1980, 1981 or 1983                       |
| `{1980, 1981, 1983}`         | 1980, 1981 and 1983                      |
| `[..1980]`                   | on or before 1980                        |
| `{1980..}`                   | on and after 1980                        |
| `[1667,1668-?12,1670..1672]` | 1667, December 1668?, 1670, 1671 or 1672 |
| `[1950..1960]`               | 1950 to 1960                             |
| `1950S2`                     | 1950 (estimated, between 1900 and 1999)  |
| `Y17E7`                      | 170000000                                |
| `XXXX`                       | unknown                                  |

### Unspecified digits

A lowercase `x` and an uppercase `X` mean different things. `199x` (EDTF 2012 draft) is the decade as a whole; `199X` is a single year in that decade, but which one is unknown.

| EDTF         | `humanize`                                   |
| ------------ | -------------------------------------------- |
| `198X`       | 1980s (year unknown)                         |
| `19XX`       | 20th century (year unknown)                  |
| `1XXX`       | 1000 to 1999 (year unknown)                  |
| `1X99`       | 1X99 (year unknown)                          |
| `198X-05`    | May, 1980s (year unknown)                    |
| `1990-XX`    | 1990 (month unknown)                         |
| `1990-05-XX` | May 1990 (day unknown)                       |
| `1990-XX-XX` | 1990 (exact date unknown)                    |
| `XXXX-12-25` | December 25 (year unknown)                   |
| `XXXX-XX`    | unknown                                      |
| `198X/199X`  | 1980s (year unknown) to 1990s (year unknown) |

### EDTF 2012 draft syntax

edtf.js parses EDTF 2019 (ISO 8601-2). For data written against the 2012 draft, `humanize` first rewrites these forms to their 2019 equivalents:

| 2012 draft         | EDTF 2019   |
| ------------------ | ----------- |
| `199x`, `19xx`     | `199`, `19` |
| `1970/open`        | `1970/..`   |
| `1970/unknown`     | `1970/`     |
| `197u`             | `197X`      |
| `1975-22?~`        | `1975-22%`  |
| `2001-21^southern` | `2001-29`   |

The rewrite is exported as `normalizeLegacySyntax(edtf)` if you want to migrate stored data.

### Qualified parts

EDTF 2019 can qualify one part of a date: in `2004-06-~11` only the day is approximate. By default, as in the Ruby gem, any qualifier applies to the whole date. Pass `qualifiers: 'parts'` to name the parts instead, when they differ:

```ts
humanize('1982-?03-~12') // 'circa March 12, 1982?'
humanize('1982-?03-~12', { qualifiers: 'parts' }) // 'March 12, 1982 (month uncertain, day approximate)'
humanize('1984~', { qualifiers: 'parts' }) // 'circa 1984' (every part is qualified the same way)
```

## Languages

Pass a locale code (`'en'`, `'fr'`, `'de'` or `'it'`) or a `Locale` object. English is the default.

```ts
humanize('1975-07-01', { locale: 'de' }) // '1. Juli 1975'
humanize('19XX/20XX', { locale: 'fr' }) // 'Du XXe siècle (année inconnue) au XXIe siècle (année inconnue)'
humanize('1975-22~', { locale: 'it' }) // 'circa estate 1975'
```

To change some wording, spread a built-in locale:

```ts
import { en, humanize, type Locale } from 'edtf-humanize'

const catalogue: Locale = {
  ...en,
  code: 'en-catalogue',
  terms: {
    ...en.terms,
    unknown: 'n.d.',
    approximatePrefix: { year: 'ca. ', month: 'ca. ', day: 'ca. ' },
  },
}

humanize('1950~', { locale: catalogue }) // 'ca. 1950'
```

A new language needs every field of `Locale`; the built-in locales in [`src/locales`](src/locales) are the reference. Templates use `{name}` placeholders, and date formats use the strftime directives `%B`, `%-d`, `%d`, `%-m`, `%m` and `%Y`.

## Differences from the Ruby gem

Output matches the gem's specs, except for two fixes:

- French: `Décembre`, not `Decembre`
- German: two dates in an inclusive set are joined with `und`, not `eund`

Translations of quarters, quadrimesters and semestrals, English "first third of", and the French, German and Italian `qualifiedParts` wording have not been reviewed by native speakers. Pull requests with corrections, or with new languages, are welcome.

## Development

```sh
npm install
npm test             # unit tests
npm run lint         # ESLint and Prettier
npm run typecheck
npm run build        # dist/ (ESM, CommonJS and type declarations)
npm run test:dist    # smoke-test the built package
npm run check:package # publint and Are the Types Wrong?
```

### Releasing

1. Update the version in `package.json` and `CHANGELOG.md`, and commit.
2. Create a GitHub release with a `vX.Y.Z` tag. The Release workflow publishes to npm with provenance.

The workflow uses npm [trusted publishing](https://docs.npmjs.com/trusted-publishers). Before the first release, publish once by hand (`npm publish`), then link the package to the `release.yml` workflow in its npm settings.

## License

BSD-3-Clause, as the Ruby gem. See [LICENSE](LICENSE).

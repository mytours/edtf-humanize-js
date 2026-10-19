# Changelog

All notable changes to this project are documented here. This project follows [Semantic Versioning](https://semver.org/).

## Unreleased

- Set ranges of more than three dates are summarised instead of listed: `[1950..1960]` is "1950 to 1960", where it used to list all eleven years. Ranges of days or months are no longer expanded, so `[1890-01-01..2020-12-25]` is quick to label. Shorter ranges are still listed, as before.
- Years before 1 are written as BCE, counting astronomically as ISO 8601 does: `0000` is "1 BCE" and `-0044-03-15` is "March 15, 45 BCE" (it used to be "March 15, -0044"). Decades, centuries and significant-digit ranges are unchanged.
- `qualifiers: 'parts'` names the qualified parts of a date when they differ: `1982-?03-~12` is "March 12, 1982 (month uncertain, day approximate)". The default, `'whole'`, is unchanged. Locales have an optional `terms.qualifiedParts`; custom locales without it keep the whole-date wording.

## 0.1.0

First release: a TypeScript port of the Ruby edtf-humanize gem (3.0, with EDTF 2019 support from mytours/edtf-humanize#1).

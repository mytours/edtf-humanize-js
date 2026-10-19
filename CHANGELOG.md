# Changelog

All notable changes to this project are documented here. This project follows [Semantic Versioning](https://semver.org/).

## Unreleased

- Set ranges of more than three dates are summarised instead of listed: `[1950..1960]` is "1950 to 1960", where it used to list all eleven years. Ranges of days or months are no longer expanded, so `[1890-01-01..2020-12-25]` is quick to label. Shorter ranges are still listed, as before.

## 0.1.0

First release: a TypeScript port of the Ruby edtf-humanize gem (3.0, with EDTF 2019 support from mytours/edtf-humanize#1).

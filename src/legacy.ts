const HEMISPHERE_OFFSETS: Readonly<Record<string, number>> = { northern: 4, southern: 8 }

/**
 * Rewrites the EDTF 2012 draft syntax that edtf.js does not parse into its
 * EDTF 2019 (ISO 8601-2) equivalent. EDTF 2019 strings pass through unchanged.
 *
 * - '199x' => '199' (decade), '19xx' => '19' (century)
 * - '1970/open' => '1970/..', '1970/unknown' => '1970/'
 * - '197u' => '197X' (unspecified digit)
 * - '1975-22?~' => '1975-22%' (uncertain and approximate)
 * - '2001-21^southern' => '2001-29' (hemisphere season)
 */
export function normalizeLegacySyntax(input: string): string {
  const edtf = input.trim()

  const span = /^(-?\d{3})x$/.exec(edtf) ?? /^(-?\d{2})xx$/.exec(edtf)
  if (span?.[1] !== undefined) return span[1]

  return edtf
    .split('/')
    .map((part) => (part === 'open' ? '..' : part === 'unknown' ? '' : part))
    .join('/')
    .replace(/(-\d{2})\^(northern|southern)/g, (_match, season: string, hemisphere: string) =>
      seasonInHemisphere(season, hemisphere),
    )
    .replace(/[ux]/g, 'X')
    .replace(/\?~|~\?/g, '%')
}

// '-21', 'southern' => '-29'; only the generic seasons 21-24 take a hemisphere
function seasonInHemisphere(season: string, hemisphere: string): string {
  const code = Number(season.slice(1))
  const offset = HEMISPHERE_OFFSETS[hemisphere] ?? 0
  return code >= 21 && code <= 24 ? `-${String(code + offset)}` : season
}

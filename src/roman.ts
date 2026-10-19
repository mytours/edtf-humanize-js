const NUMERALS: readonly (readonly [number, string])[] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

/** 1999 => 'MCMXCIX'; thousands beyond 3999 repeat M */
export function toRoman(number: number): string {
  let rest = number
  let roman = ''
  for (const [value, letters] of NUMERALS) {
    roman += letters.repeat(Math.floor(rest / value))
    rest %= value
  }
  return roman
}

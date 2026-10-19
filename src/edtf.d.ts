// edtf.js ships no type declarations. Only what this library uses is declared;
// constructed values are checked against the structural types in ./types.ts.
//
// The default export (the edtf() function) is avoided: edtf's CommonJS build
// has no __esModule marker, so bundlers' interop resolves it to the module
// object. The named exports behave the same from ESM and CommonJS.
declare module 'edtf' {
  export interface Constraints {
    level?: 0 | 1 | 2 | 3
  }

  export interface ParseResult {
    type: 'Date' | 'Year' | 'Decade' | 'Century' | 'Season' | 'Interval' | 'List' | 'Set'
  }

  type ExtDateConstructor = new (parsed: ParseResult) => unknown

  export default function edtf(input: string, constraints?: Constraints): unknown

  export function parse(input: string, constraints?: Constraints): ParseResult

  export const Date: ExtDateConstructor
  export const Year: ExtDateConstructor
  export const Decade: ExtDateConstructor
  export const Century: ExtDateConstructor
  export const Season: ExtDateConstructor
  export const Interval: ExtDateConstructor
  export const List: ExtDateConstructor
  export const Set: ExtDateConstructor
}

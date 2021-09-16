import { DiacriticsMap, RightsStatements } from '../_data';

/** appendDiacriticEquivalents
/* @param {string} source - the source string
/* - replaces every instance of A-Z with the equivalent diacritics, wrapped in square brackets, for use in a Regex
*/
export function appendDiacriticEquivalents(source: string): string {
  if (source.length === 0) {
    return source;
  }
  return source
    .replace(/A/gi, `[${DiacriticsMap.A}]`)
    .replace(/B/gi, `[${DiacriticsMap.B}]`)
    .replace(/C/gi, `[${DiacriticsMap.C}]`)
    .replace(/D/gi, `[${DiacriticsMap.D}]`)
    .replace(/E/gi, `[${DiacriticsMap.E}]`)
    .replace(/F/gi, `[${DiacriticsMap.F}]`)
    .replace(/G/gi, `[${DiacriticsMap.G}]`)
    .replace(/H/gi, `[${DiacriticsMap.H}]`)
    .replace(/I/gi, `[${DiacriticsMap.I}]`)
    .replace(/J/gi, `[${DiacriticsMap.J}]`)
    .replace(/K/gi, `[${DiacriticsMap.K}]`)
    .replace(/L/gi, `[${DiacriticsMap.L}]`)
    .replace(/M/gi, `[${DiacriticsMap.M}]`)
    .replace(/N/gi, `[${DiacriticsMap.N}]`)
    .replace(/O/gi, `[${DiacriticsMap.O}]`)
    .replace(/P/gi, `[${DiacriticsMap.P}]`)
    .replace(/Q/gi, `[${DiacriticsMap.Q}]`)
    .replace(/R/gi, `[${DiacriticsMap.R}]`)
    .replace(/S/gi, `[${DiacriticsMap.S}]`)
    .replace(/T/gi, `[${DiacriticsMap.T}]`)
    .replace(/U/gi, `[${DiacriticsMap.U}]`)
    .replace(/V/gi, `[${DiacriticsMap.V}]`)
    .replace(/W/gi, `[${DiacriticsMap.W}]`)
    .replace(/X/gi, `[${DiacriticsMap.X}]`)
    .replace(/Y/gi, `[${DiacriticsMap.Y}]`)
    .replace(/Z/gi, `[${DiacriticsMap.Z}]`);
}

export function rightsUrlMatch(url: string): string | null {
  const trimmed = url
    .toLowerCase()
    .trim()
    .replace(/(h)?ttp(s)?:/i, '')
    .split('?')[0]
    .replace(/[\/]$/, '');

  const replaced = RightsStatements[trimmed];

  if (replaced) {
    return replaced.split('?')[0].trim();
  }
  return null;
}

import { FormGroup } from '@angular/forms';
import { DiacriticsMap, RightsStatements } from '../_data';

/** replaceDiacritics
/* @param {string} source - the source string
/* - replaces every instance of A-Z with the equivalent diacritics
*/
export function replaceDiacritics(source: string): string {
  Object.keys(DiacriticsMap).forEach((key: string) => {
    source = source.replace(
      new RegExp('[' + DiacriticsMap[key] + ']', 'gi'),
      key
    );
  });
  return source;
}

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

/** filterList
/* @returns filterables filtered by filterString
**/
export function filterList<T>(
  filterString: string,
  filterables: Array<T>,
  filterProp?: string
): Array<T> {
  const filter = replaceDiacritics(filterString);
  const reg = new RegExp(appendDiacriticEquivalents(filter), 'gi');
  return filterables.filter((filterable: unknown) => {
    // clear regex indexes with empty exec to prevent bug where "ne" fails to match "Netherlands"
    reg.exec('');

    return (
      !filter ||
      reg.exec(
        filterProp
          ? (
              filterable as {
                name: string;
              }
            )[filterProp]
          : (filterable as string)
      )
    );
  });
}

/** fromInputSafeName
/* @param {string} s - the target string
/* - replaces the 5 underscores sequence in a string with a dot character
*/
export function fromInputSafeName(s: string): string {
  return s.replace(/_____/g, '.');
}

/** toInputSafeName
/* @param {string} s - the target string
/* - replaces the dot character in a string with 5 underscores
*/
export function toInputSafeName(s: string): string {
  return s.replace(/\./g, '_____');
}

/** fromCSL
/* @param {string} s - the target string
/* - splits the string on commas and return the trimmed results
*/
export function fromCSL(s: string): Array<string> {
  return s.split(',').map((part: string) => {
    return part.trim();
  });
}

export function getFormValueList(
  form: FormGroup,
  field: string
): Array<string> {
  const vals = form.value[field];
  const res = vals
    ? Object.keys(vals)
        .filter((key: string) => {
          return vals[key];
        })
        .map(fromInputSafeName)
    : [];
  return res;
}

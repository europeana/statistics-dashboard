import { FormGroup } from '@angular/forms';
import { DiacriticsMap } from '../_data';

const sanitationRegex = /[.*+?^${}()|[\]\\]/g;
const sanitationReplace = '\\$&';

/** replaceDiacritics
/* @param {string} source - the source string
/* - replaces every instance of A-Z with the equivalent diacritics
*/
export function replaceDiacritics(source: string): string {
  Object.keys(DiacriticsMap).forEach((key: string) => {
    source = source.replace(new RegExp(`[${DiacriticsMap[key]}]`, 'gi'), key);
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

/** sanitiseSearchTerm
 * incorporates diaritics, escapes regex operators / qualifiers and
 * (conditionally) applies start/end modifiers
 *
 * @param {string} filterString - filter information
 * @returns the string converted to a regex-safe string
 **/
export function sanitiseSearchTerm(filterString: string): string {
  if (
    filterString.length === 0 ||
    filterString.replace(sanitationRegex, '').length === 0
  ) {
    return '';
  }

  const modifierStart = filterString.indexOf('^') === 0;
  const modifierEnd = filterString.indexOf('$') === filterString.length - 1;

  if (modifierStart) {
    filterString = filterString.slice(1);
  }
  if (modifierEnd) {
    filterString = filterString.slice(0, -1);
  }

  let filter = appendDiacriticEquivalents(
    replaceDiacritics(filterString.replace(sanitationRegex, sanitationReplace))
  );

  if (modifierStart && modifierEnd) {
    filter = `^${filter}$|\\^${filter}$|^${filter}\\$|\\^${filter}\\$`;
  } else if (modifierStart) {
    filter = `^${filter}|\\^${filter}`;
  } else if (modifierEnd) {
    filter = `${filter}$|${filter}\\$`;
  }

  return filter;
}

/** filterList
 *
 * @param {string} filterString - filter information
 * @param {Array<T>} filterables - the array to filter
 * @param {string?} filterProp - the object property to filter on
 *
 * @returns filterables filtered by filterString
 **/
export function filterList<T>(
  filterString: string,
  filterables: Array<T>,
  filterProp?: string
): Array<T> {
  if (filterString.length === 0) {
    return filterables;
  }

  let filter = sanitiseSearchTerm(filterString);
  if (filter.length === 0) {
    if (['^', '$'].includes(filterString)) {
      filter = `\\${filterString}`;
    } else {
      return [];
    }
  }

  const reg = new RegExp(filter, 'gi');

  return filterables.filter((filterable: T) => {
    // clear regex indexes with empty exec to prevent bug where "ne" fails to match "Netherlands"
    reg.exec('');

    // filter on the object property or the object
    return (
      !filter || reg.exec(filterProp ? filterable[filterProp] : filterable)
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
  return s
    .split(',')
    .map((part: string) => {
      return part.trim();
    })
    .filter((part: string) => {
      return part.length > 0;
    });
}

export function getFormValueList(
  form: FormGroup,
  field: string
): Array<string> {
  const vals = form.value[field];
  return vals
    ? Object.keys(vals)
        .filter((key: string) => {
          return vals[key];
        })
        .map(fromInputSafeName)
    : [];
}

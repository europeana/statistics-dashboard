import { FormControl } from '@angular/forms';

export const today = new Date().toISOString().split('T')[0];

export const yearZero = new Date(Date.parse('20 Nov 2008 12:00:00 GMT'))
  .toISOString()
  .split('T')[0];

/** dateToUCT
/* @param {Date} localDate
/* @returns creates a UCT date from a local date, adjusted by the local date's offset
*/
export function dateToUCT(localDate: Date): Date {
  const dateUTC = new Date(localDate.toISOString());
  return new Date(dateUTC.getTime() - localDate.getTimezoneOffset() * 60000);
}

/** getDateAsISOString
/* @param {Date} localDate
/* - returns 'yyyy-mm-dd'
*/
export function getDateAsISOString(localDate: Date): string {
  return dateToUCT(localDate).toISOString().split('T')[0];
}

/** validateDateGeneric
/* @param {FormControl} control - the field to validate
/* @param {string} fieldName - the field name
/* - returns an errors object map
*/
export function validateDateGeneric(
  control: FormControl,
  fieldName: string
): { [key: string]: boolean } | null {
  const val = control.value || null;
  let isTooEarly = false;
  let isTooLate = false;
  if (val) {
    const otherField = fieldName === 'dateFrom' ? 'dateTo' : 'dateFrom';
    const dateVal = dateToUCT(new Date(val));

    if (dateVal < new Date(yearZero)) {
      isTooEarly = true;
    } else if (dateVal > dateToUCT(new Date(today))) {
      isTooLate = true;
    } else {
      const otherValue = control.parent.value[otherField];
      if (otherValue && otherValue.length > 0) {
        const dateOtherVal = new Date(otherValue);

        if (otherField === 'dateFrom') {
          if (dateVal < dateOtherVal) {
            isTooEarly = true;
          }
        } else if (dateVal > dateToUCT(dateOtherVal)) {
          isTooLate = true;
        }
      }
    }
  }
  return isTooEarly
    ? { isTooEarly: isTooEarly }
    : isTooLate
    ? { isTooLate: isTooLate }
    : null;
}

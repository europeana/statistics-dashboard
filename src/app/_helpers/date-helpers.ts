import { FormControl, ValidationErrors } from '@angular/forms';

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
): ValidationErrors | null {
  const val = control.value || null;
  if (!val) {
    return null;
  }

  const res: ValidationErrors = {};
  const otherField = fieldName === 'dateFrom' ? 'dateTo' : 'dateFrom';
  const dateVal = dateToUCT(new Date(val));

  const checkEarly = (date1, date2): void => {
    if (date1 < date2) {
      res.isTooEarly = true;
    }
  };

  checkEarly(dateVal, new Date(yearZero));
  if (dateVal > dateToUCT(new Date(today))) {
    res.isTooLate = true;
  } else {
    const otherValue = control.parent.value[otherField];
    if (otherValue && otherValue.length > 0) {
      const dateOtherVal = new Date(otherValue);
      if (otherField === 'dateFrom') {
        checkEarly(dateVal, dateOtherVal);
      } else if (dateVal > dateToUCT(dateOtherVal)) {
        res.isTooLate = true;
      }
    }
  }
  return Object.keys(res).length > 0 ? res : null;
}

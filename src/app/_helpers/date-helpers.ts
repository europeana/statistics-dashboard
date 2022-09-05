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

/** setErrorIfEarly
/* sets 'isTooEarly' on 'errors' if date1 is earlier than date2
/* @param {Date} date1 - a date to compare
/* @param {Date} date2 - a date to compare
/* @param {ValidationErrors} errors - an errors object to write to
/* @returns boolean
*/
function setErrorIfEarly(
  date1: Date,
  date2: Date,
  errors: ValidationErrors
): boolean {
  if (date1 < date2) {
    errors.isTooEarly = true;
  }
  return errors.isTooEarly;
}

/** setErrorIfLate
/* sets 'isTooLate' on errors if date1 is later than date2
/* @param {Date} date1 - a date to compare
/* @param {Date} date2 - a date to compare
/* @param {ValidationErrors} errors - an errors object to write to
/* @returns boolean
*/
function setErrorIfLate(
  date1: Date,
  date2: Date,
  errors: ValidationErrors
): boolean {
  if (date1 > date2) {
    errors.isTooLate = true;
  }
  return errors.isTooLate;
}

/** validateDateGeneric
/* @param {FormControl} control - the field to validate
/* @param {string} fieldName - the field name
/* - returns a ValidationErrors object or null
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
  const dateVal = dateToUCT(new Date(val));

  if (setErrorIfEarly(dateVal, new Date(yearZero), res)) {
    return res;
  }
  if (setErrorIfLate(dateVal, dateToUCT(new Date(today)), res)) {
    return res;
  }

  const otherField = fieldName === 'dateFrom' ? 'dateTo' : 'dateFrom';
  const otherValue = control.parent.value[otherField];

  if (otherValue && otherValue.length > 0) {
    const dateOtherVal = new Date(otherValue);
    if (otherField === 'dateFrom') {
      setErrorIfEarly(dateVal, dateOtherVal, res);
    } else {
      setErrorIfLate(dateVal, dateToUCT(dateOtherVal), res);
    }
  }
  return Object.keys(res).length > 0 ? res : null;
}

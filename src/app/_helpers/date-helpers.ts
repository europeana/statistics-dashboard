import { FormControl } from '@angular/forms';

export const today = new Date().toISOString().split('T')[0];
export const yearZero = new Date(Date.parse('20 Nov 2008 12:00:00 GMT'))
  .toISOString()
  .split('T')[0];

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
    const dateVal = new Date(val);
    if (dateVal < new Date(yearZero)) {
      console.log('less than year zero(' + yearZero + '): ' + dateVal);
      isTooEarly = true;
    } else if (dateVal > new Date(today)) {
      isTooLate = true;
    } else if (control.parent.value[otherField].length > 0) {
      const dateOtherVal = new Date(control.parent.value[otherField]);
      if (otherField === 'dateFrom') {
        if (dateVal < dateOtherVal) {
          console.log('less than year otjer(' + dateOtherVal + '): ' + dateVal);
          isTooEarly = true;
        }
      } else if (dateVal > dateOtherVal) {
        isTooLate = true;
      }
    }
  }
  return isTooEarly
    ? { isTooEarly: isTooEarly }
    : isTooLate
    ? { isTooLate: isTooLate }
    : null;
}

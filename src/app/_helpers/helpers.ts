import { FormGroup } from '@angular/forms';

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

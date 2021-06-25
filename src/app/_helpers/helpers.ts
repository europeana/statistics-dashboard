import { FormGroup } from '@angular/forms';
import { RightsStatements } from '../_data';

export function rightsUrlMatch(url: string): string | null {
  const replaced =
    RightsStatements[
      url
        .replace(/http(s)?:/, '')
        .split('?')[0]
        .replace(/[\/]$/, '')
    ];
  if (replaced) {
    return replaced.split('?')[0].trim();
  }
  return null;
}

export function fromInputSafeName(s: string): string {
  return s.replace(/_____/g, '.');
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

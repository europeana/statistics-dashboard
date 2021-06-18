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

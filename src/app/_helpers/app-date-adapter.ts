import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { getDateAsISOString } from './';

@Injectable()
export class AppDateAdapter extends NativeDateAdapter {
  public static readonly preferredFormat = 'DD/MM/YYYY';

  // used to display dates closed and open
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  format(date: Date, displayFormat: Object): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    if (
      displayFormat === 'input' ||
      displayFormat === AppDateAdapter.preferredFormat
    ) {
      return getDateAsISOString(date).split('-').reverse().join('/');
    }
    return date.toLocaleDateString(this.locale, options);
  }

  // Used when user types date into input
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse(value: any): Date | null {
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const str = value.split('/');
      const year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const date = Number(str[0]);
      return new Date(year, month, date);
    }
    return null;
  }
}

import { ElementRef, Injectable } from '@angular/core';
import { TableRow } from '../_models';

@Injectable({ providedIn: 'root' })
export class ExportCSVService {
  csvFromTableRows(headers: Array<string>, rows: Array<TableRow>): string {
    const replacer = (_: string, value: string): string => {
      return value ?? '';
    };

    const csv = rows.map((row: TableRow) => {
      const vals: Array<string> = headers.map((fieldName: string) => {
        return JSON.stringify(row[fieldName], replacer);
      });
      return vals.join(',');
    });
    csv.unshift(headers.join(','));
    return csv.join('\r\n');
  }

  async download(data: string, downloadAnchor: ElementRef): Promise<void> {
    const url = window.URL.createObjectURL(
      new Blob([data], { type: 'text/csv;charset=utf-8' })
    );
    const link = downloadAnchor.nativeElement;
    link.href = url;
    link.download = 'data.csv';
    link.click();
    const fn = (): void => {
      window.URL.revokeObjectURL(url);
    };
    fn();
  }
}

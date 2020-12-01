import { ElementRef } from '@angular/core';
import { HeaderNameType, TableRow } from '../_models';

export class MockExportCSVService {
  csvFromTableRows(_: Array<HeaderNameType>, __: Array<TableRow>): string {
    return 'XXX';
  }
  download(_: string, __: ElementRef): void {}
}

import { ElementRef } from '@angular/core';
import { FmtTableData } from '../_models';

export class MockExportPDFService {
  getChartAsImageUrl(_: ElementRef<any>, __: ElementRef<any>): Promise<string> {
    return new Promise((resolve) => {
      resolve('img-as-url-data');
    }) as Promise<string>;
  }

  download(_: FmtTableData, __: string): void {}
}

import { ElementRef } from '@angular/core';
import { FmtTableData } from '../_models';

export class MockExportPDFService {
  getChartAsImageUrl(
    _: ElementRef<HTMLElement>,
    __: ElementRef<HTMLElement>
  ): Promise<string> {
    return new Promise((resolve) => {
      resolve('img-as-url-data');
    }) as Promise<string>;
  }

  download(_: FmtTableData, __: string): void {
    console.log('mock download');
  }
}

import { ElementRef } from '@angular/core';
import { FmtTableData } from '../_models';

export class MockExportPDFService {
  static imgDataURL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCA' +
    'YAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5' +
    'ErkJggg==';

  getChartAsImageUrl(
    _: ElementRef<HTMLElement>,
    __: ElementRef<HTMLElement>
  ): Promise<string> {
    return new Promise((resolve) => {
      resolve(MockExportPDFService.imgDataURL);
    }) as Promise<string>;
  }

  download(_: FmtTableData, __: string): void {
    console.log('mock download');
  }
}

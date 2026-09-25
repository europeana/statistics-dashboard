import { Component, forwardRef, input } from '@angular/core';
import { BarComponent } from '../chart';
import { IdValue } from '../_models';

@Component({
  selector: 'app-bar-chart',
  template: '',
  standalone: true,
  providers: [
    {
      provide: BarComponent,
      useExisting: forwardRef(() => MockBarComponent)
    }
  ]
})
export class MockBarComponent {
  colours = input<string[]>();
  extraSettings = input<Record<string, boolean | number | string>>();
  results = input<IdValue[]>();

  public chartId = 'mockBarChart';
  public maxNumberBars = 10;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeAllSeries(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngAfterViewInit(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addSeries(_seriesData: IdValue[]): void {}

  getSvgData(): Promise<string> {
    return Promise.resolve('mock-svg-string');
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  drawChart(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  zoomTop(): void {}
}

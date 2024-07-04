import { Component, Input } from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ChartSettings, ColourSeriesData } from '../_models';

@Component({
  standalone: true,
  selector: 'app-bar-chart',
  template: ''
})
export class MockBarComponent {
  readonly maxNumberBars = 50;

  @Input() showPercent: boolean;
  @Input() extraSettings: ChartSettings;

  browserOnly(_: () => void): void {
    // mock browserOnly
  }

  ngAfterViewInit(): void {
    // mock ngAfterViewInit
  }

  addSeriesFromResult(): void {
    // mock addSeriesFromResult
  }

  toggleCtrls(): void {
    // mock toggleCtrls
  }

  removeSeries(_: string): void {
    // mock removeSeries
  }

  removeAllSeries(): void {
    // mock removeAllSeries
  }

  addSeries(_: Array<ColourSeriesData>): void {
    // mock addSeries
  }

  createSeries(_: Array<string>, __ = 'value'): am4charts.ColumnSeries {
    return {} as unknown as am4charts.ColumnSeries;
  }

  zoomTop(): void {
    // mock zoomTop
  }

  getSvgData(): Promise<string> {
    return new Promise((resolve) => {
      resolve('svg');
    });
  }

  drawChart(): void {
    // mock drawChart
  }
}

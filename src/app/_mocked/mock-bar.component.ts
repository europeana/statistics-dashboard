import { Component } from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ColourSeriesData } from '../_models';

@Component({
  selector: 'app-bar-chart',
  template: ''
})
export class MockBarComponent {
  readonly maxNumberBars = 50;

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

  addLegend(_: am4charts.ColumnSeries): void {
    // mock addLegend
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

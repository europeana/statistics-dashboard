import { Component } from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ColourSeriesData } from '../_models';

@Component({
  selector: 'app-bar-chart',
  template: ''
})
export class MockBarComponent {
  readonly maxNumberBars = 50;

  constructor() {
    console.log('create mock bar');
  }

  browserOnly(_: () => void): void {
    console.log('MockBarComponent.browserOnly');
  }

  ngAfterViewInit(): void {
    console.log('MockBarComponent.ngAfterViewInit');
  }

  addSeriesFromResult(): void {
    console.log('MockBarComponent.addSeriesFromResult');
  }

  toggleCtrls(): void {
    console.log('MockBarComponent.toggleCtrls');
  }

  addLegend(_: am4charts.ColumnSeries): void {
    console.log('MockBarComponent.addLegend');
  }

  removeSeries(_: string): void {
    console.log('MockBarComponent.removeSeries');
  }

  removeAllSeries(): void {
    console.log('MockBarComponent.removeAllSeries');
  }

  addSeries(_: Array<ColourSeriesData>): void {
    console.log('MockBarComponent.addSeries');
  }

  createSeries(_: Array<string>, __ = 'value'): am4charts.ColumnSeries {
    return {} as unknown as am4charts.ColumnSeries;
  }

  zoomTop(): void {
    console.log('MockBarComponent.zoomTop');
  }

  getSvgData(): Promise<string> {
    return new Promise((resolve) => {
      resolve('svg');
    });
  }

  drawChart(): void {
    console.log('MockBarComponent.drawChart');
  }
}

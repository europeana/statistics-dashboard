import { Component } from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import { SeriesValueNames } from '../_models';

@Component({
  standalone: true,
  selector: 'app-line-chart',
  template: ''
})
export class MockLineComponent {
  allSeries: { [key: string]: am4charts.LineSeries } = {};

  addSeries(_, __, ___, ____, _____): void {
    console.log('MockLineComponent addSeries');
  }

  removeSeries(_: string): void {
    console.log('MockLineComponent removeSeries');
  }

  showRange(
    _: string,
    __: SeriesValueNames,
    ___: number,
    ____: am4core.Color
  ): void {
    console.log('MockLineComponent showRange');
  }

  hideRange(_: string, __: number): void {
    console.log('MockLineComponent hideRange');
  }

  hideSeries(_: string): void {
    console.log('MockLineComponent hideSeries');
  }
}

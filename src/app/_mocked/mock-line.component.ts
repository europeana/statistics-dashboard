import { Component, Input } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';

import { IHash, IHashArray, TargetFieldName, TargetMetaData } from '../_models';

@Component({
  standalone: true,
  selector: 'app-line-chart',
  template: ''
})
export class MockLineComponent {
  @Input() targetMetaData: IHash<IHashArray<TargetMetaData>>;

  addSeries(_, __, ___, ____, _____): void {
    console.log('MockLineComponent addSeries');
  }

  removeSeries(_: string): void {
    console.log('MockLineComponent removeSeries');
  }

  showRange(
    _: string,
    __: TargetFieldName,
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

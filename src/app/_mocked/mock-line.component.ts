import { Component, Input } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import { IHash, IHashArray, TargetFieldName, TargetMetaData } from '../_models';

const mockTargetMetaData = {
  AT: {
    three_d: [],
    hq: [],
    total: []
  },
  DE: {
    three_d: [],
    hq: [],
    total: []
  },
  FR: {
    three_d: [],
    hq: [],
    total: []
  }
};

class MockSeries {
  isHidden = false;

  hide(): void {
    this.isHidden = true;
  }

  show(): void {
    this.isHidden = false;
  }
}

@Component({
  standalone: true,
  selector: 'app-line-chart',
  template: ''
})
export class MockLineComponent {
  @Input() targetMetaData: IHash<IHashArray<TargetMetaData>> =
    mockTargetMetaData;

  allSeriesData = ['FR', 'DE'].reduce((ob, code: string) => {
    [
      TargetFieldName.THREE_D,
      TargetFieldName.HQ,
      TargetFieldName.TOTAL
    ].forEach((fName: TargetFieldName) => {
      ob[`${code}${fName}`] = new MockSeries();
    });
    return ob;
  }, {}) as unknown as IHash<am4charts.LineSeries>;

  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;

  _colours = [
    am4core.color('#000'),
    am4core.color('#FFF'),
    am4core.color('#111')
  ];

  chart = {
    colors: {
      getIndex: (i: number): am4core.Color => {
        return this._colours[i];
      },
      reset: (): void => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      },
      list: this._colours,
      next: () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }
    }
  } as unknown as am4charts.XYChart;
  dateAxis: am4charts.DateAxis;

  ngAfterViewInit(): void {
    console.log('MockLineComponent ngAfterViewInit');
  }

  addSeries(_, __, ___, ____, _____): void {
    console.log('MockLineComponent addSeries');
  }

  removeRange(_: string, __?: string, ___?: number): void {
    console.log('MockLineComponent removeRange');
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

  toggleCursor(): void {
    console.log('MockLineComponent toggleCursor');
  }

  toggleGridlines(): void {
    console.log('MockLineComponent toggleGridlines');
  }
}

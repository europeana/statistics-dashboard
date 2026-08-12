import { Component, input } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import { IHash, IHashArray, TargetFieldName, TargetMetaData } from '../_models';

const mockTargetMetaData = {
  AT: {
    three_d: [],
    high_quality: [],
    total: []
  },
  DE: {
    three_d: [],
    high_quality: [],
    total: []
  },
  FR: {
    three_d: [],
    high_quality: [],
    total: []
  }
};

class MockSeries {
  isHidden = false;
  fill: am4core.Color;

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
  targetMetaData = input<IHash<IHashArray<TargetMetaData>>>(mockTargetMetaData);
  allSeriesData = ['FR', 'DE'].reduce((ob, code: string) => {
    [
      TargetFieldName.THREE_D,
      TargetFieldName.HQ,
      TargetFieldName.TOTAL
    ].forEach((fName: TargetFieldName) => {
      const series = new MockSeries();
      series.fill = am4core.color('#fff');
      ob[`${code}${fName}`] = series;
    });
    return ob;
  }, {} as Record<string, MockSeries>) as unknown as IHash<am4charts.LineSeries>;

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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      reset: (): void => {},
      list: this._colours,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      next: () => {}
    },
    invalidateData(): void {
      console.log('MockLineComponent chart.invalidateData');
    },
    invalidateRawData(): void {
      console.log('MockLineComponent chart.invalidateRawData');
    }
  } as unknown as am4charts.XYChart;
  dateAxis: am4charts.DateAxis;

  ngAfterViewInit(): void {
    console.log('MockLineComponent ngAfterViewInit');
  }

  addSeries(
    _: unknown,
    __: unknown,
    ___: unknown,
    ____: unknown,
    _____: unknown
  ): void {
    console.log('MockLineComponent addSeries');
  }

  addSeriesData(_: unknown, __: unknown, ___: unknown): void {
    console.log('MockLineComponent addSeriesData');
  }

  removeRange(
    country: string,
    specificValueName?: string,
    specificIndex?: number
  ): IHash<IHash<Array<number>>> {
    const res: Record<string, unknown> = {};
    if (specificValueName) {
      res[specificValueName] = {};
      res[country] = [specificIndex];
    }
    return res as unknown as IHash<IHash<Array<number>>>;
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

  enableAxes(): void {
    console.log('MockLineComponent enableAxes');
  }

  hideRange(_: string, __: number): void {
    console.log('MockLineComponent hideRange');
  }

  sortSeriesData(_: unknown): void {
    console.log('MockLineComponent sortSeriesData');
  }

  toggleCursor(): void {
    console.log('MockLineComponent toggleCursor');
  }
}

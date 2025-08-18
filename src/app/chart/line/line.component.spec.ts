import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import { TargetFieldName, TargetMetaData } from '../../_models';
import { LineComponent } from './line.component';

describe('LineComponent', () => {
  let component: LineComponent;
  let fixture: ComponentFixture<LineComponent>;

  const mockTargetMetaData = {
    DE: {
      three_d: [
        {
          isInterim: true,
          targetYear: 2025,
          value: 1
        } as TargetMetaData
      ],
      high_quality: [
        {
          isInterim: true,
          targetYear: 2025,
          value: 2
        } as TargetMetaData
      ],
      total: []
    },
    FR: {
      three_d: []
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LineComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable the axes', () => {
    component.valueAxis.disabled = true;
    component.dateAxis.disabled = true;
    component.addSeries('My Series', 'myVal', TargetFieldName.HQ, [
      {
        date: '14/12/2001',
        three_d: '12',
        total: '40',
        high_quality: '10'
      }
    ]);

    expect(component.valueAxis.disabled).toBeTruthy();
    expect(component.dateAxis.disabled).toBeTruthy();

    component.enableAxes();

    expect(component.valueAxis.disabled).toBeFalsy();
    expect(component.dateAxis.disabled).toBeFalsy();
  });

  it('should remove the range', () => {
    component.targetMetaData = structuredClone(mockTargetMetaData);

    const deData = component.targetMetaData['DE'];

    Object.keys(deData).forEach((key: string) => {
      deData[key].forEach((ob: TargetMetaData) => {
        ob.range = {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          dispose: () => {}
        } as unknown as am4charts.ValueAxisDataItem;
      });
    });

    const spyRemoveValue = jest.spyOn(
      component.valueAxis.axisRanges,
      'removeValue'
    );

    component.removeRange('DE', TargetFieldName.HQ);
    expect(spyRemoveValue).toHaveBeenCalledTimes(1);

    component.removeRange('DE');
    expect(spyRemoveValue).toHaveBeenCalledTimes(2);

    component.removeRange('DE', TargetFieldName.HQ);
    expect(spyRemoveValue).toHaveBeenCalledTimes(2);
  });

  it('should show the range', () => {
    const paddingRight = component.chart.paddingRight as number;
    component.targetMetaData = structuredClone(mockTargetMetaData);
    component.showRange('DE', TargetFieldName.HQ, 0, am4core.color('#0c529c'));
    expect(component.chart.paddingRight as number).toBeGreaterThan(
      paddingRight
    );
  });

  it('should create the range', () => {
    const data = structuredClone(mockTargetMetaData);
    expect((data as unknown as TargetMetaData).range).toBeFalsy();
    component.createRange(
      data as unknown as TargetMetaData,
      am4core.color('#0c529c')
    );
    expect((data as unknown as TargetMetaData).range).toBeTruthy();
  });

  it('should add the series', () => {
    component.chart.data = [];
    expect(component.allSeriesData['myVal']).toBeFalsy();
    component.addSeries('My Series', 'myVal', TargetFieldName.HQ, [
      {
        date: '14/12/2001',
        three_d: '12',
        total: '40',
        high_quality: '10'
      }
    ]);
    expect(component.allSeriesData['myVal']).toBeTruthy();
    expect(component.chart.data.length).toBeTruthy();
  });

  it('should add the series data', () => {
    const country = 'DE';
    const date = new Date().toISOString();
    const seriesData = [
      {
        three_d: '1',
        high_quality: '2',
        total: '5',
        date: `${date}`
      }
    ];
    component.chart.data = [];
    component.chart.invalidateData = jest.fn();
    component.addSeriesData(country, TargetFieldName.THREE_D, seriesData);
    expect(Object.keys(component.chart.data).length).toBeGreaterThan(0);
    expect(component.chart.invalidateData).not.toHaveBeenCalled();
  });

  it('should sort the series data', () => {
    const date = new Date();
    const date2 = new Date();
    const date3 = new Date();
    date2.setDate(date.getDate() - 1);
    date3.setDate(date.getDate() + 1);

    const data = [date3, date2, date, date, date3].map((dateVal: Date) => {
      return {
        three_d: '3',
        high_quality: '2',
        total: '1',
        date: `${dateVal}`
      };
    });

    component.sortSeriesData(data);

    expect(data[0].date).toEqual(`${date3}`);
    expect(data[1].date).toEqual(`${date3}`);
    expect(data[2].date).toEqual(`${date}`);
    expect(data[3].date).toEqual(`${date}`);
    expect(data[4].date).toEqual(`${date2}`);
  });

  it('should toggle the scrollbar', () => {
    expect(component.chart.scrollbarX).toBeFalsy();
    component.toggleScrollbar();
    expect(component.chart.scrollbarX).toBeTruthy();
    component.toggleScrollbar();
    expect(component.chart.scrollbarX).toBeFalsy();
  });
});

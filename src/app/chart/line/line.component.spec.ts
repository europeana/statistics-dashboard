import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import { IHash, TargetFieldName, TargetMetaData } from '../../_models';

import { LineComponent } from './line.component';

describe('LineComponent', () => {
  let component: LineComponent;
  let fixture: ComponentFixture<LineComponent>;

  const mockTargetMetaData = {
    DE: {
      three_d: [
        {
          interim: true,
          label: '2025',
          value: 1
        } as TargetMetaData
      ],
      hq: [
        {
          interim: true,
          label: '2025',
          value: 2
        } as TargetMetaData
      ]
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

  it('should remove the range', () => {
    component.targetMetaData = mockTargetMetaData;

    spyOn(component.valueAxis.axisRanges, 'removeValue');

    component.removeRange('DE');
    expect(component.valueAxis.axisRanges.removeValue).toHaveBeenCalledTimes(2);

    component.removeRange('DE', TargetFieldName.HQ);
    expect(component.valueAxis.axisRanges.removeValue).toHaveBeenCalledTimes(3);

    component.removeRange('DE', TargetFieldName.HQ, 1);
    expect(component.valueAxis.axisRanges.removeValue).toHaveBeenCalledTimes(3);
  });

  it('should show the range', () => {
    const paddingRight = component.chart.paddingRight as number;
    component.targetMetaData = mockTargetMetaData;
    component.showRange('DE', TargetFieldName.HQ, 0, am4core.color('#0c529c'));
    expect(component.chart.paddingRight as number).toBeGreaterThan(
      paddingRight
    );
  });

  it('should create the range', () => {
    expect((mockTargetMetaData as unknown as TargetMetaData).range).toBeFalsy();
    component.createRange(
      mockTargetMetaData as unknown as TargetMetaData,
      am4core.color('#0c529c')
    );
    expect(
      (mockTargetMetaData as unknown as TargetMetaData).range
    ).toBeTruthy();
  });

  it('should add the series', () => {
    component.chart.data = [];
    expect(component.allSeriesData['myVal']).toBeFalsy();
    component.addSeries('My Series', 'myVal', TargetFieldName.HQ, [
      {
        date: '14/12/2001',
        label: 'xxx',
        three_d: '12',
        hq: '10'
      }
    ]);
    expect(component.allSeriesData['myVal']).toBeTruthy();
    expect(component.chart.data.length).toBeTruthy();
  });

  it('should toggle the grid lines', () => {
    expect(component.valueAxis.renderer.grid.template.disabled).toBeTruthy();
    component.toggleGridlines();
    expect(component.valueAxis.renderer.grid.template.disabled).toBeFalsy();
    component.toggleGridlines();
    expect(component.valueAxis.renderer.grid.template.disabled).toBeTruthy();
  });

  it('should toggle the cursor', () => {
    expect(component.chart.cursor).toBeFalsy();
    component.toggleCursor();
    expect(component.chart.cursor).toBeTruthy();
    component.toggleCursor();
    expect(component.chart.cursor).toBeFalsy();
  });

  it('should toggle the scrollbar', () => {
    expect(component.chart.scrollbarX).toBeFalsy();
    component.toggleScrollbar();
    expect(component.chart.scrollbarX).toBeTruthy();
    component.toggleScrollbar();
    expect(component.chart.scrollbarX).toBeFalsy();
  });
});

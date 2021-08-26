import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import * as am4charts from '@amcharts/amcharts4/charts';
import { BarComponent } from './bar.component';

describe('BarComponent', () => {
  let component: BarComponent;
  let fixture: ComponentFixture<BarComponent>;
  const testResults = [
    {
      name: 'Name 1',
      value: 1
    },
    {
      name: 'Name 2',
      value: 2
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BarComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarComponent);
    component = fixture.componentInstance;
    component.results = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a legend', () => {
    expect(component.legendContainer).toBeFalsy();
    component.settings.chartLegend = true;
    component.addLegend();
    expect(component.legendContainer).toBeTruthy();
    component.addLegend();
    expect(component.legendContainer).toBeTruthy();
  });

  it('should add a series', fakeAsync(() => {
    const series = [
      {
        colour: '#FF0000',
        seriesName: 'x',
        data: {
          A: 1,
          B: 2
        }
      }
    ];

    spyOn(component.categoryAxis, 'zoomToIndexes');
    component.addSeries(series);
    expect(component.categoryAxis.zoomToIndexes).not.toHaveBeenCalled();
    component.preferredNumberBars = 1;
    component.addSeries([series[0], series[0]]);

    component.allSeries['x'].dispatchImmediately('ready');

    tick(1);

    expect(component.categoryAxis.zoomToIndexes).toHaveBeenCalled();
  }));

  it('should add a series from a result', () => {
    spyOn(component, 'addSeries');
    component.addSeriesFromResult();
    expect(component.addSeries).toHaveBeenCalledTimes(1);
    component._results = null;
    component.addSeriesFromResult();
    expect(component.addSeries).toHaveBeenCalledTimes(1);

    component._results = testResults;
    component.addSeriesFromResult();
    expect(component.addSeries).toHaveBeenCalledTimes(2);
  });

  it('should zoom to the top entries', () => {
    spyOn(component.categoryAxis, 'zoomToIndexes');
    component.zoomTop();
    expect(component.categoryAxis.zoomToIndexes).not.toHaveBeenCalled();
    component._results = testResults;
    component.preferredNumberBars = 1;
    component.zoomTop();
    expect(component.categoryAxis.zoomToIndexes).toHaveBeenCalled();
  });

  it('should get the SVG data', () => {
    expect(component.getSvgData()).toBeTruthy();
  });

  it('should remove all series', () => {
    component.allSeries = {
      x: {} as unknown as am4charts.ColumnSeries,
      y: {} as unknown as am4charts.ColumnSeries
    };
    expect(component.allSeries.x).toBeTruthy();
    expect(component.allSeries.y).toBeTruthy();
    component.removeAllSeries();
    expect(component.allSeries.x).toBeFalsy();
    expect(component.allSeries.y).toBeFalsy();
  });

  it('should remove individual series', () => {
    component.allSeries = { x: {} as unknown as am4charts.ColumnSeries };
    expect(component.allSeries.x).toBeTruthy();
    component.removeSeries('y');
    expect(component.allSeries.x).toBeTruthy();
    component.removeSeries('x');
    expect(component.allSeries.x).toBeFalsy();
  });

  it('should take extra settings', () => {
    expect(component.settings.prefixValueAxis).toBeFalsy();
    component.extraSettings = { configurable: false, prefixValueAxis: 'Test' };
    expect(component.settings.prefixValueAxis).toBeTruthy();
  });

  it('should toggle the controls', () => {
    expect(component.settings.ctrlsOpen).toBeFalsy();
    component.toggleCtrls();
    expect(component.settings.ctrlsOpen).toBeTruthy();
  });
});

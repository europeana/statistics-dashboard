import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BarComponent],
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

  it('should create a series', () => {
    component.settings.isHorizontal = true;
    const seriesH = component.createSeries('#000');
    expect(seriesH).toBeTruthy();
    expect(seriesH.dataFields.valueX).toBeTruthy();
    expect(seriesH.dataFields.valueY).toBeFalsy();

    component.settings.isHorizontal = false;
    const seriesY = component.createSeries('#FFF');
    expect(seriesY).toBeTruthy();
    expect(seriesY.dataFields.valueX).toBeFalsy();
    expect(seriesY.dataFields.valueY).toBeTruthy();
  });

  it('should add tooltips to the series', () => {
    const seriesAbs = component.createSeries('#000');
    expect(seriesAbs.columns.template.tooltipText).not.toContain('%');

    component.showPercent = true;

    const seriesPct = component.createSeries('#000');
    expect(seriesPct.columns.template.tooltipText).toContain('%');
  });

  it('should format the numbers', () => {
    component.drawChart();
    expect(component.valueAxis.numberFormatter.numberFormat).toEqual('#.0a');
    component.showPercent = true;
    component.drawChart();
    expect(component.valueAxis.numberFormatter.numberFormat).toEqual('#.');
  });

  it('should add a series', () => {
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
    const seriesCount = Object.keys(component.allSeries).length;
    component.addSeries(series);
    expect(Object.keys(component.allSeries).length).toEqual(seriesCount + 1);
    component.addSeries(series);
    expect(Object.keys(component.allSeries).length).toEqual(seriesCount + 1);
    component.settings.isHorizontal = false;
    component.drawChart(1);
    fixture.detectChanges();
    expect(Object.keys(component.allSeries).length).toEqual(seriesCount + 1);
  });

  it('should add a series from a result', () => {
    const spyAddSeries = jest.spyOn(component, 'addSeries');
    component.addSeriesFromResult();
    expect(spyAddSeries).toHaveBeenCalledTimes(1);
    component.results = null;
    component.addSeriesFromResult();
    expect(spyAddSeries).toHaveBeenCalledTimes(1);

    component.results = testResults;
    component.addSeriesFromResult();
    expect(spyAddSeries).toHaveBeenCalledTimes(2);
  });

  it('should detect zoomabability', () => {
    component.results = testResults;
    expect(component.isZoomable()).toBeFalsy();
    component.addSeriesFromResult();
    expect(component.isZoomable()).toBeFalsy();
    component.preferredNumberBars = 1;
    component.addSeriesFromResult();
    expect(component.isZoomable()).toBeTruthy();
  });

  it('should add an axis break', () => {
    expect(component.valueAxis.axisBreaks.length).toEqual(0);
    component.addAxisBreak(0, 100);
    expect(component.valueAxis.axisBreaks.length).toBeGreaterThan(0);
  });

  it('should add an axis break if zoomability is high', () => {
    const spyAddAxisBreak = jest.spyOn(component, 'addAxisBreak');
    component.preferredNumberBars = 1;
    component.results = testResults;
    component.addSeriesFromResult();
    expect(component.isZoomable()).toBeTruthy();
    expect(component.addAxisBreak).not.toHaveBeenCalled();

    component.preferredNumberBars = 100;
    component.maxBarSizeRelativeRatio = 0.1;
    component.addSeriesFromResult();
    expect(spyAddAxisBreak).toHaveBeenCalled();
  });

  it('should round up numbers', () => {
    expect(component.roundUpNumber(0)).toEqual(0);
    expect(component.roundUpNumber(4)).toEqual(10);
    expect(component.roundUpNumber(9)).toEqual(10);
    expect(component.roundUpNumber(109)).toEqual(110);
    expect(component.roundUpNumber(705)).toEqual(710);
    expect(component.roundUpNumber(795)).toEqual(800);
    expect(component.roundUpNumber(550)).toEqual(550);
    expect(component.roundUpNumber(5001)).toEqual(5010);
    expect(component.roundUpNumber(40001)).toEqual(40010);
    expect(component.roundUpNumber(28021318)).toEqual(28021320);
  });

  it('should zoom to the top entries', fakeAsync(() => {
    component.results = testResults;
    component.addSeriesFromResult();

    const spyZoomToIndexes = jest.spyOn(
      component.categoryAxis,
      'zoomToIndexes'
    );
    component.zoomTop();
    tick(100);
    expect(component.categoryAxis.zoomToIndexes).not.toHaveBeenCalled();

    component.results = testResults;
    component.preferredNumberBars = 1;
    component.zoomTop();
    tick(100);
    expect(spyZoomToIndexes).toHaveBeenCalled();
  }));

  it('should get the extra setting', () => {
    expect(component.extraSettings).toBeTruthy();
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

    component.results = testResults;
    component.addSeriesFromResult();
    expect(component.allSeries.seriesKey).toBeTruthy();
    component.removeSeries('seriesKey');
    expect(component.allSeries.seriesKey).toBeFalsy();
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

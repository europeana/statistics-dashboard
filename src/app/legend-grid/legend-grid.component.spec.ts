import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';

import * as am4charts from '@amcharts/amcharts4/charts';

import { MockLineComponent } from '../_mocked';
import {
  TargetCountryData,
  TargetFieldName,
  TargetSeriesSuffixes
} from '../_models';
import { LineComponent } from '../chart';
import { LegendGridComponent } from '.';

const mockTargetMetaData = {
  DE: {
    three_d: [],
    high_quality: []
  },
  FR: {
    three_d: []
  }
};

describe('LegendGridComponent', () => {
  let component: LegendGridComponent;
  let fixture: ComponentFixture<LegendGridComponent>;

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      imports: [LegendGridComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(LegendGridComponent, {
        remove: { imports: [LineComponent] },
        add: { imports: [MockLineComponent] }
      })
      .compileComponents();
  };

  beforeEach(waitForAsync(() => {
    configureTestBed();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendGridComponent);
    component = fixture.componentInstance;
    component.lineChart = new MockLineComponent() as unknown as LineComponent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the series set', () => {
    const showSpy = jasmine.createSpy();
    spyOn(component, 'togglePin');

    component.hiddenSeriesSetData[0] = {
      Italy: {
        show: showSpy
      } as unknown as am4charts.LineSeries
    };

    component.showSeriesSet(0);
    expect(showSpy).toHaveBeenCalled();
    expect(component.togglePin).toHaveBeenCalled();
  });

  it('should hide the series set', () => {
    const hideSpy = jasmine.createSpy();

    spyOn(component, 'togglePin');

    component.hideSeriesSet(0);

    expect(hideSpy).not.toHaveBeenCalled();
    expect(component.togglePin).not.toHaveBeenCalled();

    component.pinnedCountries['FR'] = 12;

    const setData = (indexes: Array<number>): void => {
      TargetSeriesSuffixes.forEach((suffix: string, suffixIndex: number) => {
        component.lineChart.allSeriesData['FR' + suffix] = !indexes.includes(
          suffixIndex
        )
          ? undefined
          : ({
              hide: hideSpy
            } as unknown as am4charts.LineSeries);
      });
    };
    setData([0, 1]);

    component.hideSeriesSet(0);
    expect(hideSpy).toHaveBeenCalled();
    expect(component.togglePin).not.toHaveBeenCalled();

    setData([0]);
    component.hideSeriesSet(0);
    expect(hideSpy).toHaveBeenCalledTimes(2);
    expect(component.togglePin).toHaveBeenCalled();
  });

  it('should get the enabled columns', () => {
    expect(component.columnsEnabledCount).toEqual(3);

    component.columnEnabled3D = false;
    expect(component.columnsEnabledCount).toEqual(2);
    component.columnEnabledHQ = false;
    expect(component.columnsEnabledCount).toEqual(1);
    component.columnEnabledALL = false;
    expect(component.columnsEnabledCount).toEqual(0);

    component.columnEnabled3D = true;
    expect(component.columnsEnabledCount).toEqual(1);
    component.columnEnabledHQ = true;
    expect(component.columnsEnabledCount).toEqual(2);
    component.columnEnabledALL = true;
    expect(component.columnsEnabledCount).toEqual(3);
  });

  it('should get the country series', () => {
    component.targetMetaData = mockTargetMetaData;

    expect(component.getCountrySeries('FR')).toBeTruthy();
    expect(component.getCountrySeries('FR').length).toBeGreaterThan(0);
  });

  it('should toggle the pin', () => {
    component.targetMetaData = mockTargetMetaData;
    component.pinnedCountries = { AU: 0, DE: 1, FR: 2 };

    component.togglePin('AU');
    fixture.detectChanges();

    expect(component.pinnedCountries['DE']).toEqual(0);
    expect(component.pinnedCountries['FR']).toEqual(1);
    expect(Object.keys(component.pinnedCountries).length).toEqual(2);

    component.togglePin('DE');

    expect(component.pinnedCountries['FR']).toEqual(0);
    expect(Object.keys(component.pinnedCountries).length).toEqual(1);

    // order check

    component.togglePin('DE');
    component.togglePin('AU');

    let countries = Object.keys(component.pinnedCountries);

    expect(countries[0]).toEqual('FR');
    expect(countries[1]).toEqual('DE');
    expect(countries[2]).toEqual('AU');

    const sortSequence = ['TOP', 'DE', 'AU', 'FR'];

    component.togglePin('TOP', false, sortSequence);
    countries = Object.keys(component.pinnedCountries);

    sortSequence.forEach((item: string, index: number) => {
      expect(countries[index]).toEqual(item);
    });
  });

  it('should handle scrolling', () => {
    spyOn(component.legendGrid.nativeElement.classList, 'toggle');
    component.gridScroll();
    expect(
      component.legendGrid.nativeElement.classList.toggle
    ).toHaveBeenCalled();
  });

  it('should hide ranges by column', () => {
    component.targetMetaData = mockTargetMetaData;
    component.countryCode = 'FR';
    component.pinnedCountries = { FR: 0 };
    expect(Object.keys(component.hiddenColumnRanges).length).toBeFalsy();
    component.hideRangesByColumn(TargetFieldName.THREE_D);
    expect(Object.keys(component.hiddenColumnRanges).length).toBeTruthy();
    component.hideRangesByColumn(TargetFieldName.TOTAL);
    expect(Object.keys(component.hiddenColumnRanges).length).toBeTruthy();
  });

  it('should show ranges by column', () => {
    component.targetMetaData = mockTargetMetaData;
    component.countryCode = 'FR';
    component.pinnedCountries = { FR: 0 };
    component.hiddenColumnRanges = { THREE_D: { FR: [0] }, HQ: { FR: [0] } };
    component.lineChart.allSeriesData['FR' + '3D'] = {
      fill: 'xxx',
      hide: jasmine.createSpy()
    } as unknown as am4charts.LineSeries;

    expect(Object.keys(component.hiddenColumnRanges).length).toEqual(2);
    component.showHiddenRangesByColumn(TargetFieldName.THREE_D);
    expect(Object.keys(component.hiddenColumnRanges).length).toEqual(1);
    component.showHiddenRangesByColumn();
    expect(Object.keys(component.hiddenColumnRanges).length).toEqual(0);
  });

  it('should toggle the range', () => {
    const colour = component.lineChart.chart.colors.list[0];

    spyOn(component.lineChart, 'showRange');
    spyOn(component.lineChart, 'removeRange');

    component.toggleRange('FR', TargetFieldName.THREE_D, 0);

    expect(component.lineChart.removeRange).toHaveBeenCalled();
    expect(component.lineChart.showRange).not.toHaveBeenCalled();

    component.toggleRange('FR', TargetFieldName.THREE_D, 0, colour);

    expect(component.lineChart.showRange).toHaveBeenCalled();
  });

  it('should addSeriesSetAndPin', () => {
    component.targetMetaData = mockTargetMetaData;
    spyOn(component.lineChart, 'addSeries');
    component.addSeriesSetAndPin(
      'FR',
      mockTargetMetaData['FR'][TargetFieldName.THREE_D],
      [TargetFieldName.THREE_D]
    );
    expect(component.lineChart.addSeries).toHaveBeenCalledTimes(1);
  });

  it('should toggle the country', () => {
    component.targetMetaData = mockTargetMetaData;

    spyOn(component, 'togglePin');
    spyOn(component, 'addSeriesSetAndPin');
    spyOn(component.onLoadHistory, 'emit').and.callFake(
      (req: { fnCallback: (result: Array<TargetCountryData>) => void }) => {
        component.countryData = { DE: [] };
        req.fnCallback([]);
      }
    );

    component.toggleCountry('FR');
    expect(component.togglePin).toHaveBeenCalled();

    component.toggleCountry('FR');
    expect(component.togglePin).toHaveBeenCalledTimes(2);

    component.toggleCountry('DE');
    expect(component.togglePin).toHaveBeenCalledTimes(3);

    expect(component.onLoadHistory.emit).not.toHaveBeenCalled();
    expect(component.addSeriesSetAndPin).not.toHaveBeenCalled();

    spyOn(component, 'getCountrySeries').and.callFake(() => {
      return [];
    });
    component.toggleCountry('DE');

    expect(component.togglePin).toHaveBeenCalledTimes(3);
    expect(component.addSeriesSetAndPin).toHaveBeenCalled();
    expect(component.onLoadHistory.emit).toHaveBeenCalled();
  });

  it('should toggle the series', () => {
    const date = new Date().toISOString();
    component.countryData = {
      FR: [],
      DE: [date, date, date].map((date) => {
        return {
          date: date,
          three_d: '100',
          high_quality: '200',
          total: '300'
        };
      })
    };

    const seriesItemHidden = {
      isHidden: true,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      show: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hide: () => {}
    } as unknown as am4charts.LineSeries;

    const seriesItemShowing = {
      ...seriesItemHidden,
      isHidden: false
    } as unknown as am4charts.LineSeries;

    spyOn(component, 'togglePin');
    spyOn(component.lineChart, 'addSeries');
    spyOn(component, 'loadCountryChartData');

    component.pinnedCountries['DE'] = 1;

    // call when data is already loaded:
    component.toggleSeries('DE', TargetFieldName.THREE_D);
    expect(component.loadCountryChartData).not.toHaveBeenCalled();

    // call when data is not fully loaded:
    component.toggleSeries('FR', TargetFieldName.THREE_D);
    expect(component.loadCountryChartData).toHaveBeenCalledTimes(1);
    expect(component.lineChart.addSeries).toHaveBeenCalled();
    expect(component.togglePin).not.toHaveBeenCalled();

    // pinned countries do not toggle
    component.toggleSeries('DE', TargetFieldName.THREE_D, seriesItemHidden);
    expect(component.togglePin).not.toHaveBeenCalled();

    component.toggleSeries('DE', TargetFieldName.THREE_D, seriesItemShowing);
    expect(component.togglePin).not.toHaveBeenCalled();

    // unpinned countries do toggle
    component.toggleSeries('FR', TargetFieldName.THREE_D, seriesItemHidden);
    expect(component.togglePin).toHaveBeenCalled();

    component.toggleSeries('FR', TargetFieldName.THREE_D, seriesItemShowing);
    expect(component.togglePin).toHaveBeenCalled();
  });

  it('should call toggleCountry when the countryCode is set', fakeAsync(() => {
    component.targetMetaData = mockTargetMetaData;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    spyOn(component, 'toggleCountry').and.callFake(() => {});

    // set initial code and a pinned country
    component.countryCode = 'FR';
    component.pinnedCountries = { FR: 0 };

    expect(component.toggleCountry).not.toHaveBeenCalled();
    tick(0);
    expect(component.toggleCountry).toHaveBeenCalled();

    tick(component.timeoutAnimation);
    expect(component.toggleCountry).toHaveBeenCalledTimes(1);
    component.pinnedCountries = { FR: 0 };

    // set again
    component.countryCode = 'DE';

    expect(component.toggleCountry).toHaveBeenCalledTimes(2);
    tick(component.timeoutAnimation);
    expect(component.toggleCountry).toHaveBeenCalledTimes(3);
    tick(component.timeoutAnimation);
    expect(component.toggleCountry).toHaveBeenCalledTimes(3);

    // set again
    component.countryCode = 'FR';
    expect(component.toggleCountry).toHaveBeenCalledTimes(4);
    tick(component.timeoutAnimation);
    expect(component.toggleCountry).toHaveBeenCalledTimes(5);
    tick(component.timeoutAnimation);
    expect(component.toggleCountry).toHaveBeenCalledTimes(5);

    component.countryCode = undefined;
    tick(component.timeoutAnimation);
    expect(component.countryCode).toBeFalsy();
  }));

  it('should sort the pins', () => {
    const desiredOrder = ['NL', 'IT'];
    const testArray = ['ES', 'IT', 'CH', 'NL'];

    component.sortPins(testArray, desiredOrder);

    expect(testArray[0]).toEqual('NL');
    expect(testArray[1]).toEqual('IT');
    expect(testArray[testArray.length - 1]).toEqual('CH');
  });

  it('should fire the unpin event', () => {
    spyOn(component.unpinColumn, 'emit');
    component.fireUnpinColumn(TargetFieldName.THREE_D);
    expect(component.unpinColumn.emit).toHaveBeenCalled();
  });
});

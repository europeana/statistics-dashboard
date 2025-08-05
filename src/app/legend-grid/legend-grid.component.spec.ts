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

const date = new Date().toISOString();

const mockCountryData = {
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
    component.targetCountries = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the series set', () => {
    const showSpy = jest.fn();
    const spyTogglePin = jest
      .spyOn(component, 'togglePin')
      .mockImplementation();

    component.hiddenSeriesSetData[0] = {
      Italy: {
        show: showSpy
      } as unknown as am4charts.LineSeries
    };

    component.showSeriesSet(0);
    expect(showSpy).toHaveBeenCalled();
    expect(spyTogglePin).toHaveBeenCalled();
  });

  it('should hide the series set', () => {
    const hideSpy = jest.fn();

    const spyTogglePin = jest
      .spyOn(component, 'togglePin')
      .mockImplementation();

    component.hideSeriesSet(0);

    expect(hideSpy).not.toHaveBeenCalled();
    expect(spyTogglePin).not.toHaveBeenCalled();

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
    component.countryData = mockCountryData;

    component.togglePin('AU');

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
    const spyToggle = jest.spyOn(
      component.legendGrid.nativeElement.classList,
      'toggle'
    );
    component.gridScroll();
    expect(spyToggle).toHaveBeenCalled();
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
      hide: jest.fn()
    } as unknown as am4charts.LineSeries;

    expect(Object.keys(component.hiddenColumnRanges).length).toEqual(2);
    component.showHiddenRangesByColumn(TargetFieldName.THREE_D);
    expect(Object.keys(component.hiddenColumnRanges).length).toEqual(1);
    component.showHiddenRangesByColumn();
    expect(Object.keys(component.hiddenColumnRanges).length).toEqual(0);
  });

  it('should toggle the range', () => {
    const colour = component.lineChart.chart.colors.list[0];

    const spyShowRange = jest.spyOn(component.lineChart, 'showRange');
    const spyRemoveRange = jest.spyOn(component.lineChart, 'removeRange');

    component.toggleRange('FR', TargetFieldName.THREE_D, 0);

    expect(spyRemoveRange).toHaveBeenCalled();
    expect(spyShowRange).not.toHaveBeenCalled();

    component.toggleRange('FR', TargetFieldName.THREE_D, 0, colour);

    expect(spyShowRange).toHaveBeenCalled();
  });

  it('should addSeriesSetAndPin', () => {
    component.targetMetaData = mockTargetMetaData;

    const data = mockTargetMetaData['FR'][TargetFieldName.THREE_D];
    const spyAddSeries = jest.spyOn(component.lineChart, 'addSeries');

    component.addSeriesSetAndPin('FR', data);
    expect(spyAddSeries).toHaveBeenCalledTimes(0);
    component.addSeriesSetAndPin('FR', data, [TargetFieldName.THREE_D]);
    expect(spyAddSeries).toHaveBeenCalledTimes(1);
  });

  it('should toggle the country', () => {
    component.targetMetaData = mockTargetMetaData;

    const spyTogglePin = jest
      .spyOn(component, 'togglePin')
      .mockImplementation();
    const spyAddSeriesSetAndPin = jest
      .spyOn(component, 'addSeriesSetAndPin')
      .mockImplementation();
    const spyEmit = jest
      .spyOn(component.onLoadHistory, 'emit')
      .mockImplementation(
        (req: { fnCallback: (result: Array<TargetCountryData>) => void }) => {
          component.countryData = { DE: [] };
          req.fnCallback([]);
        }
      );

    component.toggleCountry('FR');
    expect(spyTogglePin).toHaveBeenCalled();

    component.toggleCountry('FR');
    expect(spyTogglePin).toHaveBeenCalledTimes(2);

    component.toggleCountry('DE');
    expect(spyTogglePin).toHaveBeenCalledTimes(3);

    expect(spyEmit).not.toHaveBeenCalled();
    expect(spyAddSeriesSetAndPin).not.toHaveBeenCalled();

    const spyGetCountrySeries = jest
      .spyOn(component, 'getCountrySeries')
      .mockImplementation(() => {
        return [];
      });
    component.toggleCountry('DE');

    expect(spyTogglePin).toHaveBeenCalledTimes(3);
    expect(spyAddSeriesSetAndPin).toHaveBeenCalled();
    expect(spyEmit).toHaveBeenCalled();

    // case where existing country data is reused after component reinitialisation

    component.countryData = mockCountryData;

    component.toggleCountry('DE');

    expect(spyAddSeriesSetAndPin).toHaveBeenCalledTimes(2);
    expect(spyEmit).toHaveBeenCalledTimes(1);
  });

  it('should toggle the series', () => {
    component.countryData = mockCountryData;
    component.targetMetaData = mockTargetMetaData;

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

    const spyTogglePin = jest.spyOn(component, 'togglePin');
    const spyAddSeries = jest.spyOn(component.lineChart, 'addSeries');
    const spyLoadCountryChartData = jest.spyOn(
      component,
      'loadCountryChartData'
    );

    component.pinnedCountries['DE'] = 1;

    // call when data is already loaded:
    component.toggleSeries('DE', TargetFieldName.THREE_D);
    expect(spyLoadCountryChartData).not.toHaveBeenCalled();

    // call when data is not fully loaded:
    component.toggleSeries('FR', TargetFieldName.THREE_D);
    expect(spyLoadCountryChartData).toHaveBeenCalledTimes(1);
    expect(spyAddSeries).toHaveBeenCalled();
    expect(spyTogglePin).not.toHaveBeenCalled();

    // pinned countries do not toggle
    component.toggleSeries('DE', TargetFieldName.THREE_D, seriesItemHidden);
    expect(spyTogglePin).not.toHaveBeenCalled();

    component.toggleSeries('DE', TargetFieldName.THREE_D, seriesItemShowing);
    expect(spyTogglePin).not.toHaveBeenCalled();

    // unpinned countries do toggle
    component.toggleSeries('FR', TargetFieldName.THREE_D, seriesItemHidden);
    expect(spyTogglePin).toHaveBeenCalled();

    component.toggleSeries('FR', TargetFieldName.THREE_D, seriesItemShowing);
    expect(spyTogglePin).toHaveBeenCalled();
  });

  it('should call toggleCountry when the countryCode is set', fakeAsync(() => {
    component.targetMetaData = mockTargetMetaData;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spyToggleCountry = jest
      .spyOn(component, 'toggleCountry')
      .mockReturnValue(null);

    // set initial code and a pinned country
    component.countryCode = 'FR';
    component.pinnedCountries = { FR: 0 };

    expect(spyToggleCountry).not.toHaveBeenCalled();
    tick(0);
    expect(spyToggleCountry).toHaveBeenCalled();

    tick(component.timeoutAnimation);
    expect(spyToggleCountry).toHaveBeenCalledTimes(1);
    component.pinnedCountries = { FR: 0 };

    // set again
    component.countryCode = 'DE';

    expect(spyToggleCountry).toHaveBeenCalledTimes(2);
    tick(component.timeoutAnimation);
    expect(spyToggleCountry).toHaveBeenCalledTimes(3);
    tick(component.timeoutAnimation);
    expect(spyToggleCountry).toHaveBeenCalledTimes(3);

    // set again
    component.countryCode = 'FR';
    expect(spyToggleCountry).toHaveBeenCalledTimes(4);
    tick(component.timeoutAnimation);
    expect(spyToggleCountry).toHaveBeenCalledTimes(5);
    tick(component.timeoutAnimation);
    expect(spyToggleCountry).toHaveBeenCalledTimes(5);

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
    const spyEmit = jest.spyOn(component.unpinColumn, 'emit');
    component.fireUnpinColumn(TargetFieldName.THREE_D);
    expect(spyEmit).toHaveBeenCalled();
  });

  it('should load the country chart data', () => {
    const spyEmit = jest.spyOn(component.onLoadHistory, 'emit');
    component.loadCountryChartData('DE');
    expect(spyEmit).toHaveBeenCalled();
  });
});

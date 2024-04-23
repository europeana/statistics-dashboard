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
import { TargetFieldName } from '../_models';
import { LineComponent } from '../chart';
import { LegendGridComponent } from '.';

const mockTargetMetaData = {
  DE: {
    three_d: [],
    hq: []
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

    expect(component.pinnedCountries['DE']).toEqual(
      0 * LegendGridComponent.itemHeight
    );
    expect(component.pinnedCountries['FR']).toEqual(
      1 * LegendGridComponent.itemHeight
    );
    expect(Object.keys(component.pinnedCountries).length).toEqual(2);

    component.togglePin('DE');

    expect(component.pinnedCountries['FR']).toEqual(0);
    expect(Object.keys(component.pinnedCountries).length).toEqual(1);
  });

  it('should handle scrolling', () => {
    spyOn(component.legendGrid.nativeElement.classList, 'toggle');
    component.gridScroll();
    expect(
      component.legendGrid.nativeElement.classList.toggle
    ).toHaveBeenCalled();
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
      mockTargetMetaData['FR'][TargetFieldName.THREE_D]
    );
    expect(component.lineChart.addSeries).toHaveBeenCalledTimes(2);
  });

  it('should toggle the country', () => {
    component.targetMetaData = mockTargetMetaData;

    spyOn(component, 'togglePin');
    spyOn(component, 'addSeriesSetAndPin').and.callFake(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    });

    component.toggleCountry('FR');
    expect(component.togglePin).toHaveBeenCalled();

    component.toggleCountry('FR');
    expect(component.togglePin).toHaveBeenCalledTimes(2);

    component.toggleCountry('DE');
    expect(component.togglePin).toHaveBeenCalledTimes(3);

    expect(component.addSeriesSetAndPin).not.toHaveBeenCalled();

    spyOn(component, 'getCountrySeries').and.callFake(() => {
      return [];
    });
    component.toggleCountry('DE');

    expect(component.togglePin).toHaveBeenCalledTimes(3);
    expect(component.addSeriesSetAndPin).toHaveBeenCalled();
  });

  it('should toggle the series', () => {
    const seriesItemHidden = {
      isHidden: true,
      show: () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      },
      hide: () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }
    } as unknown as am4charts.LineSeries;
    const seriesItemShowing = {
      ...seriesItemHidden,
      isHidden: false
    } as unknown as am4charts.LineSeries;
    const seriesArray = [seriesItemShowing];

    spyOn(component, 'getCountrySeries').and.callFake((_) => {
      return seriesArray;
    });
    spyOn(component, 'togglePin');
    spyOn(component.lineChart, 'addSeries');

    component.toggleSeries('DE', TargetFieldName.THREE_D);

    expect(component.lineChart.addSeries).toHaveBeenCalled();
    expect(component.togglePin).not.toHaveBeenCalled();

    seriesArray.pop();
    seriesArray.push(seriesItemHidden);

    component.toggleSeries('DE', TargetFieldName.THREE_D);
    expect(component.togglePin).toHaveBeenCalled();

    // supply the series parameter
    spyOn(seriesItemShowing, 'hide');
    component.toggleSeries('DE', TargetFieldName.THREE_D, seriesItemShowing);
    expect(seriesItemShowing.hide).toHaveBeenCalled();
    expect(component.togglePin).toHaveBeenCalledTimes(2);

    spyOn(seriesItemHidden, 'show');
    component.toggleSeries('DE', TargetFieldName.THREE_D, seriesItemHidden);
    expect(seriesItemHidden.show).toHaveBeenCalled();
    expect(component.togglePin).toHaveBeenCalledTimes(3);
  });

  it('should call toggleCountry when the countryCode is set', fakeAsync(() => {
    component.targetMetaData = mockTargetMetaData;

    spyOn(component, 'toggleCountry').and.callFake(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    });

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
  }));
});

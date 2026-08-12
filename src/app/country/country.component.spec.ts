import {
  ApplicationRef,
  ComponentRef,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { isoCountryCodesReversed } from '../_data';
import { APIService } from '../_services';
import {
  MockAPIService,
  mockCountryData,
  MockLineComponent,
  mockTargetMetaData
} from '../_mocked';
import { TargetFieldName } from '../_models';
import { BarComponent, LineComponent, LineService } from '../chart';
import { LegendGridService } from '../legend-grid';
import { HeaderComponent } from '../header';
import { CountryComponent } from '.';

describe('CountryComponent', () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;
  let router: Router;
  let routeChangeSource: BehaviorSubject<Params>;
  let lineService: LineService;
  let legendGridService: LegendGridService;
  let api: APIService;

  class IntersectionObserver {
    observe(): void {
      console.log('IntersectionObserver.observe()');
    }
    constructor(
      public callback: (entries: Array<IntersectionObserverEntry>) => void
    ) {}
  }

  const configureTestBed = (): void => {
    routeChangeSource = new BehaviorSubject({ country: 'France' } as Params);
    TestBed.configureTestingModule({
      imports: [CountryComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: routeChangeSource }
        },
        { provide: APIService, useClass: MockAPIService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(CountryComponent, {
        remove: { imports: [LineComponent] },
        add: { imports: [MockLineComponent] }
      })
      .compileComponents();
    api = TestBed.inject(APIService);
    router = TestBed.inject(Router);
    lineService = TestBed.inject(LineService);
    legendGridService = TestBed.inject(LegendGridService);
  };

  let appRef: ApplicationRef;

  beforeEach(waitForAsync(() => {
    configureTestBed();
    appRef = TestBed.inject(ApplicationRef);
  }));

  const finaliseInit = (): void => {
    const headerFixture = TestBed.createComponent(HeaderComponent);
    const headerInstance = headerFixture.componentInstance;

    headerInstance.activeCountry.set('France');
    headerInstance.pageTitleDynamic.set(true);
    headerInstance.pageTitleInViewport.set(false);

    headerInstance.countryTotalMap.set({
      France: '1'
    });

    appRef.components.push({
      header: headerInstance
    } as unknown as ComponentRef<unknown>);

    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('headerRef', headerInstance);
  };

  const b4Each = (fullInit = true): void => {
    (
      window as unknown as { IntersectionObserver: unknown }
    ).IntersectionObserver = IntersectionObserver;
    if (fullInit) {
      finaliseInit();
    }
  };

  describe('Special Operations', () => {
    beforeEach(() => {
      b4Each(false);
    });

    it('should NOT redirect home when an recognisable country has data', fakeAsync(() => {
      const fakeCountry = 'BEE';
      const copy = { ...mockCountryData };
      copy[fakeCountry] = copy['FR'];
      delete copy['FR'];
      jest.spyOn(router, 'navigate');
      jest.spyOn(api, 'getCountryData').mockImplementation(() => {
        return of(copy);
      });

      finaliseInit();

      routeChangeSource.next({ country: fakeCountry });
      tick(1);
      fixture.detectChanges();
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('Normal Operations', () => {
    beforeEach(() => {
      b4Each(true);
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should compute the latest country data', () => {
      expect(component.latestCountryData()).toBeFalsy();
      component.countryData.set(mockCountryData);
      expect(component.latestCountryData()).toBeTruthy();
    });

    it('should compute the tooltips and totals', () => {
      expect(
        Object.keys(component.tooltipsAndTotals()['tooltipsTotal']).length
      ).toBeFalsy();

      component.countryData.set(mockCountryData);
      component.targetMetaData.set(mockTargetMetaData);
      component.country.set('FR');

      expect(
        Object.keys(component.tooltipsAndTotals()['tooltipsTotal']).length
      ).toBeTruthy();

      const copy = { ...mockCountryData };

      copy['FR'] = copy['FR'].reverse();

      component.countryData.set(copy);

      expect(
        Object.keys(component.tooltipsAndTotals()['tooltipsTotal']).length
      ).toBeTruthy();

      component.country.set('ZZ');

      expect(
        Object.keys(component.tooltipsAndTotals()['tooltipsTotal']).length
      ).toBeFalsy();

      copy['XX'] = copy['FR'];
      delete copy['FR'];

      const copyTarget = { ...mockTargetMetaData };
      copyTarget['XX'] = copyTarget['FR'];
      delete copyTarget['FR'];

      console.log(JSON.stringify(copyTarget, null, 4));

      component.countryData.set(copy);
      component.targetMetaData.set(copyTarget);
      component.country.set('XX');

      expect(
        Object.keys(component.tooltipsAndTotals()['tooltipsTotal']).length
      ).toBeTruthy();
    });

    it('should react to the line chart becoming ready', () => {
      expect(component.lineChartIsInitialised()).toBeFalsy();
      lineService.setLineChartReady(true);
      expect(component.lineChartIsInitialised()).toBeTruthy();
    });

    it('should listen for legend-grid initialisation', () => {
      expect(component.legendGridIsInitialised()).toBeFalsy();
      legendGridService.setLegendGridReady(true);
      expect(component.legendGridIsInitialised()).toBeTruthy();
    });

    it('should load the history', () => {
      const country = 'DE';
      const fnCallback = jest.fn();
      component.loadHistory({ country: country, fnCallback: fnCallback });
      expect(fnCallback).toHaveBeenCalled();
    });

    it('should redirect (to home)', () => {
      jest.spyOn(router, 'navigate').mockReturnValue(null);
      ['xxx', 'yyy', 'zzz'].forEach((code: string) => {
        routeChangeSource.next({ country: code });
        expect(router.navigate).toHaveBeenCalledWith(['/'], undefined);
      });
    });

    it('should redirect (when it recognises country codes)', () => {
      jest.spyOn(router, 'navigate').mockReturnValue(null);
      ['BE', 'DE', 'FR'].forEach((code: string) => {
        routeChangeSource.next({ country: code });
        expect(router.navigate).toHaveBeenCalledWith(
          ['country', isoCountryCodesReversed[code]],
          undefined
        );
      });
    });

    it('should redirect (when it recognises country codes) (with ct-zero enabled)', () => {
      component.includeCTZero.set(true);
      fixture.detectChanges();

      const navOps = { queryParams: { 'content-tier-zero': 'true' } };
      jest.spyOn(router, 'navigate').mockReturnValue(null);
      ['BE', 'DE', 'FR'].forEach((code: string) => {
        routeChangeSource.next({ country: code });
        expect(router.navigate).toHaveBeenCalledWith(
          ['country', isoCountryCodesReversed[code]],
          navOps
        );
      });
    });

    it('should set the country', fakeAsync(() => {
      const mockRemoveAllSeries = jest.fn();
      const mockNgAfterViewInit = jest.fn();

      const barChart = {
        removeAllSeries: mockRemoveAllSeries,
        ngAfterViewInit: mockNgAfterViewInit
      } as unknown as BarComponent;

      component.barChart = barChart;

      jest.spyOn(component, 'refreshCardData').mockImplementation(() => {
        if (component.barChart) {
          component.barChart.removeAllSeries();
          component.barChart.ngAfterViewInit();
        }
      });

      component.country.set('France');
      component.includeCTZero.set(false);

      TestBed.flushEffects();
      component.refreshCardData();
      fixture.detectChanges();
      tick(1);

      expect(mockRemoveAllSeries).toHaveBeenCalled();
      expect(mockNgAfterViewInit).toHaveBeenCalled();
    }));

    it('should set the latest country data', () => {
      expect(component.latestCountryData()).toBeFalsy();
      component.countryData.set(mockCountryData);
      component.targetMetaData.set(mockTargetMetaData);
      component.country.set('FR');
      expect(component.latestCountryData()).toBeTruthy();
    });

    it('should toggle the appendice', () => {
      expect(component.appendiceExpanded).toBeFalsy();
      component.toggleAppendice();
      expect(component.appendiceExpanded).toBeTruthy();
      component.toggleAppendice();
      expect(component.appendiceExpanded).toBeFalsy();
    });

    it('should toggle the column', () => {
      expect(component.columnsEnabled[TargetFieldName.TOTAL]).toBeTruthy();

      component.toggleColumn(TargetFieldName.TOTAL);
      expect(component.columnsEnabled[TargetFieldName.TOTAL]).toBeFalsy();

      component.toggleColumn(TargetFieldName.TOTAL);
      expect(component.columnsEnabled[TargetFieldName.TOTAL]).toBeTruthy();
    });

    it('should find the next column to enable', () => {
      expect(component.nextColToEnable()).toBeFalsy();

      // Disable a column to see if the utility finds it
      component.columnsEnabled[TargetFieldName.TOTAL] = false;
      expect(component.nextColToEnable()).toEqual(TargetFieldName.TOTAL);

      // Re-enable it
      component.columnsEnabled[TargetFieldName.TOTAL] = true;
      expect(component.nextColToEnable()).toBeFalsy();
    });

    it('should refresh the data when the includeCTZero is set', () => {
      const spyRefreshCardData = jest
        .spyOn(component, 'refreshCardData')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      component.country.set('FR');
      fixture.detectChanges();
      expect(spyRefreshCardData).toHaveBeenCalledTimes(1);

      component.includeCTZero.set(true);
      fixture.detectChanges();
      expect(spyRefreshCardData).toHaveBeenCalledTimes(2);
    });

    it('should handle the intersectionObserverCallback', () => {
      // Tests page title visibility based on intersection ratio
      const headerRef = component.headerRef;
      expect(component.headerRef().pageTitleInViewport()).toBeFalsy();
      component.intersectionObserverCallback([
        {
          isIntersecting: true,
          intersectionRatio: 0.9
        }
      ]);
      expect(headerRef().pageTitleInViewport()).toBeTruthy();
    });
  });
});

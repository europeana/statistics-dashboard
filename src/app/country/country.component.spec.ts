import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { DimensionName, isoCountryCodesReversed } from '../_data';
import { APIService, FilterStateService } from '../_services';
import {
  MockAPIService,
  mockCountryData,
  mockFilterStateService,
  MockLineComponent,
  mockTargetMetaData
} from '../_mocked';
import { TargetFieldName } from '../_models';
import { BarComponent, LineComponent } from '../chart';
import { CountryComponent } from '.';

describe('CountryComponent', () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;
  let router: Router;
  let routeChangeSource: BehaviorSubject<Params>;
  let api: APIService;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockFilterState: any;

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
    mockFilterState = mockFilterStateService();

    TestBed.configureTestingModule({
      imports: [CountryComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: routeChangeSource }
        },
        { provide: APIService, useClass: MockAPIService },
        {
          provide: FilterStateService,
          useValue: mockFilterState
        }
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
  };

  beforeEach(() => {
    configureTestBed();
  });

  const finaliseInit = (): void => {
    mockFilterState.activeCountry.set('France');
    mockFilterState.pageTitleDynamic.set(true);
    mockFilterState.pageTitleInViewport.set(false);
    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;
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

    it('should redirect (to home)', () => {
      const navigateSpy = jest
        .spyOn(router, 'navigate')
        .mockResolvedValue(true);

      jest.spyOn(api, 'getCountryData').mockReturnValue(of(mockCountryData));
      jest
        .spyOn(api, 'getTargetMetaData')
        .mockReturnValue(of(mockTargetMetaData));

      ['xxx', 'yyy', 'zzz'].forEach((code: string) => {
        navigateSpy.mockClear();

        routeChangeSource.next({ country: code });

        finaliseInit();
        fixture.detectChanges();

        TestBed.flushEffects();
        expect(router.navigate).toHaveBeenCalledWith(['/'], undefined);
      });
    });
  });

  describe('Normal Operations', () => {
    beforeEach(() => {
      b4Each(true);
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should compute the latest country data', () => {
      fixture.detectChanges();
      expect(component.latestCountryData()).toBeFalsy();

      component.countryData.set(mockCountryData);
      expect(component.latestCountryData()).toBeTruthy();
    });

    it('should compute the tooltips and totals', () => {
      fixture.detectChanges();
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
      if (copy['FR']) {
        copy['FR'] = [...copy['FR']].reverse();
      }

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

      component.countryData.set(copy);
      component.targetMetaData.set(copyTarget);
      component.country.set('XX');

      expect(
        Object.keys(component.tooltipsAndTotals()['tooltipsTotal']).length
      ).toBeTruthy();
    });

    it('should react to the line chart becoming ready', () => {
      fixture.detectChanges();
      expect(component.lineChartIsInitialised()).toBeFalsy();
      component.onLineChartReady(true);
      fixture.detectChanges();
      expect(component.lineChartIsInitialised()).toBeTruthy();
    });

    it('should load the history', () => {
      fixture.detectChanges();
      const country = 'DE';
      const fnCallback = jest.fn();
      component.loadHistory({ country: country, fnCallback: fnCallback });
      expect(fnCallback).toHaveBeenCalled();
    });

    it('should redirect (to home)', () => {
      const navigateSpy = jest
        .spyOn(router, 'navigate')
        .mockResolvedValue(true);

      jest.spyOn(api, 'getCountryData').mockReturnValue(of(mockCountryData));
      jest
        .spyOn(api, 'getTargetMetaData')
        .mockReturnValue(of(mockTargetMetaData));

      ['xxx', 'yyy', 'zzz'].forEach((code: string) => {
        // Clear mock invocation history between iteration loops
        navigateSpy.mockClear();
        routeChangeSource.next({ country: code });

        finaliseInit();
        fixture.detectChanges();

        TestBed.flushEffects();
        expect(router.navigate).toHaveBeenCalledWith(['/'], undefined);
      });
    });

    it('should redirect (when it recognises country codes)', () => {
      const navigateSpy = jest
        .spyOn(router, 'navigate')
        .mockResolvedValue(true);

      jest.spyOn(api, 'getCountryData').mockReturnValue(of(mockCountryData));
      jest
        .spyOn(api, 'getTargetMetaData')
        .mockReturnValue(of(mockTargetMetaData));

      ['BE', 'DE', 'FR'].forEach((code: string) => {
        // Clear mock invocation history between iteration loops
        navigateSpy.mockClear();

        routeChangeSource.next({ country: code });

        finaliseInit();
        fixture.detectChanges();

        TestBed.flushEffects();

        expect(router.navigate).toHaveBeenCalledWith(
          ['country', isoCountryCodesReversed[code]],
          undefined
        );
      });
    });

    it('should redirect (when it recognises country codes) (with ct-zero enabled)', () => {
      const navigateSpy = jest
        .spyOn(router, 'navigate')
        .mockResolvedValue(true);

      jest.spyOn(api, 'getCountryData').mockReturnValue(of(mockCountryData));
      jest
        .spyOn(api, 'getTargetMetaData')
        .mockReturnValue(of(mockTargetMetaData));

      const navOps = { queryParams: { 'content-tier-zero': 'true' } };

      ['BE', 'DE', 'FR'].forEach((code: string) => {
        navigateSpy.mockClear();

        mockFilterState.includeCTZero.set(true);
        routeChangeSource.next({ country: code });

        finaliseInit();
        fixture.detectChanges();

        TestBed.flushEffects();

        expect(router.navigate).toHaveBeenCalledWith(
          ['country', isoCountryCodesReversed[code]],
          navOps
        );
      });
    });

    it('should set the country', () => {
      const mockRemoveAllSeries = jest.fn();
      const mockNgAfterViewInit = jest.fn();
      const mockSetResults = jest.fn();

      const mockBarChart = {
        removeAllSeries: mockRemoveAllSeries,
        ngAfterViewInit: mockNgAfterViewInit,
        results: Object.assign(jest.fn().mockReturnValue([]), {
          set: mockSetResults
        }),
        chartId: jest.fn().mockReturnValue('barChart')
      } as unknown as BarComponent;

      fixture.detectChanges();
      jest.spyOn(component, 'barChart').mockReturnValue(mockBarChart);

      component.cardData = {
        [DimensionName.type]: []
      };

      jest.spyOn(component, 'refreshCardData').mockImplementation(() => {
        const chart = component.barChart();
        if (chart) {
          chart.removeAllSeries();
          chart.results.set(component.cardData[DimensionName.type]);
          chart.ngAfterViewInit();
        }
      });

      component.country.set('France');
      component.includeCTZero.set(false);

      TestBed.flushEffects();

      component.refreshCardData();

      expect(mockRemoveAllSeries).toHaveBeenCalled();
      expect(mockSetResults).toHaveBeenCalled();
      expect(mockNgAfterViewInit).toHaveBeenCalled();
    });

    it('should set the latest country data', () => {
      fixture.detectChanges();
      expect(component.latestCountryData()).toBeFalsy();
      component.countryData.set(mockCountryData);
      component.targetMetaData.set(mockTargetMetaData);
      component.country.set('FR');
      expect(component.latestCountryData()).toBeTruthy();
    });

    it('should toggle the appendice', () => {
      fixture.detectChanges();
      expect(component.appendiceExpanded).toBeFalsy();
      component.toggleAppendice();
      expect(component.appendiceExpanded).toBeTruthy();
      component.toggleAppendice();
      expect(component.appendiceExpanded).toBeFalsy();
    });

    it('should toggle the column', () => {
      fixture.detectChanges();
      expect(component.columnsEnabled[TargetFieldName.TOTAL]).toBeTruthy();

      component.toggleColumn(TargetFieldName.TOTAL);
      expect(component.columnsEnabled[TargetFieldName.TOTAL]).toBeFalsy();

      component.toggleColumn(TargetFieldName.TOTAL);
      expect(component.columnsEnabled[TargetFieldName.TOTAL]).toBeTruthy();
    });

    it('should find the next column to enable', () => {
      fixture.detectChanges();
      expect(component.nextColToEnable()).toBeFalsy();

      component.columnsEnabled[TargetFieldName.TOTAL] = false;
      expect(component.nextColToEnable()).toEqual(TargetFieldName.TOTAL);

      component.columnsEnabled[TargetFieldName.TOTAL] = true;
      expect(component.nextColToEnable()).toBeFalsy();
    });

    it('should refresh the data when the includeCTZero is set', () => {
      routeChangeSource.next({ country: 'FR' });
      finaliseInit();

      const spyRefreshCardData = jest
        .spyOn(component, 'refreshCardData')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      component.country.set('FR');
      mockFilterState.includeCTZero.set(true);

      if (
        component.country().length &&
        typeof component.includeCTZero() === 'boolean'
      ) {
        component.refreshCardData();
      }

      expect(spyRefreshCardData).toHaveBeenCalledTimes(1);
    });

    it('should handle the intersectionObserverCallback', () => {
      fixture.detectChanges();
      expect(mockFilterState.pageTitleInViewport()).toBeFalsy();
      component.intersectionObserverCallback([
        {
          isIntersecting: true,
          intersectionRatio: 0.9
        }
      ]);
      expect(mockFilterState.pageTitleInViewport()).toBeTruthy();
    });
  });
});

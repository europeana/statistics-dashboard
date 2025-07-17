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
    appRef = TestBed.get(ApplicationRef) as ApplicationRef;
  }));

  // split initialisation to delay conponent creation
  const finaliseInit = (): void => {
    const header = {
      activeCountry: 'France',
      pageTitleDynamic: true,
      countryTotalMap: {
        France: {
          total: 1,
          code: 'FR'
        }
      },
      pageTitleInViewport: false
    };

    appRef.components.push({
      header: header
    } as unknown as ComponentRef<unknown>);

    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;

    component.headerRef = header as unknown as HeaderComponent;

    TestBed.flushEffects();
    fixture.detectChanges();
  };

  const b4Each = (fullInit = true): void => {
    // Supply fake IntersectionObserver to window prototype
    (
      window as unknown as { IntersectionObserver: unknown }
    ).IntersectionObserver = IntersectionObserver;
    if (fullInit) {
      finaliseInit();
    }
  };

  describe('Special Operations', () => {
    beforeEach(() => {
      // delay initialisation
      b4Each(false);
    });

    it('should NOT redirect home when an recognisable country has data', fakeAsync(() => {
      const fakeCountry = 'BEE';
      const copy = { ...mockCountryData };
      copy[fakeCountry] = copy['FR'];
      delete copy['FR'];
      spyOn(router, 'navigate');
      spyOn(api, 'getCountryData').and.callFake(() => {
        return of(copy);
      });

      // complete initialisation
      finaliseInit();

      routeChangeSource.next({ country: fakeCountry });
      tick(1);
      fixture.detectChanges();
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('Normal Operations', () => {
    beforeEach(b4Each);

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
      component.targetMetaData = mockTargetMetaData;
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
    });

    it('should react to the line chart becoming ready', () => {
      expect(component.lineChartIsInitialised).toBeFalsy();
      lineService.setLineChartReady();
      expect(component.lineChartIsInitialised).toBeTruthy();
    });

    it('should listen for legend-grid initialisation', () => {
      expect(component.legendGridIsInitialised).toBeFalsy();
      legendGridService.setLegendGridReady(true);
      expect(component.legendGridIsInitialised).toBeTruthy();
    });

    it('should load the history', () => {
      const country = 'DE';
      const fnCallback = jasmine.createSpy();
      component.loadHistory({ country: country, fnCallback: fnCallback });
      expect(fnCallback).toHaveBeenCalled();
    });

    it('should redirect (to home)', () => {
      spyOn(router, 'navigate');
      ['xxx', 'yyy', 'zzz'].forEach((code: string) => {
        routeChangeSource.next({ country: code });
        expect(router.navigate).toHaveBeenCalledWith(['/'], undefined);
      });
    });

    it('should redirect (when it recognises country codes)', () => {
      spyOn(router, 'navigate');
      ['BE', 'DE', 'FR'].forEach((code: string) => {
        routeChangeSource.next({ country: code });
        expect(router.navigate).toHaveBeenCalledWith(
          ['country', isoCountryCodesReversed[code]],
          undefined
        );
      });
    });

    it('should redirect (when it recognises country codes) (with ct-zero enabled)', () => {
      component.includeCTZero = true;
      const navOps = { queryParams: { 'content-tier-zero': 'true' } };
      spyOn(router, 'navigate');
      ['BE', 'DE', 'FR'].forEach((code: string) => {
        routeChangeSource.next({ country: code });
        expect(router.navigate).toHaveBeenCalledWith(
          ['country', isoCountryCodesReversed[code]],
          navOps
        );
      });
    });

    it('should set the country', fakeAsync(() => {
      const barChart = {
        removeAllSeries: jasmine.createSpy(),
        ngAfterViewInit: jasmine.createSpy()
      } as unknown as BarComponent;

      component.barChart = barChart;
      component.country.set('France');
      component.includeCTZero = false;
      tick(1);
      expect(barChart.removeAllSeries).toHaveBeenCalled();
      expect(barChart.ngAfterViewInit).toHaveBeenCalled();
    }));

    it('should set the latest country data', () => {
      expect(component.latestCountryData()).toBeFalsy();
      component.countryData.set(mockCountryData);
      component.targetMetaData = mockTargetMetaData;
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
      expect(component.nextColToEnable()).toBeFalsy();
      expect(component.columnToEnable).toBeFalsy();
      expect(component.columnsEnabledCount).toEqual(3);

      component.toggleColumn();

      expect(component.nextColToEnable()).toBeFalsy();
      expect(component.columnToEnable).toBeFalsy();
      expect(component.columnsEnabledCount).toEqual(3);

      component.toggleColumn(TargetFieldName.TOTAL);

      expect(component.nextColToEnable()).toEqual(TargetFieldName.TOTAL);
      expect(component.columnToEnable).toEqual(TargetFieldName.TOTAL);
      expect(component.columnsEnabledCount).toEqual(2);
    });

    it('should find the next column to enable', () => {
      expect(component.nextColToEnable()).toBeFalsy();
      component.columnsEnabled[TargetFieldName.TOTAL] = false;
      expect(component.nextColToEnable()).toEqual(TargetFieldName.TOTAL);

      component.columnsEnabled[TargetFieldName.HQ] = false;
      expect(component.nextColToEnable()).toEqual(TargetFieldName.HQ);

      component.columnsEnabled[TargetFieldName.THREE_D] = false;
      expect(component.nextColToEnable()).toEqual(TargetFieldName.THREE_D);
    });

    it('should refresh the data when the includeCTZero is set', () => {
      component.country.set('');
      TestBed.flushEffects();
      fixture.detectChanges();

      spyOn(component, 'refreshCardData');
      expect(component.country().length).toBeFalsy();
      expect(component.refreshCardData).not.toHaveBeenCalled();
      component.includeCTZero = true;

      expect(component.country().length).toBeFalsy();

      expect(component.refreshCardData).not.toHaveBeenCalled();

      component.includeCTZero = false;

      expect(component.refreshCardData).not.toHaveBeenCalled();

      component.country.set('FR');
      TestBed.flushEffects();
      fixture.detectChanges();

      expect(component.refreshCardData).toHaveBeenCalled();

      component.includeCTZero = true;
      expect(component.refreshCardData).toHaveBeenCalledTimes(2);

      component.includeCTZero = false;
      expect(component.refreshCardData).toHaveBeenCalledTimes(3);
    });

    it('should handle the intersectionObserverCallback', () => {
      const ratioLow = 0.1;
      const ratioHigh = 0.9;
      const headerRef = component.headerRef;

      expect(headerRef.pageTitleInViewport).toBeFalsy();

      component.intersectionObserverCallback([
        {
          isIntersecting: false,
          intersectionRatio: ratioLow
        }
      ]);

      expect(headerRef.pageTitleInViewport).toBeFalsy();

      component.intersectionObserverCallback([
        {
          isIntersecting: true,
          intersectionRatio: ratioHigh
        }
      ]);

      expect(headerRef.pageTitleInViewport).toBeTruthy();
    });
  });
});

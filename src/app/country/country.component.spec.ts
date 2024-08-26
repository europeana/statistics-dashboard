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
import { BehaviorSubject } from 'rxjs';
import { isoCountryCodesReversed } from '../_data';
import { APIService } from '../_services';
import { MockAPIService, MockLineComponent } from '../_mocked';
import { TargetFieldName, TargetMetaData } from '../_models';
import { BarComponent, LineComponent } from '../chart';
import { HeaderComponent } from '../header';
import { CountryComponent } from '.';

describe('CountryComponent', () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;
  let intersectionObserverCreated = false;
  let router: Router;
  let routeChangeSource: BehaviorSubject<Params>;

  class IntersectionObserver {
    observe(): void {
      console.log('IntersectionObserver.observe()');
    }
    constructor(
      public callback: (entries: Array<IntersectionObserverEntry>) => void
    ) {
      intersectionObserverCreated = true;
    }
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
    router = TestBed.inject(Router);
  };

  let appRef: ApplicationRef;

  beforeEach(waitForAsync(() => {
    configureTestBed();
    appRef = TestBed.get(ApplicationRef) as ApplicationRef;
  }));

  beforeEach(() => {
    // Supply fake IntersectionObserver to window prototype
    (
      window as unknown as { IntersectionObserver: unknown }
    ).IntersectionObserver = IntersectionObserver;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect (to home)', () => {
    spyOn(router, 'navigate');
    ['xxx', 'yyy', 'zzz'].forEach((code: string) => {
      routeChangeSource.next({ country: code });
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  it('should redirect (when it recognises country codes)', () => {
    spyOn(router, 'navigate');
    ['BE', 'DE', 'FR'].forEach((code: string) => {
      routeChangeSource.next({ country: code });
      expect(router.navigate).toHaveBeenCalledWith([
        `country/${isoCountryCodesReversed[code]}`
      ]);
    });
  });

  it('should set the country', fakeAsync(() => {
    const barChart = {
      removeAllSeries: jasmine.createSpy(),
      ngAfterViewInit: jasmine.createSpy()
    } as unknown as BarComponent;

    component.barChart = barChart;
    component.country = 'France';
    tick(1);
    expect(barChart.removeAllSeries).toHaveBeenCalled();
    expect(barChart.ngAfterViewInit).toHaveBeenCalled();
  }));

  it('should set the country data', () => {
    const datum = {
      date: new Date().toISOString(),
      three_d: '111',
      high_quality: '222',
      total: '333',
      label: 'last'
    };
    component.countryData = {
      FR: [datum]
    };
    component.targetMetaData = {
      FR: {
        three_d: [
          { value: 1 } as TargetMetaData,
          { value: 2 } as TargetMetaData
        ],
        high_quality: [
          { value: 1 } as TargetMetaData,
          { value: 2 } as TargetMetaData
        ],
        total: [{ value: 1 } as TargetMetaData, { value: 2 } as TargetMetaData]
      }
    };

    component.setCountryToParam('FR');
    expect(component.latestCountryData).toEqual(datum);
  });

  it('should toggle the appendice', () => {
    const spyToggleCursor = jasmine.createSpy();
    component.lineChart = {
      toggleCursor: spyToggleCursor
    } as unknown as LineComponent;
    expect(component.appendiceExpanded).toBeFalsy();
    component.toggleAppendice();
    expect(component.appendiceExpanded).toBeTruthy();
    component.toggleAppendice();
    expect(component.appendiceExpanded).toBeFalsy();
    expect(spyToggleCursor).toHaveBeenCalledTimes(2);
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
    spyOn(component, 'refreshCardData');
    component.includeCTZero = true;

    expect(component.refreshCardData).not.toHaveBeenCalled();

    component.includeCTZero = false;

    expect(component.refreshCardData).not.toHaveBeenCalled();

    component.cardData = { provider: [] };
    component.includeCTZero = true;

    expect(component.refreshCardData).toHaveBeenCalled();

    component.includeCTZero = false;

    expect(component.refreshCardData).toHaveBeenCalledTimes(2);
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

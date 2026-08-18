import { Location } from '@angular/common';
import { signal, Signal, ViewContainerRef } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';

import {
  MaintenanceScheduleItemKey,
  MaintenanceScheduleService
} from '@europeana/metis-ui-maintenance-utils';

import { MockAPIService, mockFilterStateService } from './_mocked';

import { GeneralResultsFormatted } from './_models';

import { APIService, ClickService, FilterStateService } from './_services';
import { AppComponent } from './app.component';
import { CookiePolicyComponent } from './cookie-policy';
import { CountryComponent } from './country';
import { LandingComponent } from './landing';
import { OverviewComponent } from './overview';
import { PrivacyStatementComponent } from './privacy-statement';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let clicks: ClickService;
  let location: Location;
  let maintenanceSchedules: MaintenanceScheduleService;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockFilterState: any;

  const params: BehaviorSubject<Params> = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({} as Params);

  // Helper function to mimic an Angular ModelSignal wrapper interface
  const createMockModelSignal = (
    initialValue: boolean
  ): {
    (): boolean;
    set: jest.Mock;
    update: (fn: (v: boolean) => boolean) => void;
  } => {
    const sig = signal(initialValue) as unknown as {
      (): boolean;
      set: jest.Mock;
      update: (fn: (v: boolean) => boolean) => void;
    };
    sig.set = jest.fn((val: boolean) => sig.update(() => val));
    return sig;
  };

  beforeEach(waitForAsync(() => {
    mockFilterState = mockFilterStateService();

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: './data', component: AppComponent },
          { path: './', component: LandingComponent }
        ])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: params, queryParams: queryParams }
        },
        {
          provide: APIService,
          useClass: MockAPIService
        },
        {
          provide: FilterStateService,
          useValue: mockFilterState
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;

    const mockContainer = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      clear: (): void => {},
      createComponent: () => {
        return {
          setInput: (): void => void {}
        };
      }
    } as unknown as ViewContainerRef;

    app.consentContainer = jest
      .fn()
      .mockReturnValue(mockContainer) as unknown as Signal<
      ViewContainerRef | undefined
    >;

    clicks = TestBed.inject(ClickService);
    location = TestBed.inject(Location);
    maintenanceSchedules = fixture.debugElement.injector.get(
      MaintenanceScheduleService
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(app).toBeTruthy();
  });

  it('should listen for document clicks', fakeAsync(() => {
    const spyNext = jest
      .spyOn(clicks.documentClickedTarget, 'next')
      .mockImplementation();
    const el = fixture.debugElement.query(By.css('*'));
    el.nativeElement.click();
    tick(1);
    expect(clicks.documentClickedTarget.next).toHaveBeenCalled();
    app.documentClick({
      target: {
        nativeElement: { contains: () => false }
      } as unknown as HTMLElement
    });

    expect(spyNext).toHaveBeenCalledTimes(2);
  }));

  it('should listen for history navigation', fakeAsync(() => {
    expect(mockFilterState.includeCTZero()).toBeFalsy();
    app.buildForm();

    app.countryComponentRef = {
      includeCTZero: createMockModelSignal(false),
      hasCountryMapData: createMockModelSignal(false),
      landingData: signal({} as GeneralResultsFormatted),
      landingDataIsLoading: signal<boolean>(false)
    } as unknown as CountryComponent;

    app.updateLocation();
    expect(mockFilterState.includeCTZero()).toBeFalsy();

    expect(mockFilterState.includeCTZero()).toBeFalsy();

    app.updateLocation();
    expect(mockFilterState.includeCTZero()).toBeFalsy();

    // trigger location change with different value
    const ctrl = app.getCtrlCTZero();
    ctrl.setValue(true);

    tick(1);
    expect(mockFilterState.includeCTZero()).toBeTruthy();
    expect(app.countryComponentRef.includeCTZero.set).toHaveBeenCalledWith(
      true
    );

    ctrl.setValue(false);

    tick(1);
    expect(mockFilterState.includeCTZero()).toBeFalsy();
    expect(app.countryComponentRef.includeCTZero.set).toHaveBeenCalledWith(
      false
    );

    location.go('/');

    tick(1);
    expect(mockFilterState.includeCTZero()).toBeFalsy();
  }));

  it('should handle the location pop-state', () => {
    const ps = {
      url: '?content-tier-zero=true'
    } as unknown as PopStateEvent;

    app.buildForm();

    expect(mockFilterState.includeCTZero()).toBeFalsy();
    app.handleLocationPopState(ps);
    fixture.detectChanges();
    expect(mockFilterState.includeCTZero()).toBeTruthy();
  });

  it('should load the landing data', fakeAsync(() => {
    app.buildForm();
    expect(mockFilterState.landingDataIsLoading()).toBeFalsy();
    app.loadLandingData(false);
    expect(mockFilterState.landingDataIsLoading()).toBeTruthy();
    tick(1);
    fixture.detectChanges();
    expect(mockFilterState.landingDataIsLoading()).toBeFalsy();
  }));

  it('should handle the outlet load', waitForAsync(async () => {
    expect(app.showPageTitle).toBeFalsy();

    const spyLoadLandingData = jest
      .spyOn(app, 'loadLandingData')
      .mockImplementation();
    jest.spyOn(location, 'path').mockImplementation(() => {
      return '';
    });

    await TestBed.runInInjectionContext(() => {
      app.onOutletLoaded(new LandingComponent());
      expect(app.showPageTitle).toBeTruthy();
      expect(spyLoadLandingData).toHaveBeenCalled();

      // load overview component
      const fakeOverviewComponent = Object.create(OverviewComponent.prototype);

      app.onOutletLoaded(fakeOverviewComponent);
      expect(app.showPageTitle).toBeFalsy();

      expect(spyLoadLandingData).toHaveBeenCalledTimes(2);

      // load landing component
      app.getCtrlCTZero().setValue(true);
      fixture.detectChanges();
      expect(spyLoadLandingData).toHaveBeenCalledTimes(3);

      const cmp = new LandingComponent();
      mockFilterState.landingData.set({} as GeneralResultsFormatted);

      app.onOutletLoaded(cmp);
      expect(app.showPageTitle).toBeTruthy();
      expect(spyLoadLandingData).toHaveBeenCalledTimes(4);

      expect(mockFilterState.includeCTZero()).toBeTruthy();
      expect(cmp.landingData()).toBeTruthy();

      mockFilterState.includeCTZero.set(!app.getCtrlCTZero().value);
      app.onOutletLoaded(new LandingComponent());
      expect(app.loadLandingData).toHaveBeenCalledTimes(5);

      // load privacy statement component
      app.onOutletLoaded(new PrivacyStatementComponent());

      expect(spyLoadLandingData).toHaveBeenCalledTimes(6);

      // load cookie policy component
      app.onOutletLoaded(new CookiePolicyComponent());

      expect(spyLoadLandingData).toHaveBeenCalledTimes(7);

      // load country component
      const fakeCountryComponent = Object.create(CountryComponent.prototype);
      fakeCountryComponent.country = signal('');
      fakeCountryComponent.includeCTZero = createMockModelSignal(false);

      const spyRefreshCardData = jest.fn();
      fakeCountryComponent.refreshCardData = spyRefreshCardData;

      const spySetCTZero = jest.spyOn(app, 'setCTZeroInputToLastSetValue');

      app.onOutletLoaded(fakeCountryComponent);

      expect(app.showPageTitle).toBeTruthy();
      expect(spyLoadLandingData).toHaveBeenCalledTimes(9);
      expect(spySetCTZero).toHaveBeenCalledTimes(1);

      mockFilterState.includeCTZero.set(true);
      app.onOutletLoaded(fakeCountryComponent);

      expect(spySetCTZero).toHaveBeenCalledTimes(2);
      expect(spyRefreshCardData).not.toHaveBeenCalled();

      fakeCountryComponent.loadDimensionCardData = jest
        .fn()
        .mockReturnValue([]);

      fakeCountryComponent.country.set('FR');
      fakeCountryComponent.includeCTZero = createMockModelSignal(false);

      fakeCountryComponent.refreshCardData = spyRefreshCardData;

      if (
        fakeCountryComponent.country().length &&
        typeof fakeCountryComponent.includeCTZero() === 'boolean'
      ) {
        fakeCountryComponent.refreshCardData();
      }

      app.onOutletLoaded(fakeCountryComponent);

      expect(spySetCTZero).toHaveBeenCalledTimes(3);
      expect(spyRefreshCardData).toHaveBeenCalledTimes(1);
    });
  }));

  it('should check if maintenance is due', () => {
    const maintenanceSettings = {
      pollInterval: 1,
      maintenanceScheduleUrl: 'http://maintenance',
      maintenanceScheduleKey:
        MaintenanceScheduleItemKey.STATISTICS_DASHBOARD_TEST,
      maintenanceItem: {}
    };

    const spyLoadMaintenanceItem = jest
      .spyOn(maintenanceSchedules, 'loadMaintenanceItem')
      .mockImplementation(() => {
        return of({
          maintenanceMessage: 'Hello'
        });
      });

    app.checkIfMaintenanceDue(maintenanceSettings);
    expect(spyLoadMaintenanceItem).toHaveBeenCalled();
    expect(mockFilterState.landingDataIsLoading()).toBeFalsy();
  });
});

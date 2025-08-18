import { Location } from '@angular/common';
import { ViewContainerRef } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';

import {
  MaintenanceScheduleItemKey,
  MaintenanceScheduleService
} from '@europeana/metis-ui-maintenance-utils';

import { MockAPIService } from './_mocked';
import { APIService, ClickService } from './_services';
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

  const params: BehaviorSubject<Params> = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({} as Params);

  beforeEach(waitForAsync(() => {
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
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;

    app.consentContainer = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      clear: (): void => {},
      createComponent: () => {
        return {
          setInput: (): void => void {}
        };
      }
    } as unknown as ViewContainerRef;

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
    expect(app.lastSetContentTierZeroValue).toBeFalsy();
    app.buildForm();
    app.countryComponentRef = {} as unknown as CountryComponent;

    // trigger location change does nothing
    app.updateLocation();
    expect(app.lastSetContentTierZeroValue).toBeFalsy();

    app.landingComponentRef = {
      isLoading: true
    } as unknown as LandingComponent;
    expect(app.lastSetContentTierZeroValue).toBeFalsy();

    app.updateLocation();
    expect(app.lastSetContentTierZeroValue).toBeFalsy();

    // trigger location change with different value
    const ctrl = app.getCtrlCTZero();
    ctrl.setValue(true);

    tick(1);
    expect(app.lastSetContentTierZeroValue).toBeTruthy();
    ctrl.setValue(false);

    tick(1);
    expect(app.lastSetContentTierZeroValue).toBeFalsy();

    // trigger location change with different value
    location.go('/');

    tick(1);
    expect(app.lastSetContentTierZeroValue).toBeFalsy();
  }));

  it('should handle the location pop-state', () => {
    const ps = {
      url: '?content-tier-zero=true'
    } as unknown as PopStateEvent;

    app.buildForm();

    app.landingComponentRef = {
      isLoading: false
    } as unknown as LandingComponent;

    expect(app.lastSetContentTierZeroValue).toBeFalsy();
    app.handleLocationPopState(ps);
    fixture.detectChanges();
    expect(app.lastSetContentTierZeroValue).toBeTruthy();
  });

  it('should load the landing data', fakeAsync(() => {
    app.landingComponentRef = {
      isLoading: true
    } as unknown as LandingComponent;
    expect(app.landingComponentRef.isLoading).toBeTruthy();
    expect(app.landingComponentRef.landingData).toBeFalsy();
    app.buildForm();
    app.loadLandingData(false);
    tick(1);
    expect(app.landingComponentRef.isLoading).toBeFalsy();
    expect(app.landingComponentRef.landingData).toBeTruthy();
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
      expect(spyLoadLandingData).toHaveBeenCalledTimes(3);

      const cmp = new LandingComponent();
      app.landingData = {};
      app.onOutletLoaded(cmp);
      expect(app.showPageTitle).toBeTruthy();
      expect(spyLoadLandingData).toHaveBeenCalledTimes(4);
      expect(app.lastSetContentTierZeroValue).toBeTruthy();
      expect(cmp.landingData).toBeTruthy();

      app.lastSetContentTierZeroValue = !app.getCtrlCTZero().value;
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

      const spySetCTZero = jest.spyOn(app, 'setCTZeroInputToLastSetValue');
      const spyRefreshCardData = jest.spyOn(
        fakeCountryComponent,
        'refreshCardData'
      );

      app.onOutletLoaded(fakeCountryComponent);

      expect(app.showPageTitle).toBeTruthy();
      expect(spyLoadLandingData).toHaveBeenCalledTimes(9);
      expect(spySetCTZero).toHaveBeenCalledTimes(1);

      app.lastSetContentTierZeroValue = true;
      app.onOutletLoaded(fakeCountryComponent);

      expect(spySetCTZero).toHaveBeenCalledTimes(2);
      expect(spyRefreshCardData).not.toHaveBeenCalled();

      jest
        .spyOn(fakeCountryComponent, 'loadDimensionCardData')
        .mockImplementation(() => []);

      fakeCountryComponent.country.set('FR');

      app.onOutletLoaded(fakeCountryComponent);

      expect(spySetCTZero).toHaveBeenCalledTimes(3);
      expect(spyRefreshCardData).toHaveBeenCalledTimes(2);
    });
  }));

  it('should check if maintenance is due', () => {
    app.landingComponentRef = {
      isLoading: true
    } as unknown as LandingComponent;

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
    expect(app.landingComponentRef.isLoading).toBeFalsy();
  });
});

import { Location } from '@angular/common';
import { ViewContainerRef } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
import { LandingComponent } from './landing';
import { OverviewComponent } from './overview';

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
        HttpClientTestingModule,
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
        }
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
          // eslint-disable-next-line @typescript-eslint/no-empty-function
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
    spyOn(clicks.documentClickedTarget, 'next');
    const el = fixture.debugElement.query(By.css('*'));
    el.nativeElement.click();
    tick(1);
    expect(clicks.documentClickedTarget.next).toHaveBeenCalled();
    app.documentClick({ target: {} as unknown as HTMLElement });
    expect(clicks.documentClickedTarget.next).toHaveBeenCalledTimes(2);
  }));

  it('should listen for history navigation', fakeAsync(() => {
    expect(app.lastSetContentTierZeroValue).toBeFalsy();
    app.buildForm();

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

  it('should handle the outlet load', () => {
    expect(app.showPageTitle).toBeFalsy();

    spyOn(app, 'loadLandingData');

    // load Landing
    app.onOutletLoaded(new LandingComponent());

    expect(app.showPageTitle).toBeTruthy();
    expect(app.loadLandingData).not.toHaveBeenCalled();

    // load other
    app.onOutletLoaded({} as unknown as OverviewComponent);
    expect(app.showPageTitle).toBeFalsy();

    expect(app.loadLandingData).not.toHaveBeenCalled();

    // load landing
    app.getCtrlCTZero().setValue(true);

    const cmp = new LandingComponent();
    app.landingData = {};
    app.onOutletLoaded(cmp);
    expect(app.showPageTitle).toBeTruthy();
    expect(app.loadLandingData).toHaveBeenCalledTimes(1);
    expect(app.lastSetContentTierZeroValue).toBeTruthy();
    expect(cmp.landingData).toBeTruthy();

    app.lastSetContentTierZeroValue = !app.getCtrlCTZero().value;
    app.onOutletLoaded(new LandingComponent());
    expect(app.loadLandingData).toHaveBeenCalledTimes(2);
  });

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

    spyOn(maintenanceSchedules, 'loadMaintenanceItem').and.callFake(() => {
      return of({
        maintenanceMessage: 'Hello'
      });
    });

    app.checkIfMaintenanceDue(maintenanceSettings);
    expect(maintenanceSchedules.loadMaintenanceItem).toHaveBeenCalled();
    expect(app.landingComponentRef.isLoading).toBeFalsy();
  });
});

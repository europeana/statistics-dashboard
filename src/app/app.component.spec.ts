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
import { BehaviorSubject } from 'rxjs';
import { APIService, ClickService } from './_services';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing';
import { OverviewComponent } from './overview';
import { MockAPIService } from './_mocked';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let clicks: ClickService;
  let location: Location;

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
    component = fixture.componentInstance;

    component.consentContainer = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      clear: (): void => {},
      createComponent: () => {
        return {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          setInput: () => void {}
        };
      }
    } as unknown as ViewContainerRef;

    clicks = TestBed.inject(ClickService);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should listen for document clicks', fakeAsync(() => {
    spyOn(clicks.documentClickedTarget, 'next');
    const el = fixture.debugElement.query(By.css('*'));
    el.nativeElement.click();
    tick(1);
    expect(clicks.documentClickedTarget.next).toHaveBeenCalled();
    component.documentClick({ target: {} as unknown as HTMLElement });
    expect(clicks.documentClickedTarget.next).toHaveBeenCalledTimes(2);
  }));

  it('should listen for history navigation', fakeAsync(() => {
    expect(component.lastSetContentTierZeroValue).toBeFalsy();
    component.buildForm();

    // trigger location change does nothing
    component.updateLocation();
    expect(component.lastSetContentTierZeroValue).toBeFalsy();

    component.landingComponentRef = {
      isLoading: true
    } as unknown as LandingComponent;
    expect(component.lastSetContentTierZeroValue).toBeFalsy();

    component.updateLocation();
    expect(component.lastSetContentTierZeroValue).toBeFalsy();

    // trigger location change with different value
    const ctrl = component.getCtrlCTZero();
    ctrl.setValue(true);

    tick(1);
    expect(component.lastSetContentTierZeroValue).toBeTruthy();
    ctrl.setValue(false);

    tick(1);
    expect(component.lastSetContentTierZeroValue).toBeFalsy();

    // trigger location change with different value
    location.go('/');

    tick(1);
    expect(component.lastSetContentTierZeroValue).toBeFalsy();
  }));

  it('should handle the location pop-state', () => {
    const ps = {
      url: '?content-tier-zero=true'
    } as unknown as PopStateEvent;

    component.buildForm();

    component.landingComponentRef = {
      isLoading: false
    } as unknown as LandingComponent;

    expect(component.lastSetContentTierZeroValue).toBeFalsy();
    component.handleLocationPopState(ps);
    fixture.detectChanges();
    expect(component.lastSetContentTierZeroValue).toBeTruthy();
  });

  it('should load the landing data', fakeAsync(() => {
    component.landingComponentRef = {
      isLoading: true
    } as unknown as LandingComponent;
    expect(component.landingComponentRef.isLoading).toBeTruthy();
    expect(component.landingComponentRef.landingData).toBeFalsy();
    component.buildForm();
    component.loadLandingData(false);
    tick(1);
    expect(component.landingComponentRef.isLoading).toBeFalsy();
    expect(component.landingComponentRef.landingData).toBeTruthy();
  }));

  it('should handle the outlet load', () => {
    expect(component.showPageTitle).toBeFalsy();

    spyOn(component, 'loadLandingData');

    component.onOutletLoaded(new LandingComponent());

    expect(component.showPageTitle).toBeTruthy();
    expect(component.loadLandingData).toHaveBeenCalled();

    component.onOutletLoaded({} as unknown as OverviewComponent);
    expect(component.showPageTitle).toBeFalsy();
    expect(component.loadLandingData).toHaveBeenCalledTimes(1);

    component.onOutletLoaded(new LandingComponent());
    expect(component.showPageTitle).toBeTruthy();
    expect(component.loadLandingData).toHaveBeenCalledTimes(1);

    expect(component.lastSetContentTierZeroValue).toBeFalsy();
    component.lastSetContentTierZeroValue = true;

    component.onOutletLoaded(new LandingComponent());
    expect(component.showPageTitle).toBeTruthy();
    expect(component.loadLandingData).toHaveBeenCalledTimes(2);
  });
});

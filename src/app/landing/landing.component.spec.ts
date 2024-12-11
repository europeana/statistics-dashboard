import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockAPIService,
  mockCountryData,
  mockTargetMetaData
} from '../_mocked';
import { APIService } from '../_services';

import { TargetFieldName } from '../_models';

import { BarComponent } from '../chart';
import { LandingComponent } from '.';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        LandingComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        {
          provide: APIService,
          useClass: MockAPIService
        }
      ]
    }).compileComponents();
  };

  beforeEach(waitForAsync(() => {
    configureTestBed();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have data', () => {
    expect(component.hasLandingData()).toBeFalsy();
    expect(component.mapData).toBeFalsy();

    component.landingData = { contentTier: [] };

    expect(component.hasLandingData()).toBeTruthy();
    expect(component.mapData).not.toBeFalsy();
    expect(component.mapData.length).toBeFalsy();

    component.landingData = {
      contentTier: [],
      country: [{ name: 'IT', percent: 3, value: 400 }]
    };
    expect(component.hasLandingData()).toBeTruthy();
    expect(component.mapData.length).toBeTruthy();
  });

  it('should refresh the charts when the data changes', () => {
    spyOn(component, 'refreshCharts');
    component.landingData = { contentTier: [], country: [] };
    fixture.detectChanges();
    expect(component.refreshCharts).toHaveBeenCalled();
  });

  it('should refresh the charts', fakeAsync(() => {
    let mockChartRefreshed = false;
    let mockChartRemoved = false;

    const mockCharts = {
      length: 3,
      toArray: () =>
        [1, 2, 3].map(() => {
          return {
            removeAllSeries: () => {
              mockChartRemoved = true;
            },
            ngAfterViewInit: () => {
              mockChartRefreshed = true;
            }
          } as unknown as BarComponent;
        })
    } as unknown as QueryList<BarComponent>;

    component.barCharts = undefined;
    component.refreshCharts();
    tick(1);

    expect(mockChartRefreshed).toBeFalsy();
    expect(mockChartRemoved).toBeFalsy();

    component.barCharts = mockCharts;
    component.refreshCharts();
    tick(1);

    expect(mockChartRefreshed).toBeTruthy();
    expect(mockChartRemoved).toBeTruthy();
  }));

  it('should build the derived series', () => {
    expect(Object.keys(component.allProgressSeries).length).toBeFalsy();
    component.countryData = mockCountryData;
    component.targetMetaData = mockTargetMetaData;
    component.buildDerivedSeries();
    expect(Object.keys(component.allProgressSeries).length).toBeTruthy();

    expect(component.allProgressSeries[TargetFieldName.THREE_D].length).toEqual(
      2
    );
    expect(component.allProgressSeries[TargetFieldName.HQ].length).toEqual(2);
    expect(component.allProgressSeries[TargetFieldName.TOTAL].length).toEqual(
      2
    );
  });

  it('should sort the derived series', () => {
    component.countryData = mockCountryData;
    component.targetMetaData = mockTargetMetaData;
    component.buildDerivedSeries();

    const testSeries = component.allProgressSeries[TargetFieldName.THREE_D][0];

    expect(testSeries.length).toEqual(4);
    expect(testSeries[0].id).toEqual('FR');
    expect(testSeries[1].id).toEqual('IT');
    expect(testSeries[2].id).toEqual('MT');
    expect(testSeries[3].id).toEqual('PT');

    component.sortDerivedSeries();

    expect(testSeries[0].id).toEqual('IT');
    expect(testSeries[1].id).toEqual('FR');
  });
});

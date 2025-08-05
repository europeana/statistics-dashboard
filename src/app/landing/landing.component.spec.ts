import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as am4core from '@amcharts/amcharts4/core';

import {
  MockAPIService,
  mockCountryData,
  MockMapComponent,
  mockTargetMetaData
} from '../_mocked';
import { APIService } from '../_services';
import { TargetFieldName, VisibleHeatMap } from '../_models';
import { BarComponent, MapComponent } from '../chart';
import { LandingComponent } from '.';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

class SVGPathElement extends HTMLElement {}
window['SVGPathElement'] = SVGPathElement as any;

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let api: APIService;

  const mockLandingData = {
    contentTier: [],
    country: [{ name: 'IT', percent: 3, value: 400 }]
  };

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule, LandingComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        {
          provide: APIService,
          useClass: MockAPIService
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .overrideComponent(LandingComponent, {
        remove: { imports: [MapComponent] },
        add: { imports: [MockMapComponent] }
      })
      .compileComponents();
    api = TestBed.get(APIService);
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

    component.landingData = mockLandingData;
    expect(component.hasLandingData()).toBeTruthy();
    expect(component.mapData.length).toBeTruthy();
  });

  it('should refresh the charts when the data changes', () => {
    const spyRefreshCharts = jest.spyOn(component, 'refreshCharts');
    component.landingData = { contentTier: [], country: [] };
    fixture.detectChanges();
    expect(spyRefreshCharts).toHaveBeenCalled();
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

  it('should override the derived series', () => {
    component.countryData = mockCountryData;
    component.targetMetaData = mockTargetMetaData;
    component.buildDerivedSeries();

    const defaultResult = [{ name: 'IT', value: 1 }];
    expect(component.getCountryRows(defaultResult)[0].value).toEqual(1);
    component.visibleHeatMap = { three_d: 0 } as VisibleHeatMap;

    component.getCountryRows(defaultResult);
    expect(component.getCountryRows(defaultResult)[0].value).not.toEqual(1);
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

  it('should look up values in the derived series', () => {
    component.countryData = mockCountryData;
    component.targetMetaData = mockTargetMetaData;
    component.buildDerivedSeries();

    const derivedValue = 12300;

    expect(
      component.allProgressSeries[TargetFieldName.THREE_D][0][1].id
    ).toEqual('IT');
    expect(
      component.allProgressSeries[TargetFieldName.THREE_D][0][1].value
    ).toEqual(derivedValue);
    expect(
      component.getDerivedSeriesValue(TargetFieldName.THREE_D, 0, 'IT')
    ).toEqual(derivedValue);

    expect(
      component.getDerivedSeriesValue(TargetFieldName.THREE_D, 0, 'XXX')
    ).toEqual(0);
  });

  it('should handle clicks on the menu map opener', () => {
    expect(component.mapMenuIsOpen).toBeFalsy();
    component.mapMenuOpenerClicked();
    expect(component.mapMenuIsOpen).toBeTruthy();
    component.mapMenuOpenerClicked();
    expect(component.mapMenuIsOpen).toBeFalsy();
  });

  it('should close the map section', () => {
    component.mapChart = {
      countryClick: jest.fn()
    } as unknown as MapComponent;
    component.closeMapSelection();
    expect(component.mapChart.countryClick).toHaveBeenCalled();
  });

  it('should close the map menu, refocussing the opener', () => {
    component.layerOpener = {
      nativeElement: {
        focus: jest.fn()
      }
    } as unknown as ElementRef;

    component.mapMenuIsOpen = true;
    component.closeMapMenu();
    expect(component.mapMenuIsOpen).toBeFalsy();
    expect(component.layerOpener.nativeElement.focus).toHaveBeenCalled();

    component.closeMapMenu();
    expect(component.layerOpener.nativeElement.focus).toHaveBeenCalledTimes(1);
  });

  it('should tap the target data load', () => {
    const spyGetTargetMetaData = jest.spyOn(api, 'getTargetMetaData');
    const fnCallback = jest.fn();

    component.tapTargetDataLoad(TargetFieldName.TOTAL, fnCallback);
    expect(spyGetTargetMetaData).toHaveBeenCalled();
    expect(fnCallback).toHaveBeenCalled();

    component.tapTargetDataLoad();
    expect(spyGetTargetMetaData).toHaveBeenCalledTimes(1);

    component.tapTargetDataLoad(TargetFieldName.TOTAL, fnCallback);
    expect(spyGetTargetMetaData).toHaveBeenCalledTimes(1);
    expect(fnCallback).toHaveBeenCalledTimes(2);
  });

  it('should tap the country data load', () => {
    const fnCallback = jest.fn();

    const spyGetCountryData = jest.spyOn(api, 'getCountryData');

    component.tapCountryDataLoad(fnCallback);
    expect(spyGetCountryData).toHaveBeenCalledTimes(1);
    expect(fnCallback).toHaveBeenCalled();

    expect(component.countryData).toBeTruthy();

    component.tapCountryDataLoad();
    expect(spyGetCountryData).toHaveBeenCalledTimes(1);

    component.tapCountryDataLoad(fnCallback);
    expect(spyGetCountryData).toHaveBeenCalledTimes(1);
    expect(fnCallback).toHaveBeenCalledTimes(2);
  });

  it('should prefix the class', () => {
    const name = 'abc';
    expect(component.prefixClass(name)).toEqual(`help-${name}`);
  });

  it('should handle the country being set', () => {
    const spyTapCountryDataLoad = jest.spyOn(component, 'tapCountryDataLoad');
    expect(component.singleCountryMode).toBeFalsy();
    component.onMapCountrySet(true);
    expect(component.singleCountryMode).toBeTruthy();
    expect(spyTapCountryDataLoad).toHaveBeenCalled();
    expect(component.targetExpanded).toBeFalsy();

    component.visibleHeatMap = { three_d: 0 } as VisibleHeatMap;
    component.onMapCountrySet(true);
    expect(spyTapCountryDataLoad).toHaveBeenCalledTimes(2);
    expect(component.targetExpanded).toEqual(TargetFieldName.THREE_D);
  });

  it('should clear the heatmap', () => {
    component.mapChart = {
      colourSchemeDefault: {
        base: { hex: '#fffff' } as am4core.Color,
        highlight: { hex: '#fffff' } as am4core.Color,
        outline: { hex: '#fffff' } as am4core.Color
      },
      setMapPercentMode: jest.fn()
    } as unknown as MapComponent;

    component.clearHeatmap();
  });

  it('should show the heat map', () => {
    component.landingData = mockLandingData;

    component.countryData = mockCountryData;
    component.targetMetaData = mockTargetMetaData;

    const colour = '#ffffff' as unknown as am4core.Color;
    component.mapChart = {
      mapData: [],
      setMapPercentMode: jest.fn(),
      colourSchemeTargets: {
        total: [
          {
            base: colour,
            highlight: '',
            outline: ''
          }
        ]
      }
    } as unknown as MapComponent;

    expect(component.mapChart.colourScheme).toBeFalsy();
    expect(component.mapChart.colourScheme).toBeFalsy();

    component.showHeatmap(TargetFieldName.TOTAL, 0);

    expect(component.mapChart.colourScheme).toBeTruthy();
    expect(component.mapChart.colourScheme.base).toEqual(colour);

    component.targetExpanded = undefined;
    component.singleCountryMode = true;

    component.showHeatmap(TargetFieldName.TOTAL, 0);

    expect(component.targetExpanded).toEqual(TargetFieldName.TOTAL);
  });
});

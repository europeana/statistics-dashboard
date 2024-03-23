import { CUSTOM_ELEMENTS_SCHEMA, QueryList } from '@angular/core';
import {
  ComponentFixture,
  //fakeAsync,
  TestBed,
  //tick,
  waitForAsync
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { APIService } from '../_services';
import { MockAPIService, MockLineComponent } from '../_mocked';
import { BarComponent, LineComponent } from '../chart';

import { CountryComponent } from '.';

fdescribe('CountryComponent', () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      imports: [CountryComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
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
  };

  beforeEach(waitForAsync(() => {
    configureTestBed();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
  it('should have data', () => {
    expect(component.hasData()).toBeFalsy();
    component.landingData = { contentTier: [] };
    expect(component.hasData()).toBeTruthy();
  });

  it('should refresh the charts when the data changes', () => {
    spyOn(component, 'refreshCharts');
    component.landingData = { contentTier: [] };
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
  */
});

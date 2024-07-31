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
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { APIService } from '../_services';
import { MockAPIService, MockLineComponent } from '../_mocked';
import { TargetFieldName } from '../_models';
import { BarComponent, LineComponent } from '../chart';

import { CountryComponent } from '.';

describe('CountryComponent', () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      imports: [CountryComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ country: 'France' }) }
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

  let appRef: ApplicationRef;

  beforeEach(waitForAsync(() => {
    configureTestBed();
    appRef = TestBed.get(ApplicationRef) as ApplicationRef;
  }));

  beforeEach(() => {
    const header = {
      activeCountry: 'France',
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

    component.headerRef = header;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    component.setCountryToParam('France');
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
});

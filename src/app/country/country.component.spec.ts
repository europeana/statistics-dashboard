import {
  ApplicationRef,
  ComponentRef,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { APIService } from '../_services';
import { MockAPIService, MockLineComponent } from '../_mocked';
import { LineComponent } from '../chart';

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
      }
    };

    appRef.components.push({
      header: header
    } as unknown as ComponentRef<unknown>);

    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;

    component.headerRef = header as unknown as ElementRef;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the appendice', () => {
    expect(component.appendiceExpanded).toBeFalsy();
    component.toggleAppendice();
    expect(component.appendiceExpanded).toBeTruthy();
    component.toggleAppendice();
    expect(component.appendiceExpanded).toBeFalsy();
  });

  it('should create', () => {
    const datum = {
      date: new Date().toISOString(),
      three_d: '111',
      hq: '222',
      total: '333',
      label: 'last'
    };
    component.countryData = {
      FR: [datum]
    };
    component.setCountryToParam('France');
    expect(component.latestCountryData).toEqual(datum);
  });
});

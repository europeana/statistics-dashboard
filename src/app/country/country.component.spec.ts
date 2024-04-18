import {
  ApplicationRef,
  ComponentRef,
  CUSTOM_ELEMENTS_SCHEMA
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

  beforeEach(waitForAsync(() => {
    configureTestBed();
  }));

  beforeEach(() => {
    const appRef = TestBed.get(ApplicationRef) as ApplicationRef;
    appRef.components.push({
      header: {
        activeCountry: 'France'
      }
    } as unknown as ComponentRef<unknown>);

    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

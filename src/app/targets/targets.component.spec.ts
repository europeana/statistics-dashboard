import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { APIService } from '../_services';
import { MockAPIService, MockLineComponent } from '../_mocked';
import { LineComponent } from '../chart';

import { TargetsComponent } from '.';

describe('TargetsComponent', () => {
  let component: TargetsComponent;
  let fixture: ComponentFixture<TargetsComponent>;

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      imports: [TargetsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: APIService, useClass: MockAPIService }]
    })
      .overrideComponent(TargetsComponent, {
        remove: { imports: [LineComponent] },
        add: { imports: [MockLineComponent] }
      })
      .compileComponents();
  };

  beforeEach(waitForAsync(() => {
    configureTestBed();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

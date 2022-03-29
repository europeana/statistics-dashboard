import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockAPIService, MockAPIServiceErrors } from '../_mocked';
//import { APIService } from '../_services';
import { LandingComponent } from '.';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  const configureTestBed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      /*
      providers: [
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        }
      ],
      */
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  beforeEach(
    waitForAsync(() => {
      configureTestBed();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

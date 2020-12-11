import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MockAPIService, MockAPIServiceErrors } from '../_mocked';
import { DataProviderDatum } from '../_models';
import { APIService } from '../_services';

import { IndexComponent } from './index.component';

describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  const configureTestBed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [IndexComponent],
      providers: [
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        }
      ]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('Normal Operations', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(b4Each);

    it('should show and hide', () => {
      let dataProviderDatum = { name: 'x', providers: [] } as DataProviderDatum;
      component.dataProviderData = [dataProviderDatum];

      expect(dataProviderDatum.providersShowing).toBeFalsy();

      component.showHide(dataProviderDatum, true);
      expect(dataProviderDatum.providersShowing).toBeTruthy();
    });
  });
});

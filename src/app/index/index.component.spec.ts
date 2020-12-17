import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { MockAPIService, MockAPIServiceErrors } from '../_mocked';
import { ProviderDatum } from '../_models';
import { APIService } from '../_services';

import { IndexComponent } from './index.component';

describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  const configureTestBed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
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
      const ProviderDatum = {
        name: 'x',
        providers: []
      } as ProviderDatum;
      component.dataProviderData = [ProviderDatum];

      expect(ProviderDatum.dataProvidersShowing).toBeFalsy();

      component.showHide(ProviderDatum.name, true);
      expect(ProviderDatum.dataProvidersShowing).toBeTruthy();
    });

    it('should set the filter', () => {
      expect(component.filter.toString()).toEqual('/.*/');
      component.setFilter('A');
      expect(component.filter.toString()).toEqual('/A/');
      component.setFilter();
      expect(component.filter.toString()).toEqual('/.*/');
    });

    it('should search', () => {
      expect(component.filter.toString()).toEqual('/.*/');
      component.searchForm.value.searchTerm = 'A';
      component.search();
      expect(component.filter.toString()).toEqual('/A/');
      component.searchForm.value.searchTerm = '';
      component.setFilter();
      expect(component.filter.toString()).toEqual('/.*/');
    });
  });
});

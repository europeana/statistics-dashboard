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

  const getProvderDatum = (): ProviderDatum => {
    return {
      name: 'x',
      dataProviders: []
    } as ProviderDatum;
  };

  describe('Normal Operations', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(b4Each);

    it('should show and hide', () => {
      const providerDatum = getProvderDatum();

      component.dataProviderData = [providerDatum];
      expect(providerDatum.dataProvidersShowing).toBeFalsy();

      component.showHide(providerDatum.name, true);
      expect(providerDatum.dataProvidersShowing).toBeTruthy();

      component.showHide(providerDatum.name, false);
      expect(providerDatum.dataProvidersShowing).toBeFalsy();

      spyOn(component, 'setDataProviders');
      component.showHide(providerDatum.name, true);

      expect(component.setDataProviders).not.toHaveBeenCalled();

      providerDatum.dataProviders = null;
      component.showHide(providerDatum.name, true);
      expect(component.setDataProviders).toHaveBeenCalled();
    });

    it('should trigger a chain load', () => {
      const providerDatum = getProvderDatum();
      spyOn(component, 'chainLoad');
      component.setDataProviders(providerDatum);
      expect(component.chainLoad).not.toHaveBeenCalled();
      component.setDataProviders(providerDatum, true);
      expect(component.chainLoad).toHaveBeenCalled();
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

    it('should reset the search term', () => {
      component.searchForm.value.searchTerm = 'A';
      component.resetSearchTerm();
      expect(component.searchForm.value.searchTerm).toEqual('');
    });

    it('should get the filtered', () => {
      let term = '';
      component.searchForm.value.searchTerm = '';
      component.setFilter(term);

      expect(component.getFiltered()[0].dataProviders.length).toEqual(4);
      term = 'XXX';
      component.searchForm.value.searchTerm = term;
      component.setFilter(term);
      expect(component.getFiltered()[0].dataProviders.length).toEqual(0);

      term = 'A';
      component.searchForm.value.searchTerm = term;

      component.setFilter(term);
      expect(component.getFiltered()[0].dataProviders.length).toEqual(2);

      term = 'B';
      component.searchForm.value.searchTerm = term;

      component.setFilter(term);
      expect(component.getFiltered()[0].dataProviders.length).toEqual(1);

      component.dataProviderData[0].dataProviders = undefined;
      term = 'XXX';
      component.searchForm.value.searchTerm = term;
      component.setFilter(term);
      expect(component.getFiltered()[0].dataProviders).toBeFalsy();
    });
  });
});

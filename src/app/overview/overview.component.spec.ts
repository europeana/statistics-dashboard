import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import {
  DatatableComponent,
  DatatableRowDetailDirective
} from '@swimlane/ngx-datatable';

import {
  createMockPipe,
  MockAPIData,
  MockAPIService,
  MockAPIServiceErrors,
  MockExportCSVService
} from '../_mocked';
import { ExportType, NameLabel } from '../_models';
import { APIService, ExportCSVService } from '../_services';
import { BarComponent } from '../chart';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  const contentTierNameLabels = [
    { name: '0', label: '0' },
    { name: '1', label: '1' },
    { name: '2', label: '2' }
  ];
  const tickTime = 1;
  let exportCSV: ExportCSVService;
  const params: BehaviorSubject<Params> = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({ COUNTRY: 'Italy' } as Params);

  let api: APIService;

  const configureTestBed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: 'data/contentTier', component: OverviewComponent },
          { path: 'data/COUNTRY', component: OverviewComponent },
          { path: 'data/COUNTRY?TYPE=TEXT', component: OverviewComponent },
          {
            path: 'data/COUNTRY?TYPE=TEXT&TYPE=VIDEO',
            component: OverviewComponent
          },
          { path: 'data/TYPE', component: OverviewComponent }
        ])
      ],
      declarations: [OverviewComponent, createMockPipe('renameApiFacet')],
      providers: [
        { provide: ExportCSVService, useClass: MockExportCSVService },
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        },
        {
          provide: ActivatedRoute,
          useValue: { params: params, queryParams: queryParams }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    api = TestBed.inject(APIService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    exportCSV = TestBed.inject(ExportCSVService);
    component.form.get('facetParameter').setValue('contentTier');
    component.isShowingSearchList = false;
    fixture.detectChanges();
  };

  const setFilterValue1 = (group: string): void => {
    component.form.addControl(group, new FormBuilder().group({}));
    component.addOrUpdateFilterControls(group, contentTierNameLabels);
    component.form.get(`${group}.1`).setValue(true);
  };

  describe('Route Parameter', () => {
    beforeEach(async(() => {
      configureTestBed(false);
    }));

    beforeEach(() => {
      b4Each();
      params.next({ facet: 'COUNTRY' });
    });

    it('should poll on initialisation', fakeAsync(() => {
      component.ngOnInit();
      tick(1);
      const ctrlFacet = component.form.controls.facetParameter as FormControl;
      expect(ctrlFacet.value).toBe('COUNTRY');
      expect(component.allProcessedFacetData).toBeTruthy();
      component.ngOnDestroy();
    }));
  });

  describe('Normal Operations', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(() => {
      b4Each();
    });

    it('should load selectively', fakeAsync(() => {
      spyOn(api, 'loadAPIData').and.callThrough();

      params.next({ facet: 'COUNTRY' });
      tick(1);
      fixture.detectChanges();
      expect(api.loadAPIData).toHaveBeenCalledTimes(1);

      params.next({ facet: 'TYPE' });
      tick(1);
      fixture.detectChanges();
      expect(api.loadAPIData).toHaveBeenCalledTimes(1);

      queryParams.next({ TYPE: ['SOUND', 'VIDEO'] });
      tick(1);
      fixture.detectChanges();

      expect(api.loadAPIData).toHaveBeenCalledTimes(2);

      component.ngOnDestroy();
    }));

    it('should extract data as a percent', fakeAsync(() => {
      const data = Object.assign({}, MockAPIData);
      expect(component.allProcessedFacetData).toBeFalsy();
      component.processResult(data);
      expect(component.allProcessedFacetData).toBeTruthy();
      expect(component.allProcessedFacetData[0].fields[0].percent).toBeTruthy();
    }));

    it('should find the facet index', fakeAsync(() => {
      component.beginPolling();
      tick(1);
      component.facetConf.forEach((facet: string, i: number) => {
        expect(
          component.findFacetIndex(facet, component.allProcessedFacetData)
        ).toEqual(i);
      });
      component.ngOnDestroy();
    }));

    it('should get the select options', fakeAsync(() => {
      component.beginPolling();
      tick(1);
      component.facetConf.forEach((facet: string) => {
        expect(
          component.getFilterOptions(facet, component.allProcessedFacetData)
            .length
        ).toBeGreaterThan(0);
      });
      component.ngOnDestroy();
    }));

    it('should get the url for a dataset', () => {
      expect(component.getUrl().indexOf('edm_datasetName')).toEqual(-1);
      component.form.get('datasetName').setValue('XXX');
      expect(component.getUrl().indexOf('edm_datasetName')).toBeTruthy();
    });

    it('should get the formatted dataset name param', () => {
      const testVal = 'XXX';
      expect(component.getFormattedDatasetNameParam().length).toBeFalsy();
      component.form.get('datasetName').setValue(testVal);
      expect(component.getFormattedDatasetNameParam().length).toBeTruthy();
      expect(component.getFormattedDatasetNameParam()).toEqual(
        `edm_datasetName:${testVal}`
      );
    });

    it('should get the formatted date param', () => {
      expect(component.getFormattedDateParam().length).toBeFalsy();
      component.form.get('dateFrom').setValue(component.today);
      expect(component.getFormattedDateParam().length).toBeFalsy();
      component.form.get('dateTo').setValue(component.today);
      expect(component.getFormattedDateParam().length).toBeTruthy();
    });

    it('should get the formatted content tier param', () => {
      const fmt = (s: string): string => {
        return `&qf=contentTier:(${encodeURIComponent(s)})`;
      };

      const expectOneToFour = fmt('1 OR 2 OR 3 OR 4');
      const expectZeroToFour = fmt('0 OR 1 OR 2 OR 3 OR 4');

      expect(component.getFormattedContentTierParam()).toEqual(expectOneToFour);

      component.form.get('contentTierZero').setValue(true);

      expect(component.getFormattedContentTierParam()).toEqual(
        expectZeroToFour
      );

      component.addOrUpdateFilterControls('contentTier', contentTierNameLabels);
      component.form.get(`contentTier.0`).setValue(true);

      expect(component.getFormattedContentTierParam()).toEqual(fmt('0'));

      component.form.get(`contentTier.1`).setValue(true);
      expect(component.getFormattedContentTierParam()).toEqual(fmt('0 OR 1'));

      component.form.get(`contentTier.0`).setValue(false);
      expect(component.getFormattedContentTierParam()).toEqual(fmt('1'));
    });

    it('should add menu checkboxes', () => {
      const testName = 'test';
      const form = component.form;

      contentTierNameLabels.forEach((nl: NameLabel) => {
        expect(form.get(`${testName}.${nl.name}`)).toBeFalsy();
      });

      form.addControl(testName, new FormBuilder().group({}));

      component.addOrUpdateFilterControls(testName, contentTierNameLabels);

      contentTierNameLabels.forEach((nl: NameLabel) => {
        expect(form.get(`${testName}.${nl.name}`)).toBeTruthy();
      });
    });

    it('should tell if checkbox valueshave been set', () => {
      expect(component.isFilterApplied()).toBeFalsy();
      expect(component.isFilterApplied('TYPE')).toBeFalsy();
      expect(component.isFilterApplied('FAKE')).toBeFalsy();
      setFilterValue1('TYPE');
      expect(component.isFilterApplied('TYPE')).toBeTruthy();
      expect(component.isFilterApplied()).toBeTruthy();
    });

    it('should get the set checkbox values', () => {
      let selected = component.getSetCheckboxValues('filterContentTier');
      expect(selected.length).toEqual(0);

      component.form.addControl(
        'filterContentTier',
        new FormBuilder().group({})
      );
      component.addOrUpdateFilterControls(
        'filterContentTier',
        contentTierNameLabels
      );

      component.form.get('filterContentTier.1').setValue(true);
      selected = component.getSetCheckboxValues('filterContentTier');
      expect(selected.length).toEqual(1);

      component.form.get('filterContentTier.2').setValue(true);
      selected = component.getSetCheckboxValues('filterContentTier');
      expect(selected.length).toEqual(2);
    });

    it('should handle the to-date change', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(component.dateFrom.nativeElement.getAttribute('max')).toEqual(
        component.today
      );

      component.form.value.dateTo = yesterday.toISOString();
      component.dateChange(false);
      expect(component.dateFrom.nativeElement.getAttribute('max')).toEqual(
        yesterday.toISOString()
      );

      component.form.value.dateTo = null;
      component.dateChange(false);
      expect(component.dateFrom.nativeElement.getAttribute('max')).toEqual(
        component.today
      );
    });

    it('should validate dates', () => {
      component.form.value.dateFrom = null;
      component.form.value.dateTo = null;

      const dateFrom = component.form.controls.dateFrom as FormControl;
      const dateTo = component.form.controls.dateTo as FormControl;

      expect(component.validateDateGeneric(dateFrom, 'dateFrom')).toBeFalsy();
      expect(component.validateDateGeneric(dateTo, 'dateTo')).toBeFalsy();

      const yesterYear = new Date(component.yearZero);
      const yesterday = new Date();
      const today = new Date(component.today);
      const tomorrow = new Date(component.today);

      yesterday.setDate(yesterday.getDate() - 1);
      yesterYear.setDate(yesterYear.getDate() - 1);
      tomorrow.setDate(tomorrow.getDate() + 1);

      dateFrom.setValue(yesterYear.toISOString());
      expect(component.validateDateGeneric(dateFrom, 'dateFrom')).toBeTruthy();

      dateFrom.setValue('');
      expect(component.validateDateGeneric(dateFrom, 'dateFrom')).toBeFalsy();

      dateFrom.setValue(tomorrow.toISOString());
      expect(component.validateDateGeneric(dateFrom, 'dateFrom')).toBeTruthy();

      dateFrom.setValue('');
      expect(component.validateDateGeneric(dateFrom, 'dateFrom')).toBeFalsy();

      // comparison

      dateFrom.setValue(today.toISOString());
      expect(component.validateDateGeneric(dateFrom, 'dateFrom')).toBeFalsy();

      dateTo.setValue(yesterday.toISOString());
      expect(component.validateDateGeneric(dateFrom, 'dateFrom')).toBeTruthy();
      expect(component.validateDateGeneric(dateTo, 'dateTo')).toBeTruthy();

      dateTo.setValue(today.toISOString());
      expect(component.validateDateGeneric(dateFrom, 'dateFrom')).toBeFalsy();
      expect(component.validateDateGeneric(dateTo, 'dateTo')).toBeFalsy();

      dateFrom.setValue(tomorrow.toISOString());
      expect(component.validateDateGeneric(dateTo, 'dateTo')).toBeTruthy();
    });

    it('should enable the filters', fakeAsync(() => {
      component.beginPolling();
      tick(tickTime);
      component.filterStates['COUNTRY'].disabled = true;
      component.enableFilters();
      expect(component.filterStates['COUNTRY'].disabled).toBeFalsy();
      component.ngOnDestroy();
    }));

    it('should clear the filters', () => {
      setFilterValue1('TYPE');
      expect(component.getSetCheckboxValues('TYPE').length).toBeTruthy();
      component.clearFilter();
      expect(component.getSetCheckboxValues('TYPE').length).toBeFalsy();
      setFilterValue1('TYPE');
      expect(component.getSetCheckboxValues('TYPE').length).toBeTruthy();
      component.clearFilter('RIGHTS');
      expect(component.getSetCheckboxValues('TYPE').length).toBeTruthy();
      component.clearFilter('TYPE');
      expect(component.getSetCheckboxValues('TYPE').length).toBeFalsy();
    });

    it('should toggle row expansion', () => {
      const spy = jasmine.createSpy();
      component.dataTable = {
        rowDetail: {
          toggleExpandRow: spy
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any as DatatableComponent;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component.toggleExpandRow({} as any as DatatableRowDetailDirective);
      expect(spy).toHaveBeenCalled();
    });

    it('should toggle the download options', () => {
      component.downloadOptionsOpen = true;
      component.toggleDownloadOptions();
      expect(component.downloadOptionsOpen).toBeFalsy();
      component.toggleDownloadOptions();
      expect(component.downloadOptionsOpen).toBeTruthy();
    });

    it('should close the display options', () => {
      component.downloadOptionsOpen = true;
      component.closeDisplayOptions();
      expect(component.downloadOptionsOpen).toBeFalsy();
    });

    it('should close the filters', fakeAsync(() => {
      component.beginPolling();
      tick(tickTime);
      const setAllTrue = (): void => {
        Object.keys(component.filterStates).forEach((s: string) => {
          component.filterStates[s].visible = true;
        });
      };

      const checkAllValue = (tf: boolean): void => {
        let allVal = true;
        Object.keys(component.filterStates).forEach((s: string) => {
          if (component.filterStates[s].visible != tf) {
            allVal = false;
          }
        });
        expect(allVal).toBeTruthy();
      };

      setAllTrue();
      checkAllValue(true);
      component.closeFilters();
      checkAllValue(false);
      setAllTrue();

      const exception = 'TYPE';
      checkAllValue(true);
      component.closeFilters(exception);
      expect(component.filterStates[exception].visible).toBeTruthy();
      component.ngOnDestroy();
    }));
  });

  describe('Url Generation', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(() => {
      b4Each();
      component.form.value.facetParameter = 'contentTier';
    });

    it('should include the facet selection', () => {
      [2, 3, 4].forEach((qfVal: number) => {
        const wrongVal = qfVal * 3;
        expect(component.getUrlRow(`${qfVal}`).indexOf(`${wrongVal}`)).toEqual(
          -1
        );
        expect(
          component.getUrlRow(`${qfVal}`).indexOf(`${qfVal}`)
        ).toBeGreaterThan(-1);
      });

      ['video', 'text', '3d', 'audio'].forEach((qfVal: 'string') => {
        const wrongVal = 'hologram';
        expect(component.getUrlRow(qfVal).indexOf(wrongVal)).toEqual(-1);
        expect(component.getUrlRow(qfVal).indexOf(qfVal)).toBeGreaterThan(-1);
      });
    });

    it('should include contentTierZero', () => {
      const ctZeroDetect = 'contentTier:(0';
      expect(component.getUrlRow('1').indexOf(ctZeroDetect)).toEqual(-1);
      component.form.value.contentTierZero = true;
      expect(component.getUrlRow('X').indexOf(ctZeroDetect)).toBeGreaterThan(
        -1
      );
    });

    it('should include the date range', () => {
      const dateDetect = new Date().toISOString();
      expect(component.getUrlRow('X').indexOf(dateDetect)).toEqual(-1);
      component.form.value.dateFrom = dateDetect;
      component.form.value.dateTo = dateDetect;
      expect(component.getUrlRow('X').indexOf(dateDetect)).toBeGreaterThan(-1);
    });
  });

  describe('Date handling', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(() => {
      b4Each();
    });

    it('should set the min-max attributes', () => {
      expect(component.dateTo.nativeElement.getAttribute('min')).toBeFalsy();

      component.form.value.dateFrom = component.today;
      component.dateChange(true);
      expect(component.dateTo.nativeElement.getAttribute('min')).toBeTruthy();
      expect(component.dateTo.nativeElement.getAttribute('min')).not.toEqual(
        component.yearZero
      );

      component.form.value.dateFrom = null;
      component.dateChange(true);
      expect(component.dateTo.nativeElement.getAttribute('min')).toEqual(
        component.yearZero
      );
    });

    it('should clear validation errors for the corresponding field', () => {
      const tomorrow = new Date(component.today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // set dateTo to something invalid
      component.form.controls.dateTo.setValue(tomorrow.toISOString());

      expect(component.form.controls.dateTo.errors).toBeTruthy();

      spyOn(component.form.controls.dateTo, 'updateValueAndValidity');
      component.dateChange(true);
      expect(
        component.form.controls.dateTo.updateValueAndValidity
      ).toHaveBeenCalled();

      component.form.reset();

      // set dateFrom to something invalid
      component.form.controls.dateFrom.setValue(tomorrow.toISOString());

      expect(component.form.controls.dateFrom.errors).toBeTruthy();

      spyOn(component.form.controls.dateFrom, 'updateValueAndValidity');
      component.dateChange(false);
      expect(
        component.form.controls.dateFrom.updateValueAndValidity
      ).toHaveBeenCalled();
    });
  });

  describe('Exports', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(() => {
      b4Each();
      component.barChart = {
        getSvgData: () => {
          return new Promise((resolve) => {
            resolve('svg');
          });
        }
      } as unknown as BarComponent;
    });

    it('should export CSV', fakeAsync(() => {
      component.beginPolling();
      tick(tickTime);
      spyOn(exportCSV, 'download');
      const elDownload = document.createElement('a');
      document.body.append(elDownload);
      component.downloadAnchor = { nativeElement: elDownload } as ElementRef;
      component.export(ExportType.CSV);
      expect(exportCSV.download).toHaveBeenCalled();
      component.ngOnDestroy();
    }));

    it('should export PDF', () => {
      spyOn(component.barChart, 'getSvgData').and.callThrough();
      component.export(ExportType.PDF);
      expect(component.barChart.getSvgData).toHaveBeenCalled();
    });
  });

  describe('No data', () => {
    beforeEach(async(() => {
      configureTestBed(true);
    }));

    beforeEach(() => {
      b4Each();
    });

    it('should have no result', fakeAsync(() => {
      expect(component.totalResults).toEqual(0);
      component.beginPolling();
      tick(1);
      expect(component.totalResults).toEqual(0);
      component.ngOnDestroy();
    }));
  });

  describe('Polling', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(() => {
      b4Each();
    });

    it('should invoke the provided callback', fakeAsync(() => {
      const spy = jasmine.createSpy();
      component.beginPolling(spy);
      tick(tickTime);
      expect(spy).toHaveBeenCalled();
      component.ngOnDestroy();
    }));
  });
});

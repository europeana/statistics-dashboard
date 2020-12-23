import { ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import {
  DatatableComponent,
  DatatableRowDetailDirective
} from '@swimlane/ngx-datatable';

import {
  createMockPipe,
  MockAPIService,
  MockAPIServiceErrors,
  MockExportCSVService,
  MockExportPDFService
} from '../_mocked';
import { ExportType } from '../_models';
import { APIService, ExportCSVService, ExportPDFService } from '../_services';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  const testOptions = ['option_1', 'option_2'];
  const tickTime = 1;
  let exportCSV: ExportCSVService;
  let exportPDF: ExportPDFService;
  let api: APIService;

  const configureTestBed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [OverviewComponent, createMockPipe('renameApiFacet')],
      providers: [
        { provide: ExportCSVService, useClass: MockExportCSVService },
        { provide: ExportPDFService, useClass: MockExportPDFService },
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    exportCSV = TestBed.inject(ExportCSVService);
    exportPDF = TestBed.inject(ExportPDFService);
    api = TestBed.inject(APIService);
    component.form.get('facetParameter').setValue('contentTier');
    component.isShowingSearchList = false;
    fixture.detectChanges();
  };

  const setFilterValue1 = (group: string): void => {
    component.form.addControl(group, new FormBuilder().group({}));
    component.addMenuCheckboxes(group, ['1', '2']);
    component.form.get(`${group}.1`).setValue(true);
  };

  describe('Normal Operations', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(() => {
      b4Each();
    });

    it('should unfix the name', () => {
      expect(component.unfixName('_____')).toEqual('.');
    });

    it('should load data on init', fakeAsync(() => {
      component.beginPolling();
      tick(1);
      expect(component.allFacetData).toBeTruthy();
      component.ngOnDestroy();
    }));

    it('should find the facet index', fakeAsync(() => {
      component.beginPolling();
      tick(1);
      component.facetConf.forEach((facet: string, i: number) => {
        expect(component.findFacetIndex(facet, component.allFacetData)).toEqual(
          i
        );
      });
      component.ngOnDestroy();
    }));

    it('should get the select options', fakeAsync(() => {
      component.beginPolling();
      tick(1);
      component.facetConf.forEach((facet: string) => {
        expect(
          component.getSelectOptions(facet, component.allFacetData).length
        ).toBeGreaterThan(0);
      });
      component.ngOnDestroy();
    }));

    it('should get the url for a row', () => {
      const qfVal = 'contentTier';
      expect(component.getUrlRow(qfVal).indexOf(qfVal)).toBeTruthy();
    });

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

    it('should get the formatted filter param', () => {
      let param = component.getFormattedFilterParam();
      expect(param.length).toBeFalsy();
      setFilterValue1('TYPE');
      param = component.getFormattedFilterParam();
      expect(param.length).toBeTruthy();
      expect(param).toEqual('&qf=TYPE:"1"');
    });

    it('should get the formatted content tier param', () => {
      const fmt = (s: string): string => {
        return `&qf=contentTier:(${encodeURIComponent(s)})`;
      };

      let expected = fmt('1 OR 2 OR 3 OR 4');

      expect(component.getFormattedContentTierParam()).toEqual(expected);

      component.form.get('contentTierZero').setValue(true);
      expected = fmt('0 OR 1 OR 2 OR 3 OR 4');

      expect(component.getFormattedContentTierParam()).toEqual(expected);

      setFilterValue1('filterContentTier');
      expected = fmt('1');
      expect(component.getFormattedContentTierParam()).toEqual(expected);
    });

    it('should add menu checkboxes', () => {
      const testName = 'test';
      const form = component.form;

      testOptions.forEach((s: string) => {
        expect(form.get(`${testName}.${s}`)).toBeFalsy();
      });

      form.addControl(testName, new FormBuilder().group({}));
      component.addMenuCheckboxes(testName, testOptions);

      testOptions.forEach((s: string) => {
        expect(form.get(`${testName}.${s}`)).toBeTruthy();
      });

      component.addMenuCheckboxes(testName, testOptions);

      testOptions.forEach((s: string) => {
        expect(form.get(`${testName}.${s}`)).toBeTruthy();
      });
    });

    it('should tell if checkbox valueshave been set', () => {
      expect(component.getCheckboxValuesPresent()).toBeFalsy();
      expect(component.getCheckboxValuesPresent('TYPE')).toBeFalsy();
      expect(component.getCheckboxValuesPresent('FAKE')).toBeFalsy();
      setFilterValue1('TYPE');
      expect(component.getCheckboxValuesPresent('TYPE')).toBeTruthy();
      expect(component.getCheckboxValuesPresent()).toBeTruthy();
    });

    it('should get the set checkbox values', () => {
      let selected = component.getSetCheckboxValues('filterContentTier');
      expect(selected.length).toEqual(0);

      component.form.addControl(
        'filterContentTier',
        new FormBuilder().group({})
      );
      component.addMenuCheckboxes('filterContentTier', ['1', '2']);

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
      component.menuStates['COUNTRY'].disabled = true;
      component.enableFilters();
      expect(component.menuStates['COUNTRY'].disabled).toBeFalsy();
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

    it('should switch the facet', fakeAsync(() => {
      component.beginPolling();
      tick(tickTime);
      expect(component.menuStates['contentTier'].disabled).toBeTruthy();
      expect(component.menuStates['TYPE'].disabled).toBeFalsy();
      component.switchFacet('TYPE');
      expect(component.menuStates['contentTier'].disabled).toBeFalsy();
      expect(component.menuStates['TYPE'].disabled).toBeTruthy();
      component.ngOnDestroy();
    }));

    it('should determine if a select option is enabled', () => {
      expect(component.selectOptionEnabled('contentTier', '0')).toBeTruthy();
      component.form.get('contentTierZero').setValue(true);
      expect(component.selectOptionEnabled('contentTier', '0')).toBeFalsy();
    });

    it('should toggle row expansion', () => {
      const spy = jasmine.createSpy();
      component.dataTable = ({
        rowDetail: {
          toggleExpandRow: spy
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any) as DatatableComponent;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component.toggleExpandRow(({} as any) as DatatableRowDetailDirective);
      expect(spy).toHaveBeenCalled();
    });

    it('should toggle the filter menu', () => {
      const gName = 'PROVIDER';
      component.addMenuCheckboxes(gName, testOptions);
      expect(component.menuStates[gName].visible).toBeFalsy();
      component.toggleFilterMenu(gName);
      expect(component.menuStates[gName].visible).toBeTruthy();
    });

    it('should toggle the chart options', () => {
      component.downloadOptionsOpen = true;
      component.chartOptionsOpen = true;
      component.toggleChartOptions();
      expect(component.downloadOptionsOpen).toBeFalsy();
      expect(component.chartOptionsOpen).toBeFalsy();
      component.toggleChartOptions();
      expect(component.downloadOptionsOpen).toBeFalsy();
      expect(component.chartOptionsOpen).toBeTruthy();
    });

    it('should toggle the download options', () => {
      component.chartOptionsOpen = true;
      component.downloadOptionsOpen = true;
      component.toggleDownloadOptions();
      expect(component.chartOptionsOpen).toBeFalsy();
      expect(component.downloadOptionsOpen).toBeFalsy();
      component.toggleDownloadOptions();
      expect(component.chartOptionsOpen).toBeFalsy();
      expect(component.downloadOptionsOpen).toBeTruthy();
    });

    it('should close the display options', () => {
      component.chartOptionsOpen = true;
      component.downloadOptionsOpen = true;
      component.closeDisplayOptions();
      expect(component.chartOptionsOpen).toBeFalsy();
      expect(component.downloadOptionsOpen).toBeFalsy();
    });

    it('should extract data as a percent', fakeAsync(() => {
      component.beginPolling();
      tick(tickTime);
      component.extractChartData();
      expect(component.chartData[0].value).toEqual(17050500);
      component.form.value.showPercent = true;
      component.extractChartData();
      expect(component.chartData[0].value).toEqual(50.2);
      component.ngOnDestroy();
    }));

    it('should close the filters', fakeAsync(() => {
      component.beginPolling();
      tick(tickTime);
      const setAllTrue = (): void => {
        Object.keys(component.menuStates).forEach((s: string) => {
          component.menuStates[s].visible = true;
        });
      };

      const checkAllValue = (tf: boolean): void => {
        let allVal = true;
        Object.keys(component.menuStates).forEach((s: string) => {
          if (component.menuStates[s].visible != tf) {
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
      expect(component.menuStates[exception].visible).toBeTruthy();
      component.ngOnDestroy();
    }));

    it('should switch the chart type', () => {
      expect(component.showPie).toBeTruthy();

      component.form.get('chartType').setValue('Bar');
      component.switchChartType();

      expect(component.showPie).toBeFalsy();
      expect(component.showBar).toBeTruthy();

      component.form.get('chartType').setValue('Gauge');
      component.switchChartType();

      expect(component.showBar).toBeFalsy();
      expect(component.showGauge).toBeTruthy();

      component.form.get('chartType').setValue('Pie');
      component.switchChartType();

      expect(component.showPie).toBeTruthy();
      expect(component.showGauge).toBeFalsy();

      component.form.get('chartType').setValue('X');
      component.switchChartType();

      expect(component.showBar).toBeFalsy();
      expect(component.showPie).toBeTruthy();
      expect(component.showGauge).toBeFalsy();
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
    });

    it('should export CSV', () => {
      component.downloadOptionsOpen = true;
      component.export('X' as ExportType);
      expect(component.downloadOptionsOpen).toBeFalsy();
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
      spyOn(exportPDF, 'getChartAsImageUrl').and.callThrough();
      component.export(ExportType.PDF);
      expect(exportPDF.getChartAsImageUrl).toHaveBeenCalled();
    });
  });

  describe('No data', () => {
    beforeEach(async(() => {
      configureTestBed(true);
    }));

    beforeEach(() => {
      b4Each();
    });

    it('should have no result', () => {
      expect(component.totalResults).toEqual(0);
    });
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

    it('should be invoked on facet switch', () => {
      spyOn(component, 'beginPolling').and.callThrough();
      component.switchFacet('TYPE');
      expect(component.beginPolling).toHaveBeenCalled();
    });

    it('should be refreshed', () => {
      spyOn(api, 'loadAPIData').and.callThrough();
      component.refresh();
      expect(api.loadAPIData).not.toHaveBeenCalled();
      component.beginPolling();
      component.refresh();
      expect(api.loadAPIData).toHaveBeenCalled();
    });
  });
});

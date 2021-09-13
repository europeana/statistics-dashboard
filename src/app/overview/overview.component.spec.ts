import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { IsScrollableDirective } from '../_directives/is-scrollable';
import { today } from '../_helpers';
import {
  createMockPipe,
  MockAPIData,
  MockAPIService,
  MockAPIServiceErrors,
  MockBarComponent,
  MockGridComponent
} from '../_mocked';
import { BreakdownResults, DimensionName, NameLabel } from '../_models';
import { APIService } from '../_services';
import { SnapshotsComponent } from '../snapshots';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  const contentTierNameLabels = [
    { name: '0', label: '0' },
    { name: '1', label: '1' },
    { name: '2', label: '2' },
    { name: '3', label: '3' }
  ];
  const tickTime = 1;
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
      declarations: [
        IsScrollableDirective,
        OverviewComponent,
        MockBarComponent,
        MockGridComponent,
        SnapshotsComponent,
        createMockPipe('renameApiFacet'),
        createMockPipe('renameRights')
      ],
      providers: [
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
    component.useDataServer = true;
    component.form.get('facetParameter').setValue(DimensionName.contentTier);
    fixture.detectChanges();
  };

  const setFilterValue1 = (group: string): void => {
    component.form.addControl(group, new FormBuilder().group({}));
    component.addOrUpdateFilterControls(group, contentTierNameLabels);
    component.form.get(`${group}.1`).setValue(true);
  };

  const fmtParamCT = (s: string): string => {
    return `&qf=contentTier:(${encodeURIComponent(s)})`;
  };

  describe('Route Parameter', () => {
    beforeEach(async(() => {
      configureTestBed(false);
    }));

    beforeEach(() => {
      b4Each();
      params.next({ facet: DimensionName.country });
    });

    it('should poll on initialisation', fakeAsync(() => {
      component.ngOnInit();
      tick(1);
      const ctrlFacet = component.form.controls.facetParameter as FormControl;
      expect(ctrlFacet.value).toBe(DimensionName.country);
      expect(component.dataServerData).toBeTruthy();
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

    it('should load', fakeAsync(() => {
      spyOn(api, 'getBreakdowns').and.callThrough();

      params.next({ facet: DimensionName.country });
      tick(1);
      fixture.detectChanges();
      expect(api.getBreakdowns).toHaveBeenCalledTimes(1);

      params.next({ facet: 'TYPE' });
      tick(1);
      fixture.detectChanges();
      expect(api.getBreakdowns).toHaveBeenCalledTimes(2);

      queryParams.next({ TYPE: ['SOUND', 'VIDEO'] });
      tick(1);
      fixture.detectChanges();

      expect(api.getBreakdowns).toHaveBeenCalledTimes(3);

      component.ngOnDestroy();
    }));

    it('should post process', () => {
      spyOn(component, 'extractSeriesServerData');
      component.dataServerData = {} as unknown as BreakdownResults;
      component.postProcessResult();
      expect(component.extractSeriesServerData).not.toHaveBeenCalled();
      component.dataServerData = {
        filteringOptions: {
          contentTier: [],
          COUNTRY: [],
          DATA_PROVIDER: [],
          metadataTier: [],
          PROVIDER: [],
          RIGHTS: [],
          TYPE: []
        },
        results: {
          breakdowns: {
            results: []
          }
        }
      } as unknown as BreakdownResults;

      component.postProcessResult();
      expect(component.extractSeriesServerData).toHaveBeenCalled();
    });

    it('should extract data as a percent', fakeAsync(() => {
      const data = Object.assign({}, MockAPIData);
      expect(component.allProcessedFacetData).toBeFalsy();
      component.processResult(data);
      expect(component.allProcessedFacetData).toBeTruthy();
      expect(component.allProcessedFacetData[0].fields[0].percent).toBeTruthy();
    }));

    it('should get the select options', fakeAsync(() => {
      expect(component.filterData.length).toBeFalsy(0);
      component.beginPolling();
      tick(1);
      expect(Object.keys(component.filterData).length).toBeGreaterThan(0);
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
      component.form.get('dateFrom').setValue(today);
      expect(component.getFormattedDateParam().length).toBeFalsy();
      component.form.get('dateTo').setValue(today);
      expect(component.getFormattedDateParam().length).toBeTruthy();
    });

    it('should get the formatted content tier param', () => {
      const expectOneToFour = fmtParamCT('1 OR 2 OR 3 OR 4');
      const expectZeroToFour = fmtParamCT('0 OR 1 OR 2 OR 3 OR 4');

      expect(component.getFormattedContentTierParam()).toEqual(expectOneToFour);

      component.form.get('contentTierZero').setValue(true);

      expect(component.getFormattedContentTierParam()).toEqual(
        expectZeroToFour
      );

      component.addOrUpdateFilterControls('contentTier', contentTierNameLabels);
      component.form.get('contentTier.0').setValue(true);

      expect(component.getFormattedContentTierParam()).toEqual(fmtParamCT('0'));

      component.form.get('contentTier.1').setValue(true);
      expect(component.getFormattedContentTierParam()).toEqual(
        fmtParamCT('0 OR 1')
      );

      component.form.get('contentTier.0').setValue(false);
      expect(component.getFormattedContentTierParam()).toEqual(fmtParamCT('1'));
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
      const fName = 'contentTier';
      let selected = component.getSetCheckboxValues(fName);
      expect(selected.length).toEqual(0);

      component.form.addControl(fName, new FormBuilder().group({}));
      component.addOrUpdateFilterControls(fName, contentTierNameLabels);

      component.form.get(`${fName}.1`).setValue(true);
      selected = component.getSetCheckboxValues(fName);
      expect(selected.length).toEqual(1);

      component.form.get(`${fName}.2`).setValue(true);
      selected = component.getSetCheckboxValues(fName);
      expect(selected.length).toEqual(2);

      component.form.get(`${fName}.3`).setValue(false);
      expect(component.getFormattedContentTierParam()).toEqual(
        fmtParamCT('1 OR 2')
      );

      component.form.get(`${fName}.2`).disable();
      expect(component.getFormattedContentTierParam()).toEqual(fmtParamCT('1'));

      selected = component.getSetCheckboxValues(fName);
      expect(selected.length).toEqual(1);
    });

    it('should clear the dates', () => {
      component.form.get('dateFrom').setValue(new Date().toISOString());
      expect(component.form.value.dateFrom).toBeTruthy();
      component.datesClear();
      expect(component.form.value.dateFrom).toBeFalsy();

      component.form.get('dateTo').setValue(new Date().toISOString());
      expect(component.form.value.dateTo).toBeTruthy();
      component.datesClear();
      expect(component.form.value.dateTo).toBeFalsy();
    });

    it('should enable the filters', fakeAsync(() => {
      component.beginPolling();
      tick(tickTime);
      component.filterStates[DimensionName.country].disabled = true;
      component.enableFilters();
      expect(
        component.filterStates[DimensionName.country].disabled
      ).toBeFalsy();
      component.ngOnDestroy();
    }));

    it('should clear the filters', () => {
      setFilterValue1('TYPE');
      expect(
        component.getSetCheckboxValues(DimensionName.type).length
      ).toBeTruthy();
      component.clearFilter();
      expect(
        component.getSetCheckboxValues(DimensionName.type).length
      ).toBeFalsy();
      setFilterValue1('TYPE');
      expect(
        component.getSetCheckboxValues(DimensionName.type).length
      ).toBeTruthy();
      component.clearFilter('RIGHTS');
      expect(
        component.getSetCheckboxValues(DimensionName.type).length
      ).toBeTruthy();
      component.clearFilter('TYPE');
      expect(
        component.getSetCheckboxValues(DimensionName.type).length
      ).toBeFalsy();
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
      component.form.value.facetParameter = DimensionName.contentTier;
    });

    it('should get the total figure', () => {
      expect(component.getUrlRow()).toBeTruthy();
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
      const ctZeroDetect = `${DimensionName.contentTier}:(0`;
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

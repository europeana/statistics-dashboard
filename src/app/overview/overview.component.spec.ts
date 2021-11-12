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
import { portalNames } from '../_data';
import { today } from '../_helpers';

import {
  createMockPipe,
  MockAPIService,
  MockAPIServiceErrors,
  MockBarComponent,
  MockGridComponent
} from '../_mocked';
import {
  BreakdownResult,
  BreakdownResults,
  DimensionName,
  NameLabel,
  RequestFilter,
  RequestFilterRange
} from '../_models';
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
  const tmpParams = {};
  tmpParams[DimensionName.country] = 'Italy';
  const queryParams = new BehaviorSubject(tmpParams as Params);

  let api: APIService;

  const configureTestBed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          {
            path: `data/${DimensionName.contentTier}`,
            component: OverviewComponent
          },
          {
            path: `data/${DimensionName.country}`,
            component: OverviewComponent
          },
          {
            path: `data/${DimensionName.contentTier}?${DimensionName.type}=TEXT}`,
            component: OverviewComponent
          },
          {
            path: `data/${DimensionName.contentTier}?${DimensionName.type}=TEXT}&${DimensionName.type}=VIDEO}`,
            component: OverviewComponent
          },
          { path: `data/${DimensionName.type}`, component: OverviewComponent }
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
      fixture.detectChanges();
      const ctrlFacet = component.form.controls.facetParameter as FormControl;
      expect(ctrlFacet.value).toBe(DimensionName.country);
      expect(component.dataServerData).toBeTruthy();
      tick();
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
      params.next({ facet: DimensionName.type });
      tick(1);
      fixture.detectChanges();
      expect(api.getBreakdowns).toHaveBeenCalledTimes(2);

      const nextParams = {};
      nextParams[DimensionName.type] = ['SOUND', 'VIDEO'];
      queryParams.next(nextParams);
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
          country: [],
          dataProvider: [],
          metadataTier: [],
          provider: [],
          rights: [],
          type: []
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

    it('should refresh the chart', fakeAsync(() => {
      component.showAppliedSeriesInGridAndChart();
      spyOn(component, 'refreshChart');
      component.form.controls.facetParameter.setValue(
        DimensionName.contentTier
      );
      expect(component.refreshChart).not.toHaveBeenCalled();
      tick(400);
      expect(component.refreshChart).toHaveBeenCalled();
      component.ngOnDestroy();
    }));

    it('should get the chart data', () => {
      expect(component.getChartData()).toBeTruthy();
    });

    it('should get the grid data', () => {
      expect(component.getGridData()).toBeTruthy();
    });

    it('should extract the series server data', () => {
      const br: BreakdownResult = {
        results: [
          {
            count: 1,
            percentage: 1,
            value: 'The Value'
          }
        ]
      };

      spyOn(component, 'storeSeries');
      component.extractSeriesServerData(br);
      expect(component.storeSeries).toHaveBeenCalled();

      component.form.controls.facetParameter.setValue(DimensionName.rights);
      component.extractSeriesServerData(br);

      expect(component.storeSeries).toHaveBeenCalledTimes(2);

      component.queryParams = { any: 'thing' };
      component.extractSeriesServerData(br);

      expect(component.storeSeries).toHaveBeenCalledTimes(3);
    });

    it('should get the select options', fakeAsync(() => {
      expect(component.filterData.length).toBeFalsy(0);
      component.beginPolling();
      tick(tickTime);
      expect(Object.keys(component.filterData).length).toBeGreaterThan(0);
      component.ngOnDestroy();
    }));

    it('should get the url for a dataset', () => {
      expect(
        component.getUrl(DimensionName.contentTier).indexOf('XXX')
      ).toEqual(-1);
      component.form.get('datasetId').setValue('XXX');
      expect(
        component.getUrl(DimensionName.contentTier).indexOf('XXX')
      ).toBeTruthy();
    });

    it('should get the url for filters', () => {
      const countryUrlParamVal = 'Belgium';
      const ctZeroUrlParamVal = '0%20OR%201%20OR%202%20OR%203%20OR%204';

      expect(
        component.getUrl(DimensionName.contentTier).includes(countryUrlParamVal)
      ).toBeFalsy();
      component.queryParams = { country: [countryUrlParamVal] };
      expect(
        component.getUrl(DimensionName.contentTier).includes(countryUrlParamVal)
      ).toBeTruthy();
      expect(
        component
          .getUrl(DimensionName.contentTier)
          .includes(`COUNTRY:"${countryUrlParamVal}"`)
      ).toBeTruthy();

      expect(
        component.getUrl(DimensionName.contentTier).includes(ctZeroUrlParamVal)
      ).toBeFalsy();
      component.queryParams = { 'content-tier-zero': true };
      expect(
        component.getUrl(DimensionName.contentTier).includes(ctZeroUrlParamVal)
      ).toBeFalsy();
      component.form.controls.contentTierZero.setValue(true);
      expect(
        component.getUrl(DimensionName.contentTier).includes(ctZeroUrlParamVal)
      ).toBeTruthy();
    });

    it('should get the formatted date param', () => {
      expect(component.getFormattedDateParam().length).toBeFalsy();
      component.form.get('dateFrom').setValue(today);
      expect(component.getFormattedDateParam().length).toBeFalsy();
      component.form.get('dateTo').setValue(today);
      expect(component.getFormattedDateParam().length).toBeTruthy();
    });

    it('should update the datasetId param', () => {
      component.form.get('datasetId').setValue('123, 456, 789');
      component.updateDatasetIdFieldAndPageUrl('123');
      expect(component.form.value.datasetId).toEqual('456, 789');
    });

    it('should get the formatted datasetId param', () => {
      expect(component.getFormattedDatasetIdParam()).toEqual('*');
      component.form.get('datasetId').setValue('123, 456, 789');
      expect(
        component
          .getFormattedDatasetIdParam()
          .indexOf('(123_* OR 456_* OR 789_*)')
      ).toBeGreaterThan(-1);
    });

    it('should get the formatted content tier param', () => {
      const expectOneToFour = fmtParamCT('1 OR 2 OR 3 OR 4');
      const expectZeroToFour = fmtParamCT('0 OR 1 OR 2 OR 3 OR 4');

      expect(component.getFormattedContentTierParam()).toEqual(expectOneToFour);

      component.form.get('contentTierZero').setValue(true);

      expect(component.getFormattedContentTierParam()).toEqual(
        expectZeroToFour
      );

      component.addOrUpdateFilterControls(
        DimensionName.contentTier,
        contentTierNameLabels
      );
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

      expect(form).toBeTruthy();

      contentTierNameLabels.forEach((nl: NameLabel) => {
        expect(form.get(`${testName}.${nl.name}`)).toBeFalsy();
      });

      form.addControl(testName, new FormBuilder().group({}));

      component.addOrUpdateFilterControls(testName, contentTierNameLabels);

      contentTierNameLabels.forEach((nl: NameLabel) => {
        expect(form.get(`${testName}.${nl.name}`)).toBeTruthy();
      });
    });

    it('should tell if checkbox values have been set', () => {
      expect(component.isFilterApplied()).toBeFalsy();
      expect(component.isFilterApplied(DimensionName.type)).toBeFalsy();
      expect(component.isFilterApplied('FAKE')).toBeFalsy();
      setFilterValue1(DimensionName.type);
      expect(component.isFilterApplied(DimensionName.type)).toBeTruthy();
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
      setFilterValue1(DimensionName.type);
      expect(
        component.getSetCheckboxValues(DimensionName.type).length
      ).toBeTruthy();
      component.clearFilter();
      expect(
        component.getSetCheckboxValues(DimensionName.type).length
      ).toBeFalsy();
      setFilterValue1(DimensionName.type);
      expect(
        component.getSetCheckboxValues(DimensionName.type).length
      ).toBeTruthy();
      component.clearFilter(DimensionName.rights);
      expect(
        component.getSetCheckboxValues(DimensionName.type).length
      ).toBeTruthy();
      component.clearFilter(DimensionName.type);
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

      const exception = DimensionName.type;
      checkAllValue(true);
      component.closeFilters(exception);
      expect(component.filterStates[exception].visible).toBeTruthy();
      component.ngOnDestroy();
    }));

    it('should convert the facet names for the portal query', () => {
      component.form.reset();
      component.buildForm();
      fixture.detectChanges();
      component.form.get('facetParameter').setValue(DimensionName.country);
      fixture.detectChanges();
      expect(
        component
          .getUrlRow(DimensionName.country, 'Norway')
          .indexOf(DimensionName.country)
      ).toEqual(-1);
      expect(
        component
          .getUrlRow(DimensionName.country, 'Norway')
          .indexOf(portalNames[DimensionName.country])
      ).toBeGreaterThan(-1);
    });
  });

  describe('Request / Url Generation', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(() => {
      b4Each();
      component.form.value.facetParameter = DimensionName.contentTier;
    });

    it('should get the data server request', () => {
      const fnGetRequestFilter = (dimension: string): Array<string> | null => {
        const filter = component.getDataServerDataRequest().filters[
          dimension
        ] as RequestFilter;
        return filter ? filter.values : null;
      };

      expect(fnGetRequestFilter(DimensionName.contentTier)).toEqual([
        '1',
        '2',
        '3',
        '4'
      ]);
      component.queryParams = { 'content-tier-zero': true };
      expect(fnGetRequestFilter(DimensionName.contentTier)).toEqual([
        '1',
        '2',
        '3',
        '4'
      ]);
      component.form.controls.contentTierZero.setValue(true);

      expect(fnGetRequestFilter(DimensionName.contentTier)).toBeFalsy();
      expect(fnGetRequestFilter('datasetId')).toBeFalsy();

      component.form.controls.datasetId.setValue('xxx');

      expect(fnGetRequestFilter('datasetId')).toBeTruthy();
      expect(fnGetRequestFilter('createdDate')).toBeFalsy();

      component.form.controls.dateFrom.setValue(new Date().toISOString());
      component.form.controls.dateTo.setValue(new Date().toISOString());

      expect(
        (
          component.getDataServerDataRequest().filters[
            'createdDate'
          ] as RequestFilterRange
        ).from
      ).toBeTruthy();
    });

    it('should get the total figure', () => {
      expect(component.getUrlRow(DimensionName.contentTier)).toBeTruthy();
    });

    it('should include the facet selection', () => {
      [2, 3, 4].forEach((qfVal: number) => {
        const wrongVal = qfVal * 3;
        expect(
          component
            .getUrlRow(DimensionName.contentTier, `${qfVal}`)
            .indexOf(`${wrongVal}`)
        ).toEqual(-1);
        expect(
          component
            .getUrlRow(DimensionName.contentTier, `${qfVal}`)
            .indexOf(`${qfVal}`)
        ).toBeGreaterThan(-1);
      });

      ['video', 'text', '3d', 'audio'].forEach((qfVal: 'string') => {
        const wrongVal = 'hologram';
        expect(
          component.getUrlRow(DimensionName.type, qfVal).indexOf(wrongVal)
        ).toEqual(-1);
        expect(
          component.getUrlRow(DimensionName.type, qfVal).indexOf(qfVal)
        ).toBeGreaterThan(-1);
      });
    });

    it('should include contentTierZero', () => {
      const ctZeroDetect = `${DimensionName.contentTier}:(0`;

      expect(
        component.getUrlRow(DimensionName.contentTier).indexOf(ctZeroDetect)
      ).toEqual(-1);
      component.form.value.contentTierZero = true;
      expect(
        component.getUrlRow(DimensionName.contentTier).indexOf(ctZeroDetect)
      ).toBeGreaterThan(-1);
    });

    it('should include the date range', () => {
      const dateDetect = new Date().toISOString();
      expect(
        component.getUrlRow(DimensionName.contentTier, '1').indexOf(dateDetect)
      ).toEqual(-1);
      component.form.value.dateFrom = dateDetect;
      component.form.value.dateTo = dateDetect;
      expect(
        component.getUrlRow(DimensionName.contentTier, '1').indexOf(dateDetect)
      ).toBeGreaterThan(-1);
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

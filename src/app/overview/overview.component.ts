import { Component, OnInit, ViewChild } from '@angular/core';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { facetNames } from '../_data';
import { filterList } from '../_helpers';
import { DimensionName, FilterInfo } from '../_models';
import { RenameRightsPipe } from '../_translate';
import { BarChartCool } from '../chart/chart-defaults';
import { BarComponent } from '../chart';
import { SnapshotsComponent } from '../snapshots';

import {
  fromInputSafeName,
  rightsUrlMatch,
  today,
  toInputSafeName,
  validateDateGeneric,
  yearZero
} from '../_helpers';

import {
  BreakdownRequest,
  BreakdownResult,
  BreakdownResults,
  CountPercentageValue,
  FilterState,
  FmtTableData,
  IHashArrayNameLabel,
  IHashNumber,
  IHashStringArray,
  NameLabel,
  NameValuePercent,
  RequestFilter
} from '../_models';

import { APIService } from '../_services';
import { DataPollingComponent } from '../data-polling';
import { ExportComponent } from '../export';
import { GridComponent } from '../grid';
import { GridSummaryComponent } from '../grid-summary';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [RenameRightsPipe]
})
export class OverviewComponent extends DataPollingComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridSummary') gridSummary: GridSummaryComponent;
  @ViewChild('export') export: ExportComponent;
  @ViewChild('barChart') barChart: BarComponent;
  @ViewChild('snapshots') snapshots: SnapshotsComponent;

  // Make variables available to template
  public DimensionName = DimensionName;
  public toInputSafeName = toInputSafeName;
  public fromInputSafeName = fromInputSafeName;
  public barChartSettings = Object.assign(
    {
      prefixValueAxis: ''
    },
    BarChartCool
  );

  public barChartSettingsTiers = Object.assign(
    {
      prefixValueAxis: 'Tier'
    },
    BarChartCool
  );

  readonly MAX_FILTER_OPTIONS = 50;
  readonly facetConf = facetNames;
  readonly nonFilterQPs = [
    'content-tier-zero',
    'date-from',
    'date-to',
    'dataset-name'
  ];

  filterStates: { [key: string]: FilterState } = {};
  userFilterSearchTerms = facetNames.reduce((map, item: string) => {
    map[item] = '';
    return map;
  }, {});

  contentTiersOptions = Array(5)
    .fill(0)
    .map((x, index) => `${x + index}`);

  disabledParams: IHashStringArray;

  pollRefresh: Subject<boolean>;
  form: FormGroup;
  isLoading = false;

  selFacetIndex = 0;
  resultTotal: number;

  filterData: IHashArrayNameLabel = {};
  displayedFilterData: IHashArrayNameLabel = {};
  queryParams: Params = {};

  dataServerData: BreakdownResults;

  constructor(
    private api: APIService,
    private fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly renameRights: RenameRightsPipe
  ) {
    super();
    this.buildForm();
    this.initialiseFilterStates();
  }

  getDataServerDataRequest(): BreakdownRequest {
    const breakdownRequest: BreakdownRequest = { filters: {} };

    breakdownRequest.filters[this.form.value.facetParameter] = {
      breakdown: 0
    };

    Object.keys(this.queryParams).forEach((key: string) => {
      const sendValues = [];
      const values = this.queryParams[key];

      if (!this.nonFilterQPs.includes(key)) {
        values.forEach((valPart: string) => {
          if (!this.isDeadFacet(key, toInputSafeName(valPart))) {
            sendValues.push(fromInputSafeName(valPart));
          }
        });
        breakdownRequest.filters[key] = { values: sendValues };
      }
    });

    if (!this.form.value.contentTierZero) {
      let ct = breakdownRequest.filters[
        DimensionName.contentTier
      ] as RequestFilter;
      if (!ct) {
        breakdownRequest.filters[DimensionName.contentTier] = {};
        ct = breakdownRequest.filters[
          DimensionName.contentTier
        ] as RequestFilter;
      }
      if (!ct.values) {
        ct.values = ['1', '2', '3', '4'];
      }
    }

    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;

    if (valFrom && valTo) {
      breakdownRequest.filters['createdDate'] = {
        from: new Date(valFrom).toISOString().split('T')[0],
        to: new Date(valTo).toISOString().split('T')[0]
      };
    }

    const valDatasetName = this.form.value.datasetName;
    if (valDatasetName) {
      breakdownRequest.filters['datasetName'] = {
        values: [`edm_datasetName:${valDatasetName}`]
      };
    }
    console.log('Request:\n' + JSON.stringify(breakdownRequest, null, 4));
    return breakdownRequest;
  }

  /** ngOnInit
  /* Event hook: subscribe to changes in the route / query params
  */
  ngOnInit(): void {
    this.subs.push(
      combineLatest(this.route.params, this.route.queryParams)
        .pipe(
          map((results) => {
            const qp = results[1];
            const qpValArrays = {};

            Object.keys(qp).forEach((s: string) => {
              qpValArrays[s] = (Array.isArray(qp[s]) ? qp[s] : [qp[s]]).map(
                (qpVal: string) => {
                  return toInputSafeName(qpVal);
                }
              );
            });
            return {
              params: results[0],
              queryParams: qpValArrays
            };
          })
        )
        .subscribe((combined) => {
          this.disabledParams = {};

          const params = combined.params;
          const queryParams = combined.queryParams;

          if (queryParams[params.facet]) {
            this.disabledParams[params.facet] = queryParams[params.facet];
            delete queryParams[params.facet];
          }

          const facetChanged =
            params.facet &&
            params.facet != this.form.controls.facetParameter.value;

          if (facetChanged) {
            this.form.controls.facetParameter.setValue(params.facet);
            if (this.dataServerData) {
              this.switchFacet();
            }
          }
          this.queryParams = queryParams;

          this.setCtZeroInputToQueryParam();
          this.setDateInputsToQueryParams();
          this.setDatasetNameInputToQueryParam();

          this.triggerLoad();
        })
    );
  }

  getGridData(): FmtTableData {
    return this.grid.getData();
  }

  getChartData(): Promise<string> {
    return this.barChart.getSvgData();
  }

  /** getUrl
  /* returns a url parameter string (for api or the portal) according to the form state
  /* @returns string
  */
  getUrl(): string {
    // filterParam cannot rely on checkbox values as filters aren't built until the data is initialised

    let filterParam = Object.keys(this.queryParams)
      .map((key: string) => {
        const innerRes = [];
        const values = this.queryParams[key];

        if (!this.nonFilterQPs.includes(key)) {
          values.forEach((valPart: string) => {
            if (!this.isDeadFacet(key, toInputSafeName(valPart))) {
              innerRes.push(
                `${key}:"${encodeURIComponent(fromInputSafeName(valPart))}"`
              );
            }
          });
          return innerRes.join('&qf=');
        }
        return '';
      })
      .filter((x) => x.length > 0)
      .join('&qf=');

    if (filterParam.length > 0) {
      filterParam = `&qf=${filterParam}`;
    }

    const datasetNameParam = this.getFormattedDatasetNameParam();
    const queryParam = `?query=${
      datasetNameParam.length > 0 ? datasetNameParam : '*'
    }`;

    const dateParam = this.getFormattedDateParam();
    const ct = this.getFormattedContentTierParam();

    return `${queryParam}${ct}${filterParam}${dateParam}`;
  }

  /** getUrlRow
  /* @param {string} qfVal - the specific item's value for the currently-selected facet
  /* returns the (portal) url for a specific item
  */
  getUrlRow(qfVal?: string): string {
    const rootUrl = `${environment.serverPortal}${this.getUrl()}`;
    if (!qfVal) {
      return rootUrl;
    }
    return `${rootUrl}&qf=${
      this.form.value.facetParameter
    }:"${encodeURIComponent(qfVal)}"`;
  }

  /** processServerResult
  /* @returns { boolean } - if valid
  **/
  processServerResult(results: BreakdownResults): boolean {
    this.dataServerData = results;
    if (results.results) {
      this.resultTotal = results.results.count;
      return true;
    } else {
      this.barChart.removeAllSeries();
      this.grid.setRows([]);
      if (this.gridSummary) {
        this.gridSummary.summaryData = { breakdownBy: '', results: [] };
      }
      return false;
    }
  }

  /**
  /* postProcessResult
  /*
  /* handles data-driven UI
  */
  postProcessResult(): void {
    // initialise filterData and add checkboxes
    const dsd = this.dataServerData;
    if (dsd && dsd.filteringOptions) {
      const ops = dsd.filteringOptions;

      this.facetConf.forEach((facetName: DimensionName) => {
        // calculate prefix
        let prefix = '';
        if (
          [DimensionName.contentTier, DimensionName.metadataTier].includes(
            facetName
          )
        ) {
          prefix = 'Tier ';
        }

        if (!ops[facetName]) {
          console.error('Missing dimension data: ' + facetName);
        } else {
          // calculate full list of in-memory safe options
          const safeOps = ops[facetName]
            .filter((op: string) => {
              return !(
                !this.form.value.contentTierZero &&
                op === '0' &&
                facetName === DimensionName.contentTier
              );
            })
            .map((op: string) => {
              return {
                name: toInputSafeName(op),
                label: prefix + op
              };
            })
            .sort((op1: NameLabel, op2: NameLabel) => {
              // ensure that selected filters appear...
              const qp = this.queryParams;
              if (qp && qp[facetName]) {
                const includes1 = qp[facetName].includes(op1.name);
                const includes2 = qp[facetName].includes(op2.name);
                if (includes1 && !includes2) {
                  return -1;
                } else if (includes2 && !includes1) {
                  return 1;
                }
              }

              // ...and sort on label
              if (op1.label > op2.label) {
                return 1;
              }
              return -1;
            });
          this.filterData[facetName] = safeOps;

          const previousTerm = this.userFilterSearchTerms[facetName];
          this.filterDisplayData({
            term: previousTerm ? previousTerm : '',
            dimension: facetName
          });
        }
      });

      if (dsd.results && dsd.results.breakdowns) {
        // set pie and table data
        this.extractSeriesServerData(dsd.results.breakdowns);
      }
    }
  }

  /** beginPolling
  /* - set up data polling for facet data
  */
  beginPolling(fnCallback?: (refresh?: boolean) => void): void {
    this.pollRefresh = this.createNewDataPoller(
      60 * 100000,
      () => {
        this.isLoading = true;
        return this.api.getBreakdowns(this.getDataServerDataRequest());
      },
      (breakdownResults: BreakdownResults) => {
        this.isLoading = false;
        if (this.processServerResult(breakdownResults)) {
          this.postProcessResult();
        }
        if (fnCallback) {
          fnCallback();
        }
      }
    ).getPollingSubject();
  }

  initialiseFilterStates(): void {
    this.facetConf.forEach((name: string) => {
      this.filterStates[name] = {
        visible: false,
        disabled: this.form.value.facetParameter === name
      };
    });
    this.filterStates.dates = { visible: false, disabled: false };
  }

  seriesNameFromUrl(): string {
    return JSON.stringify(this.queryParams).replace(
      /[:\".,\s\(\)\[\]\{\}]/g,
      ''
    );
  }

  iHashNumberFromNVPs(
    src: Array<NameValuePercent>,
    percent = false
  ): IHashNumber {
    return src.reduce(function (map: IHashNumber, nvp: NameValuePercent) {
      map[nvp.name] = percent ? nvp.percent : nvp.value;
      return map;
    }, {});
  }

  /** storeSeries
  /*
  /*  Store series data
  */
  storeSeries(
    applied: boolean,
    saved: boolean,
    nvs: Array<NameValuePercent>,
    seriesTotal: number
  ): void {
    const name = this.seriesNameFromUrl();
    let label = `All (${this.form.value.facetParameter})`;

    // Generate human-readable label
    if (Object.keys(this.queryParams).length > 0) {
      label = Object.keys(this.queryParams)
        .map((key: string) => {
          if (key === 'content-tier-zero') {
            return 'CT-Zero';
          }

          const innerRes = [];
          const values = this.queryParams[key];
          if (values && !this.nonFilterQPs.includes(key)) {
            values
              .map((s: string) => {
                return fromInputSafeName(s);
              })
              .forEach((valPart: string) => {
                innerRes.push(this.renameRights.transform(valPart));
              });
            return `${key} (${innerRes.join(' or ')})`;
          }
          return '';
        })
        .filter((x) => x.length > 0)
        .join(' and ');
    }

    this.snapshots.snap(this.form.value.facetParameter, name, {
      name: name,
      label: label,
      data: this.iHashNumberFromNVPs(nvs),

      dataOrder: [],

      dataPercent: this.iHashNumberFromNVPs(nvs, true),
      applied: applied,
      pinIndex: 0,
      saved: saved,
      total: seriesTotal
    });
  }

  /** removeSeries
  /*  Invokes functions to remove series from the chart and table
  /* @param { string : seriesKey } - the key of the series to remove
   */
  removeSeries(seriesKey: string): void {
    this.snapshots.unapply(seriesKey);
    this.showAppliedSeriesInGridAndChart();
  }

  showAppliedSeriesInGridAndChart(): void {
    const seriesKeys = this.snapshots.filteredCDKeys(
      this.form.value.facetParameter,
      'applied'
    );

    const sortInfo = this.grid.getExtendedPagerInfo().sort;
    this.snapshots.preSort(
      this.form.value.facetParameter,
      seriesKeys,
      sortInfo
    );

    this.showAppliedSeriesInGrid();

    const fn = (): void => {
      this.barChart.removeAllSeries();
      this.addAppliedSeriesToChart();
      this.barChart.drawChart();
    };
    setTimeout(fn, 0);
  }

  /** addSeries
  /*  UI control
  /*  Calls functions to apply daya then redraw the chart and grid
  /* @param { Array<string> : seriesKeys } - the keys of the series to add
   */
  addSeries(seriesKeys: Array<string>): void {
    this.snapshots.apply(this.form.value.facetParameter, seriesKeys);
    this.showAppliedSeriesInGridAndChart();
  }

  /** addSeriesToChart
  /*  Add series data to the bar chart
  /*  (colours handled by snapshots)
  /* @param { Array<string> : seriesKeys } - the keys of the series to visualise
   */
  addSeriesToChart(seriesKeys: Array<string>): void {
    if (!this.grid) {
      return;
    }
    const fn = (): void => {
      const seriesData = this.snapshots.getSeriesDataForChart(
        this.form.value.facetParameter,
        seriesKeys,
        this.form.value.showPercent
      );
      this.barChart.addSeries(seriesData);
    };
    setTimeout(fn, 0);
  }

  /** addAppliedSeriesToChart
  /*  adds all compareData entries (where applied = true)
  /* @param { boolean : reuseColours } - optional flag for percentage switch
   */
  addAppliedSeriesToChart(): void {
    this.addSeriesToChart(
      this.snapshots.filteredCDKeys(this.form.value.facetParameter, 'applied')
    );
  }

  /** refreshChart
  /* (conditionally) calls drawChart on chart object
  /*  removes all series objects from the barchart
  /*  re-applies active series
  /* @param { boolean : redrawChart } - flag redraw
   */
  refreshChart(redrawChart = false): void {
    if (redrawChart) {
      this.barChart.drawChart();
    }
    this.barChart.removeAllSeries();
    this.addAppliedSeriesToChart();
  }

  /** addOrUpdateFilterControls
  /*
  /* Adds a FormControl for each option, updates the value if the control exists
  /*
  /* @param { string } name - the name of the filter
  /* @param { Array<string> } options - the filter options
  /*
  */
  addOrUpdateFilterControls(name: string, options: Array<NameLabel>): void {
    const checkboxes = this.form.get(name) as FormGroup;

    options.forEach((option: NameLabel) => {
      const fName = option.name;
      const ctrl = this.form.get(`${name}.${fName}`);
      const defaultValue =
        this.queryParams[name] && this.queryParams[name].includes(option.name);

      if (!ctrl) {
        checkboxes.addControl(fName, new FormControl(defaultValue));
      } else {
        (ctrl as FormControl).setValue(defaultValue);
      }
    });
  }

  /** buildForm
  /* - set upt data polling
  */
  buildForm(): void {
    this.form = this.fb.group({
      facetParameter: [],
      contentTierZero: [false],
      showPercent: [false],
      datasetName: [''],
      dateFrom: ['', this.validateDateFrom.bind(this)],
      dateTo: ['', this.validateDateTo.bind(this)]
    });

    this.facetConf.map((s: string) => {
      this.form.addControl(s, this.fb.group({}));
      this.form.addControl(`filter_list_${s}`, new FormControl(''));
    });
  }

  /** validateDateFrom
  /* @param {FormControl} control - the field to validate
  /* - returns an errors object map
  */
  validateDateFrom(control: FormControl): { [key: string]: boolean } | null {
    return validateDateGeneric(control, 'dateFrom');
  }

  /** validateDateTo
  /* @param {FormControl} control - the field to validate
  /* - returns an errors object map
  */
  validateDateTo(control: FormControl): { [key: string]: boolean } | null {
    return validateDateGeneric(control, 'dateTo');
  }

  /** filterDisplayData
  /* @param {FilterInfo} filterInfo
  /* updates this.displayedFilterData to a filtered and truncated subset for display
  /* (called on initialisation and in response to a search term changing)
  */
  filterDisplayData(filterInfo: FilterInfo): void {
    if (!filterInfo.dimension) {
      filterInfo.dimension = this.form.value.facetParameter;
    }

    this.userFilterSearchTerms[filterInfo.dimension] = filterInfo.term;

    const toDisplay = filterList(
      filterInfo.term,
      this.filterData[filterInfo.dimension].map((nl: NameLabel) => {
        return filterInfo.dimension !== DimensionName.rights
          ? nl
          : {
              name: nl.name,
              label: this.renameRights.transform(nl.label)
            };
      }),
      'label'
    ).slice(0, this.MAX_FILTER_OPTIONS);

    this.addOrUpdateFilterControls(filterInfo.dimension, toDisplay);
    this.displayedFilterData[filterInfo.dimension] = toDisplay;
  }

  /** getFormattedContentTierParam
  /* @returns { string } - concatenated filterContentTier values if present
  /* @returns { string } - contentTierZero value if filterContentTier values not present
  */
  getFormattedContentTierParam(): string {
    let res = '';
    const filterContentTierParam = this.getSetCheckboxValues(
      DimensionName.contentTier
    );

    res = (
      filterContentTierParam.length > 0
        ? filterContentTierParam
        : this.form.value.contentTierZero
        ? this.contentTiersOptions
        : this.contentTiersOptions.slice(1)
    ).join(' OR ');
    return `&qf=contentTier:(${encodeURIComponent(res)})`;
  }

  /** getFormattedFacetParam
  /* get a string containing all facet names formatted as a url parameters
  /* @returns string
  */
  getFormattedFacetParam(): string {
    return this.facetConf
      .map((f) => {
        return `&facet=${encodeURIComponent(f)}`;
      })
      .join('');
  }

  /** getFormattedDatasetNameParam
  /* get an empty string or the prefixed value of form.datasetName
  /* @returns string
  */
  getFormattedDatasetNameParam(): string {
    const val = this.form.value.datasetName;
    return val ? `edm_datasetName:${val}` : '';
  }

  /** getFormattedDateParam
  /* get an empty string or the formatted date range
  /* @returns string
  */
  getFormattedDateParam(): string {
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;
    if (valFrom && valTo) {
      const range = `${new Date(valFrom).toISOString()}+TO+${new Date(
        valTo
      ).toISOString()}`;
      return `&qf=timestamp_update:${encodeURIComponent(
        '['
      )}${range}${encodeURIComponent(']')}`;
    }
    return '';
  }

  /** getFormattedDateStrings
  /* gets the date range (set or default) as an arrat of string
  /* @returns Array<string>
  */
  getFormattedDateStrings(): Array<string> {
    const form = this.form;
    const valFrom = form.value.dateFrom ? form.value.dateFrom : yearZero;
    const valTo = form.value.dateTo ? form.value.dateTo : today;
    return [valFrom, valTo].map((date: Date) => {
      const parts = new Date(date).toDateString().split(' ').slice(1);
      return [parts.slice(0, 2).join(' '), parts[2]].join(', ');
    });
  }

  /** setCTZeroInputToQueryParam
  /* updates the form value 'contentTierZero' to the page query parameter 'content-tier-zero'
  */
  setCtZeroInputToQueryParam(): void {
    const param = this.queryParams['content-tier-zero'];
    this.form.controls.contentTierZero.setValue(
      param ? param[0] === 'true' : false
    );
  }

  /** setDateInputsToQueryParams
  /* updates the form values to the page query parameters for 'dateFrom' (date-from) and 'dateTo' (date-to)
  **/
  setDateInputsToQueryParams(): void {
    const paramFrom = this.queryParams['date-from'];
    const paramTo = this.queryParams['date-to'];
    this.form.controls.dateFrom.setValue(paramFrom ? paramFrom[0] : '');
    this.form.controls.dateTo.setValue(paramTo ? paramTo[0] : '');
  }

  /** setDatasetNameInputToQueryParam
  /* updates the form value 'datasetName' to the page query parameter 'dataset-name'
  */
  setDatasetNameInputToQueryParam(): void {
    const param = this.queryParams['dataset-name'];
    if (param) {
      this.form.controls.datasetName.setValue(param[0]);
    }
  }

  /** getEnabledFilterNames
  /* get a list of filter names that are enabled in the form
  /* @returns Array<string>
  */
  getEnabledFilterNames(): Array<string> {
    return this.facetConf.filter((filterName: string) => {
      return this.form.controls[filterName].enabled;
    });
  }

  /** isFilterApplied
  /* Template utility
  /* @param { string? : filterName } - the filter to check (any if not supplied)
  /* @returns boolean
  */
  isFilterApplied(filterName?: string): boolean {
    return (filterName ? [filterName] : this.facetConf).some((name: string) => {
      return Object.values(this.form.value[name] || {}).some((val: boolean) => {
        return val;
      });
    });
  }

  /** getSetCheckboxValues
  /*
  /* gets the values of the set values in a filter
  /*
  /* @param { string? } filterName - the filter to return
  /* @returns Array<string>
  */
  getSetCheckboxValues(filterName: string): Array<string> {
    const vals = this.form.value[filterName];
    return vals
      ? Object.keys(vals).filter((key: string) => {
          return vals[key];
        })
      : [];
  }

  /** isDeadFacet
  /* Detect if a facet value is present in the filterData
  /* @returns boolean
  */
  isDeadFacet(filterName: string, filterValue: string): boolean {
    if (Object.keys(this.filterData).length === 0) {
      return false;
    }
    const res = this.filterData[filterName].findIndex((nl: NameLabel) => {
      return nl.name === filterValue;
    });
    return res === -1;
  }

  /** datesClear
  /* Template utility: removes the date fields from the form and calls updatePageUrl
  */
  datesClear(): void {
    this.form.controls.dateFrom.setValue('');
    this.form.controls.dateTo.setValue('');
    this.updatePageUrl();
  }

  /** enableFilters
  /* enables all filter form controls
  /* sets disabled to false on related filterStates
  */
  enableFilters(): void {
    this.facetConf.forEach((name: string) => {
      this.form.controls[name].enable();
      this.filterStates[name].disabled = false;
    });
  }

  /** updateFilterAvailability
  /* calls enableFilters
  /* disables filter form controls according to active facet
  /* sets disabled to true on related filterState
  */
  updateFilterAvailability(): void {
    this.enableFilters();
    this.filterStates[this.form.value['facetParameter']].disabled = true;
  }

  /** updatePageUrl
  /* Navigate to url according to form state
  */
  updatePageUrl(skipLoad?: boolean): void {
    const qp = {};

    this.getEnabledFilterNames().forEach((filterName: string) => {
      const filterVals = this.getSetCheckboxValues(filterName).map(
        (s: string) => {
          return fromInputSafeName(s);
        }
      );
      if (filterVals.length > 0) {
        qp[filterName] = filterVals;
      }
    });

    const dataset = this.form.value.datasetName;
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;

    if (valFrom) {
      qp['date-from'] = new Date(valFrom).toISOString().split('T')[0];
    }
    if (valTo) {
      qp['date-to'] = new Date(valTo).toISOString().split('T')[0];
    }
    if (dataset) {
      qp['dataset-name'] = dataset;
    }
    if (this.form.value.contentTierZero) {
      qp['content-tier-zero'] = true;
    }

    if (skipLoad) {
      this.queryParams = qp;
    }
    this.router.navigate([`data/${this.form.value['facetParameter']}`], {
      queryParams: Object.assign(qp, this.disabledParams)
    });
  }

  /** triggerLoad
  /* invokes beginPolling or triggers a data refresh
  /* calls updateFilterAvailability once data is loaded
  **/
  triggerLoad(): void {
    const onDataReady = (refresh = false): void => {
      this.updateFilterAvailability();
      if (refresh) {
        this.pollRefresh.next(true);
      }
    };
    if (!this.pollRefresh) {
      this.beginPolling(onDataReady);
    } else {
      onDataReady(true);
    }
  }

  /** switchFacet
  /* UI soft-refresh: re-process data / update menus / update page url
  **/
  switchFacet(): void {
    // re-process currently-loaded data
    this.postProcessResult();
    this.updateFilterAvailability();
    this.updatePageUrl();
  }

  /** clearFilter
  /*
  /* clears the form values for a single filter or all filters
  /* @param { number } filterName - the name of filter to clear
  */
  clearFilter(filterName?: string): void {
    (filterName ? [filterName] : this.facetConf).forEach((name: string) => {
      this.form.get(name).reset();
    });
    this.updatePageUrl();
  }

  /** closeFilters
  /*
  /* Utility for closing menus
  /* @param { string } exempt - optional filter to ignore
  */
  closeFilters(exempt = ''): void {
    Object.keys(this.filterStates)
      .filter((s: string) => {
        return s !== exempt;
      })
      .forEach((s: string) => {
        this.filterStates[s].visible = false;
      });
  }

  /** extractSeriesServerData
  /* @param { number } facetIndex - the index of the facet to use
  */
  extractSeriesServerData(br: BreakdownResult): void {
    const chartData = br.results.map((cpv: CountPercentageValue) => {
      let formattedName;
      if (this.form.value.facetParameter === DimensionName.rights) {
        formattedName = rightsUrlMatch(cpv.value);
      }
      return {
        name: formattedName ? formattedName : cpv.value,
        value: cpv.count,
        percent: cpv.percentage
      };
    });

    const filtersApplied = Object.keys(this.queryParams).length > 0;

    // store as hidden unless "all"
    this.storeSeries(true, !filtersApplied, chartData, this.resultTotal);
    this.showAppliedSeriesInGridAndChart();
  }

  /* showAppliedSeriesInGrid
  /*
  /* sets table set table rows (combined series)
  */
  showAppliedSeriesInGrid(): void {
    const seriesKeys = this.snapshots.filteredCDKeys(
      this.form.value.facetParameter,
      'applied'
    );

    const rows = this.snapshots.getSeriesDataForGrid(
      this.form.value.facetParameter,
      seriesKeys
    );

    this.grid.isShowingSeriesInfo = seriesKeys.length > 1;
    this.grid.setRows(rows);
  }
}

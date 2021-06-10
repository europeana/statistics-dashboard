import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Location } from '@angular/common';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';

import {
  ColumnMode,
  DatatableComponent,
  DatatableRowDetailDirective
} from '@swimlane/ngx-datatable';

import { environment } from '../../environments/environment';
import { BarChartCool } from '../chart/chart-defaults';

import {
  ExportType,
  Facet,
  FacetField,
  FmtTableData,
  HeaderNameType,
  IHashArray,
  MenuState,
  NameValue,
  RawFacet,
  TableRow
} from '../_models';

import { APIService, ExportCSVService, ExportPDFService } from '../_services';
import { DataPollingComponent } from '../data-polling';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent extends DataPollingComponent implements OnInit {
  @ViewChild('dataTable') dataTable: DatatableComponent;
  @ViewChild('downloadAnchor') downloadAnchor: ElementRef;
  @ViewChild('pieChart') pieChart: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('dateFrom') dateFrom: ElementRef;
  @ViewChild('dateTo') dateTo: ElementRef;

  // Make chart settings available to template
  public BarChartCool = BarChartCool;

  today = new Date().toISOString().split('T')[0];
  yearZero = new Date(Date.parse('20 Nov 2008 12:00:00 GMT'))
    .toISOString()
    .split('T')[0];
  totalResults = 0;

  chartTypes = ['Bar', 'Pie', 'Gauge'];
  columnNames = ['name', 'count', 'percent'].map((x) => x as HeaderNameType);
  exportTypes: Array<ExportType> = [ExportType.CSV, ExportType.PDF];

  facetConf = [
    'contentTier',
    'metadataTier',
    'COUNTRY',
    'TYPE',
    'RIGHTS',
    'DATA_PROVIDER',
    'PROVIDER'
  ];

  menuStates: { [key: string]: MenuState } = {};
  contentTiersOptions = Array(5)
    .fill(0)
    .map((x, index) => `${x + index}`);

  colours = [
    '#1676AA',
    '#37B98B',
    '#E11D53',
    '#7F3978',
    '#D43900',
    '#FFAE00',
    '#F22F24',
    '#D43900',
    '#E11D53',
    '#37B98B',
    '#4BC0F0',
    '#1676AA',
    '#7F3978'
  ];

  colorScheme = {
    domain: this.colours
  };

  ColumnMode = ColumnMode;

  pollRefresh: Subject<boolean>;

  form: FormGroup;

  chartOptionsOpen = false;
  downloadOptionsOpen = false;
  isShowingSearchList = false;

  showBar = true;
  showPie = false;
  showGauge = false;
  isLoading = false;

  selFacetIndex = 0;
  allFacetData: Array<Facet>;

  chartData: Array<NameValue>;
  tableData: FmtTableData;

  filterData: IHashArray = {};
  queryParams: Params = {};

  constructor(
    private api: APIService,
    private csv: ExportCSVService,
    private pdf: ExportPDFService,
    private fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,

    private location: Location
  ) {
    super();
    this.buildForm();
    this.initialiseMenuStates();
  }

  /** ngOnInit
  /* Event hook: subscribe to changes in the route / query params
  /*
  */
  ngOnInit(): void {
    this.subs.push(
      combineLatest(this.route.params, this.route.queryParams).subscribe(
        (params) => {
          console.log(params);
          console.log(JSON.stringify(params));
          if (params[0].facet) {
            this.form.controls.facetParameter.setValue(params[0].facet);
          }
          const combinedParams = {};
          if (params.length > 1) {
            params.slice(1).forEach((ob) => {
              Object.keys(ob).forEach((s: string) => {
                combinedParams[s] = Array.isArray(ob[s]) ? ob[s] : [ob[s]];
              });
            });
          }
          this.queryParams = combinedParams;
          this.setCtZeroInputToQueryParam();
          this.setDateInputsToQueryParams();
          this.setDatasetNameInputToQueryParam();
          this.urlChanged();
        }
      )
    );
  }

  export(type: ExportType): false {
    this.downloadOptionsOpen = false;

    if (type === ExportType.CSV) {
      const res = this.csv.csvFromTableRows(
        this.columnNames,
        this.tableData.tableRows
      );
      this.csv.download(res, this.downloadAnchor);
    } else if (type === ExportType.PDF) {
      this.pdf
        .getChartAsImageUrl(this.canvas, this.pieChart)
        .then((imgUrl: string) => {
          this.pdf.download(this.tableData, imgUrl);
        });
    }
    return false;
  }

  /** getUrl
  /* returns a url parameter string (for api or the portal) according to the form state
  /* @returns string
  */
  getUrl(): string {
    // filterParam cannot rely on checkbox values as filters aren't built until the allFacetData is initialised
    const nonFilterQPs = [
      'content-tier-zero',
      'date-from',
      'date-to',
      'dataset-name'
    ];
    let filterParam = Object.keys(this.queryParams)
      .map((key: string) => {
        const innerRes = [];
        const values = `${this.queryParams[key]}`.split(',');

        if (!nonFilterQPs.includes(key)) {
          values.forEach((valPart: string) => {
            innerRes.push(`${key}:"${encodeURIComponent(valPart)}"`);
          });
        }
        return innerRes.join('&qf=');
      })
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
  getUrlRow(qfVal: string): string {
    return `${environment.serverPortal}${this.getUrl(true)}&qf=${
      this.form.value.facetParameter
    }:"${encodeURIComponent(qfVal)}"`;
  }

  setIsShowingSearchList(tf: boolean): void {
    this.isShowingSearchList = tf;
  }

  /** beginPolling
  /* - set up data polling for facet data
  */
  beginPolling(fnCallback?: (refresh?: boolean) => void): void {
    this.pollRefresh = this.createNewDataPoller(
      60 * 100000,
      () => {
        this.isLoading = true;
        const url = `${this.getUrl()}&rows=0&profile=facets${this.getFormattedFacetParam()}`;
        return this.api.loadAPIData(url);
      },
      (rawResult: RawFacet) => {
        this.isLoading = false;

        if (rawResult.facets) {
          this.selFacetIndex = this.findFacetIndex(
            this.form.value.facetParameter,
            rawResult.facets
          );

          // initialise filterData and add checkboxes
          this.facetConf.forEach((name: string) => {
            const filterOps = this.getFilterOptions(name, rawResult.facets);
            this.filterData[name] = filterOps;
            this.addOrUpdateFilterControls(name, filterOps);
          });

          this.allFacetData = rawResult.facets;
          this.totalResults = rawResult.totalResults;

          // set pie and table data
          this.chartData = this.extractChartData();
          this.extractTableData();
        } else {
          this.totalResults = 0;
          this.chartData = [];
          this.tableData = {
            columns: this.columnNames,
            tableRows: []
          };
        }
        if (fnCallback) {
          fnCallback();
        }
      }
    ).getPollingSubject();
  }

  initialiseMenuStates(): void {
    this.facetConf.forEach((name: string) => {
      this.menuStates[name] = {
        visible: false,
        disabled: this.form.value.facetParameter === name
      };
    });
  }

  /** addOrUpdateFilterControls
  /*
  /* Adds a FormControl for each option, updates the value if the control exists
  /*
  /* @param { string } name - the name of the filter
  /* @param { Array<string> } options - the filter options
  /*
  */
  addOrUpdateFilterControls(name: string, options: Array<string>): void {
    const checkboxes = this.form.get(name) as FormGroup;

    options.forEach((option: string) => {
      const fName = this.fixName(option);
      const ctrl = this.form.get(`${name}.${fName}`);
      const defaultValue =
        this.queryParams[name] && this.queryParams[name].includes(option);

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
      chartType: [this.chartTypes[0]],
      datasetName: [''],
      dateFrom: ['', this.validateDateFrom.bind(this)],
      dateTo: ['', this.validateDateTo.bind(this)]
    });

    this.facetConf.map((s: string) => {
      this.form.addControl(s, this.fb.group({}));
    });
  }

  /** validateDateGeneric
  /* @param {FormControl} control - the field to validate
  /* @param {string} fieldName - the field name
  /* - returns an errors object map
  */
  validateDateGeneric(
    control: FormControl,
    fieldName: string
  ): { [key: string]: boolean } | null {
    const val = control.value || null;
    let isTooEarly = false;
    let isTooLate = false;
    if (val) {
      const otherField = fieldName === 'dateFrom' ? 'dateTo' : 'dateFrom';
      const dateVal = new Date(val);
      if (dateVal < new Date(this.yearZero)) {
        isTooEarly = true;
      } else if (dateVal > new Date(this.today)) {
        isTooLate = true;
      } else if (this.form.value[otherField].length > 0) {
        const dateOtherVal = new Date(this.form.value[otherField]);
        if (otherField === 'dateFrom') {
          if (dateVal < dateOtherVal) {
            isTooEarly = true;
          }
        } else if (dateVal > dateOtherVal) {
          isTooLate = true;
        }
      }
    }
    return isTooEarly
      ? { isTooEarly: isTooEarly }
      : isTooLate
      ? { isTooLate: isTooLate }
      : null;
  }

  /** validateDateFrom
  /* @param {FormControl} control - the field to validate
  /* - returns an errors object map
  */
  validateDateFrom(control: FormControl): { [key: string]: boolean } | null {
    return this.validateDateGeneric(control, 'dateFrom');
  }

  /** validateDateTo
  /* @param {FormControl} control - the field to validate
  /* - returns an errors object map
  */
  validateDateTo(control: FormControl): { [key: string]: boolean } | null {
    return this.validateDateGeneric(control, 'dateTo');
  }

  /** fixName
  /* @param {string} s - the target string
  /* - removes the dot character from a string
  */
  fixName(s: string): string {
    return s.replace(/\./g, '_____');
  }

  /** unfixName
  /* @param {string} s - the target string
  /* - removes the dot character from a string
  */
  unfixName(s: string): string {
    return s.replace(/_____/g, '.');
  }

  /** findFacetIndex
  /* - get the index of an item in the array
  /* @param {string} facetName - the name of the facet
  /* @param {Array<Facet>} facetData - the array to search
  */
  findFacetIndex(facetName: string, facetData: Array<Facet>): number {
    return facetData.findIndex((f: Facet) => {
      return f.name === facetName;
    });
  }

  /** getFilterOptions
  /* @param {string} facetName - the name of the facet
  /* returns Array<string> of values for a facet
  */
  getFilterOptions(facetName: string, facetData: Array<Facet>): Array<string> {
    const matchIndex = this.findFacetIndex(facetName, facetData);
    return facetData[matchIndex].fields.map((ff: FacetField) => {
      return ff.label;
    });
  }

  /** getFormattedContentTierParam
  /* @returns { string } - concatenated filterContentTier values if present
  /* @returns { string } - contentTierZero value if filterContentTier values not present
  */
  getFormattedContentTierParam(): string {
    let res = '';
    const filterContentTierParam = this.getSetCheckboxValues('contentTier');

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
    return this.facetConf.slice(1).filter((filterName: string) => {
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
  /* gets the names of the set values in a filter
  /*
  /* @param { string? } filterName - the filter to return
  /* @returns Array<string>
  */
  getSetCheckboxValues(filterName: string): Array<string> {
    const checkVals = this.form.value[filterName];
    return checkVals
      ? Object.keys(checkVals).filter((key: string) => {
          return checkVals[key];
        })
      : [];
  }

  /** dateChange
  /* Template utility: corrects @min / @max on the element and calls 'updatePageUrl' if valid
  /* @param {boolean} isDateFrom - flag if dateFrom is the caller
  */
  dateChange(isDateFrom: boolean): void {
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;
    if (isDateFrom) {
      this.dateTo.nativeElement.setAttribute(
        'min',
        valFrom ? valFrom : this.yearZero
      );

      // if the other is already in error, try to fix it
      if (this.form.controls.dateTo.errors) {
        this.form.controls.dateTo.updateValueAndValidity();
      }
    } else {
      this.dateFrom.nativeElement.setAttribute(
        'max',
        valTo ? valTo : this.today
      );
      // if the other is already in error, try to fix it
      if (this.form.controls.dateFrom.errors) {
        this.form.controls.dateFrom.updateValueAndValidity();
      }
    }
    if (
      !this.form.controls.dateFrom.errors &&
      !this.form.controls.dateTo.errors &&
      this.dateFrom.nativeElement.validity.valid &&
      this.dateTo.nativeElement.validity.valid
    ) {
      this.updatePageUrl();
    }
  }

  enableFilters(): void {
    this.facetConf.forEach((name: string) => {
      this.form.controls[name].enable();
      this.menuStates[name].disabled = false;
    });
  }

  /** updatePageUrl
  /* Navigate to url according to form state
  */
  updatePageUrl(): void {
    const qp = {};

    this.getEnabledFilterNames().forEach((filterName: string) => {
      const filterVals = this.getSetCheckboxValues(filterName);
      if (filterVals.length > 0) {
        qp[filterName] = filterVals;
      }
    });

    const ctZero = this.form.value.contentTierZero;
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
    if (ctZero) {
      qp['content-tier-zero'] = true;
    }
    this.router.navigate([`data/${this.form.value['facetParameter']}`], {
      queryParams: qp
    });
  }

  urlChanged(): void {
    const onDataReady = (refresh = false): void => {
      this.enableFilters();
      this.menuStates[this.form.value['facetParameter']].disabled = true;
      this.setIsShowingSearchList(false);

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

  selectOptionEnabled(group: string, val: string): boolean {
    return val === '0' && group === 'contentTier'
      ? this.form.value.contentTierZero
      : true;
  }

  toggleExpandRow(row: DatatableRowDetailDirective): false {
    this.dataTable.rowDetail.toggleExpandRow(row);
    return false;
  }

  getCountTotal(facetData: Array<FacetField>): number {
    let total = 0;
    facetData.forEach((f: FacetField) => {
      total += f.count;
    });
    return total;
  }

  /** extractChartData
  /*
  /* @param { number } facetIndex - the index of the facet to use
  /* @returns Array<NameValue>
  */
  extractChartData(facetIndex = this.selFacetIndex): Array<NameValue> {
    const facetFields = this.allFacetData[facetIndex].fields;
    const total = this.getCountTotal(facetFields);
    return facetFields.map((f: FacetField) => {
      const val = this.form.value.showPercent
        ? parseFloat(((f.count / total) * 100).toFixed(2))
        : f.count;
      return {
        name: f.label,
        value: val
      };
    });
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
  /* Template utility for closing menus
  /* @param { string } exempt - optional filter to ignore
  */
  closeFilters(exempt = ''): void {
    Object.keys(this.menuStates)
      .filter((s: string) => {
        return s !== exempt;
      })
      .forEach((s: string) => {
        this.menuStates[s].visible = false;
      });
  }

  toggleFilterMenu(filterName: string): void {
    this.closeFilters(filterName);
    this.menuStates[filterName].visible = !this.menuStates[filterName].visible;
  }

  toggleChartOptions(): void {
    this.downloadOptionsOpen = false;
    this.chartOptionsOpen = !this.chartOptionsOpen;
  }

  toggleDownloadOptions(): void {
    this.chartOptionsOpen = false;
    this.downloadOptionsOpen = !this.downloadOptionsOpen;
  }

  closeDisplayOptions(): void {
    this.chartOptionsOpen = false;
    this.downloadOptionsOpen = false;
  }

  switchChartType(): void {
    if (this.form.value.chartType === 'Bar') {
      this.showPie = false;
      this.showBar = true;
      this.showGauge = false;
    } else if (this.form.value.chartType === 'Gauge') {
      this.showPie = false;
      this.showBar = false;
      this.showGauge = true;
    } else if (this.form.value.chartType === 'Pie') {
      this.showPie = true;
      this.showBar = false;
      this.showGauge = false;
    }
  }

  /* extractTableData
  /*
  /* - maps array of FacetField objects to TableRow data
  /* - calculates percentage
  /* returns converted data wrapped in a FmtTableData object
  /*
  */
  extractTableData(): void {
    const facetData = this.allFacetData[this.selFacetIndex].fields;
    const total = this.getCountTotal(facetData);

    this.tableData = {
      columns: this.columnNames,
      tableRows: facetData.map((f: FacetField) => {
        return {
          name: f.label,
          count: `${f.count}`,
          percent: `${((f.count / total) * 100).toFixed(2)}%`
        } as TableRow;
      })
    };
  }
}

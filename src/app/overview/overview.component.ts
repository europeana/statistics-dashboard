import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ColumnMode,
  DatatableComponent,
  DatatableRowDetailDirective
} from '@swimlane/ngx-datatable';

import { environment } from '../../environments/environment';
import { BarChartCool } from '../chart/chart-defaults';
import { BarComponent } from '../chart';
import { facetNames } from '../_data';
import { rightsUrlMatch } from '../_helpers';

import {
  ExportType,
  Facet,
  FacetField,
  FacetFieldProcessed,
  FacetProcessed,
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
  @ViewChild(BarComponent) barChart: BarComponent;
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

  columnNames = ['name', 'count', 'percent'].map((x) => x as HeaderNameType);
  exportTypes: Array<ExportType> = [ExportType.CSV, ExportType.PDF];

  facetConf = facetNames;
  nonFilterQPs = ['content-tier-zero', 'date-from', 'date-to', 'dataset-name'];

  menuStates: { [key: string]: MenuState } = {};
  contentTiersOptions = Array(5)
    .fill(0)
    .map((x, index) => `${x + index}`);

  ColumnMode = ColumnMode;

  pollRefresh: Subject<boolean>;

  form: FormGroup;

  downloadOptionsOpen = false;
  isShowingSearchList = false;

  showBar = true;
  isLoading = false;

  selFacetIndex = 0;
  allProcessedFacetData: Array<FacetProcessed>;

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
    private readonly router: Router
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
      combineLatest(this.route.params, this.route.queryParams)
        .pipe(
          map((results) => {
            const qp = results[1];
            const qpValArrays = {};

            Object.keys(qp).forEach((s: string) => {
              qpValArrays[s] = Array.isArray(qp[s]) ? qp[s] : [qp[s]];
            });

            return {
              params: results[0],
              queryParams: qpValArrays
            };
          })
        )
        .subscribe((combined) => {
          const params = combined.params;
          const queryParams = combined.queryParams;
          const loadNeeded =
            !this.allProcessedFacetData ||
            JSON.stringify(queryParams) !== JSON.stringify(this.queryParams);

          if (params.facet) {
            this.form.controls.facetParameter.setValue(params.facet);
          }

          this.queryParams = queryParams;
          this.setCtZeroInputToQueryParam();
          this.setDateInputsToQueryParams();
          this.setDatasetNameInputToQueryParam();

          if (loadNeeded) {
            this.triggerLoad();
          }
        })
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
      this.barChart.getSvgData().then((imgUrl: string) => {
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
    // filterParam cannot rely on checkbox values as filters aren't built until the allProcessedFacetData is initialised

    let filterParam = Object.keys(this.queryParams)
      .map((key: string) => {
        const innerRes = [];
        const values = this.queryParams[key];

        if (!this.nonFilterQPs.includes(key)) {
          values.forEach((valPart: string) => {
            innerRes.push(`${key}:"${encodeURIComponent(valPart)}"`);
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
  getUrlRow(qfVal: string): string {
    return `${environment.serverPortal}${this.getUrl()}&qf=${
      this.form.value.facetParameter
    }:"${encodeURIComponent(qfVal)}"`;
  }

  setIsShowingSearchList(tf: boolean): void {
    this.isShowingSearchList = tf;
  }

  /** processResult
  /*
  /* augment raw result data with percent fields
  /* @returns { boolean } - if valid
  **/
  processResult(rawResult: RawFacet): boolean {
    if (rawResult.facets) {
      this.totalResults = rawResult.totalResults;
      this.allProcessedFacetData = new Array(rawResult.facets.length);

      rawResult.facets.forEach((f: Facet) => {
        const runningTotal = f.fields.reduce(function (
          a: FacetField,
          b: FacetField
        ) {
          return {
            label: '',
            count: a.count + b.count
          };
        }).count;

        this.allProcessedFacetData[this.facetConf.indexOf(f.name)] = {
          name: f.name,
          fields: f.fields.map((ff: FacetField) => {
            let labelFormatted = undefined;
            if (f.name === 'RIGHTS') {
              const formatted = rightsUrlMatch(ff.label);
              if (formatted) {
                labelFormatted = formatted;
              }
            }
            return {
              count: ff.count,
              label: ff.label,
              percent: parseFloat(((ff.count / runningTotal) * 100).toFixed(2)),
              labelFormatted: labelFormatted
            };
          })
        };
      });
      return true;
    } else {
      this.totalResults = 0;
      this.chartData = [];
      this.tableData = {
        columns: this.columnNames,
        tableRows: []
      };
      return false;
    }
  }

  /**
  /* postProcessResult
  /*
  /* handles data-driven UI
  */
  postProcessResult(): void {
    this.selFacetIndex = this.findFacetIndex(
      this.form.value.facetParameter,
      this.allProcessedFacetData
    );

    if (this.selFacetIndex < 0) {
      console.error('unreadable data');
      return;
    }

    // initialise filterData and add checkboxes
    this.facetConf.forEach((name: string) => {
      const filterOps = this.getFilterOptions(name, this.allProcessedFacetData);
      this.filterData[name] = filterOps;
      this.addOrUpdateFilterControls(name, filterOps);
    });

    // set pie and table data
    this.extractChartData();
    this.extractTableData();
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
        if (this.processResult(rawResult)) {
          this.postProcessResult();
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
      const fName = this.toInputSafeName(option);
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

  /** toInputSafeName
  /* @param {string} s - the target string
  /* - replaces the dot character in a string with 5 underscores
  */
  toInputSafeName(s: string): string {
    return s.replace(/\./g, '_____');
  }

  /** fromInputSafeName
  /* @param {string} s - the target string
  /* - replaces the 5 underscore characters in a string with a dot
  */
  fromInputSafeName(s: string): string {
    return s.replace(/_____/g, '.');
  }

  /** findFacetIndex
  /* - get the index of an item in the array
  /* @param {string} facetName - the name of the facet
  /* @param {Array<Facet>} facetData - the array to search
  */
  findFacetIndex(facetName: string, facetData: Array<FacetProcessed>): number {
    return facetData.findIndex((f: Facet) => {
      return f.name === facetName;
    });
  }

  /** getFilterOptions
  /* @param {string} facetName - the name of the facet
  /* returns Array<string> of values for a facet
  */
  getFilterOptions(
    facetName: string,
    facetData: Array<FacetProcessed>
  ): Array<string> {
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
    const checkVals = this.form.value[filterName];
    return checkVals
      ? Object.keys(checkVals)
          .filter((key: string) => {
            return checkVals[key];
          })
          .map(this.fromInputSafeName)
      : [];
  }

  /** datesClear
  /* Template utility: removes the date fields from the form and calls updatePageUrl
  */
  datesClear(): void {
    this.form.controls.dateFrom.setValue('');
    this.form.controls.dateTo.setValue('');
    this.updatePageUrl();
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

    this.router.navigate([`data/${this.form.value['facetParameter']}`], {
      queryParams: qp
    });
  }

  updateMenuAvailability(): void {
    this.enableFilters();
    this.menuStates[this.form.value['facetParameter']].disabled = true;
    this.setIsShowingSearchList(false);
  }

  /** triggerLoad
  /* invokes beginPolling or triggers a data refresh
  /* calls updateMenuAvailability once data is loaded
  **/
  triggerLoad(): void {
    const onDataReady = (refresh = false): void => {
      this.updateMenuAvailability();
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
    this.updateMenuAvailability();
    this.updatePageUrl();
  }

  toggleExpandRow(row: DatatableRowDetailDirective): false {
    this.dataTable.rowDetail.toggleExpandRow(row);
    return false;
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

  toggleDownloadOptions(): void {
    this.downloadOptionsOpen = !this.downloadOptionsOpen;
  }

  closeDisplayOptions(): void {
    this.downloadOptionsOpen = false;
  }

  /** extractChartData
  /*
  /* sets this.chartData
  /* @param { number } facetIndex - the index of the facet to use
  */
  extractChartData(facetIndex = this.selFacetIndex): void {
    const facetFields = this.allProcessedFacetData[facetIndex].fields;
    this.chartData = facetFields.slice(0, 5).map((ff: FacetFieldProcessed) => {
      return {
        name: ff.labelFormatted ? ff.labelFormatted : ff.label,
        value: this.form.value.showPercent ? ff.percent : ff.count
      };
    });
  }

  /* extractTableData
  /*
  /* sets this.tableData
  */
  extractTableData(): void {
    const facetData = this.allProcessedFacetData[this.selFacetIndex].fields;
    this.tableData = {
      columns: this.columnNames,
      tableRows: facetData.map((ff: FacetFieldProcessed) => {
        return {
          name: ff.labelFormatted ? ff.labelFormatted : ff.label,
          count: `${ff.count}`,
          percent: `${ff.percent}`
        } as TableRow;
      })
    };
  }
}

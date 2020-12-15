import {
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

import {
  ColumnMode,
  DatatableComponent,
  DatatableRowDetailDirective
} from '@swimlane/ngx-datatable';

import {
  ExportType,
  Facet,
  FacetField,
  FmtTableData,
  HeaderNameType,
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
export class OverviewComponent extends DataPollingComponent {
  @ViewChild('dataTable') dataTable: DatatableComponent;
  @ViewChild('downloadAnchor') downloadAnchor: ElementRef;
  @ViewChild('pieChart') pieChart: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('dateFrom') dateFrom: ElementRef;
  @ViewChild('dateTo') dateTo: ElementRef;

  today = new Date().toISOString().split('T')[0];
  yearZero = new Date(Date.parse('20 Nov 2008 12:00:00 GMT'))
    .toISOString()
    .split('T')[0];
  totalResults = 0;

  chartTypes = ['Pie', 'Bar', 'Gauge'];
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

  menuStates: { [key: string]: MenuState } = {
    filterContentTier: { visible: false }
  };

  contentTiersOptions = Array(5)
    .fill(0)
    .map((x, index) => `${x + index}`);

  colorScheme = {
    domain: [
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
    ]
  };

  ColumnMode = ColumnMode;

  pollRefresh: Subject<boolean>;

  form: FormGroup;

  chartOptionsOpen = false;
  downloadOptionsOpen = false;
  isShowingSearchList = true;

  showPie = true;
  showBar = false;
  showGauge = false;
  isLoading = true;

  selFacetIndex = 0;
  allFacetData: Array<Facet>;
  chartData: Array<NameValue>;
  tableData: FmtTableData;

  constructor(
    private api: APIService,
    private csv: ExportCSVService,
    private pdf: ExportPDFService,
    private fb: FormBuilder
  ) {
    super();
    this.buildForm();
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
  /* @param {boolean} portal - the url type returned
  /* returns the url (portal or api) according to the form state
  */
  getUrl(portal = false): string {
    let server;
    const filterParam = this.getFormattedFilterParam();
    const datasetNameParam = this.getFormattedDatasetNameParam();
    const dateParam = this.getFormattedDateParam();
    let apiOnly = '';
    let ct = '';

    if (portal) {
      server = 'https://www.europeana.eu/en/search';
    } else {
      ct = this.getFormattedContentTierParam();
      server = 'https://api.europeana.eu/record/v2/search.json';
      apiOnly =
        '&wskey=api2demo&rows=0&profile=facets' + this.getFormattedFacetParam();
    }
    return (
      `${server}?rows=0${ct}${apiOnly}${filterParam}${dateParam}` +
      (datasetNameParam.length > 0 ? `&query=${datasetNameParam}` : '&query=*')
    );
  }

  /** getUrlRow
  /* @param {string} qfVal - the specific item's value for the currently-selected facet
  /* returns the (portal) url for a specific item
  */
  getUrlRow(qfVal: string): string {
    return `${this.getUrl(true)}&qf=${
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
        return this.api.loadAPIData(this.getUrl());
      },
      (rawResult: RawFacet) => {
        this.isLoading = false;
        if (rawResult.facets) {
          this.selFacetIndex = this.findFacetIndex(
            this.form.value.facetParameter,
            rawResult.facets
          );

          this.facetConf.forEach((name: string) => {
            this.addMenuCheckboxes(
              name,
              this.getSelectOptions(name, rawResult.facets)
            );
          });

          this.allFacetData = rawResult.facets;
          this.totalResults = rawResult.totalResults;

          // set pie and table data
          this.extractChartData();
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

  addMenuCheckboxes(name: string, options: Array<string>): void {
    const checkboxes = this.form.get(name) as FormGroup;
    if (!this.menuStates[name]) {
      this.menuStates[name] = {
        visible: false,
        disabled: this.form.value.facetParameter === name
      };
    }
    options.forEach((option: string) => {
      const fName = this.fixName(option);
      if (!this.form.get(name + '.' + fName)) {
        checkboxes.addControl(fName, new FormControl(false));
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

  /** getSelectOptions
  /* @param {string} facetName - the name of the facet
  /* returns Array<string> of values for a facet
  */
  getSelectOptions(facetName: string, facetData: Array<Facet>): Array<string> {
    const matchIndex = this.findFacetIndex(facetName, facetData);
    return facetData[matchIndex].fields.map((ff: FacetField) => {
      return ff.label;
    });
  }

  /** getFormattedContentTierParam
  /* returns concatenated filterContentTier values if present
  /* returns contentTierZero value if filterContentTier values not present
  */
  getFormattedContentTierParam(): string {
    let res = '';
    const filterContentTierParam = this.getSetCheckboxValues(
      'filterContentTier'
    );
    res = (filterContentTierParam.length > 0
      ? filterContentTierParam
      : this.form.value.contentTierZero
      ? this.contentTiersOptions
      : this.contentTiersOptions.slice(1)
    ).join(' OR ');
    return `&qf=contentTier:(${encodeURIComponent(res)})`;
  }

  /** getFormattedFacetParam
  /* returns facets names formatted as url parameters
  */
  getFormattedFacetParam(): string {
    return this.facetConf
      .map((f) => {
        return `&facet=${encodeURIComponent(f)}`;
      })
      .join('');
  }

  /** getFormattedDatasetNameParam
   */
  getFormattedDatasetNameParam(): string {
    const val = this.form.value.datasetName;
    return val ? `edm_datasetName:${val}` : '';
  }

  /** getFormattedDateParam
   */
  getFormattedDateParam(): string {
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;
    if (valFrom && valTo) {
      const range = `${new Date(valFrom).toISOString()}+TO+${new Date(
        valTo
      ).toISOString()}`;
      return `&qf=timestamp_update:%5B${range}%5D`;
    }
    return '';
  }

  /** getFormattedFilterParam
  /* returns concatentated filter names-value pairs formatted as url parameters
  /* @param {string} def - the default return value
  */
  getFormattedFilterParam(): string {
    return this.facetConf
      .slice(1)
      .filter((filterName: string) => {
        return this.form.controls[filterName].enabled;
      })
      .map((filterName: string) => {
        return this.getSetCheckboxValues(filterName)
          .map((value: string) => {
            const unfixed = this.unfixName(value);
            return `&qf=${filterName}:"${encodeURIComponent(unfixed)}"`;
          })
          .join('');
      })
      .join('');
  }

  getCheckboxValuesPresent(filterName?: string): boolean {
    return (filterName ? [filterName] : this.facetConf).some((name: string) => {
      return Object.values(this.form.value[name] || {}).some((val: boolean) => {
        return val;
      });
    });
  }

  getSetCheckboxValues(filterName: string): Array<string> {
    const checkVals = this.form.value[filterName];
    return checkVals
      ? Object.keys(checkVals).filter((key: string) => {
          return checkVals[key];
        })
      : [];
  }

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
      this.refresh();
    }
  }

  enableFilters(): void {
    this.facetConf.forEach((name: string) => {
      this.form.controls[name].enable();
      this.menuStates[name].disabled = false;
    });
  }

  switchFacet(disableName: string): void {
    const onDataReady = (refresh = false): void => {
      this.enableFilters();
      this.form.controls[disableName].disable();
      this.menuStates[disableName].disabled = true;
      this.setIsShowingSearchList(false);
      if (refresh) {
        this.refresh();
      }
    };
    if (!this.pollRefresh) {
      this.beginPolling(onDataReady);
    } else {
      onDataReady(true);
    }
  }

  refresh(): void {
    this.pollRefresh.next(true);
  }

  selectOptionEnabled(group: string, val: string): boolean {
    const ctZero = this.form.value.contentTierZero;
    return !(group === 'contentTier' && val === '0' && ctZero);
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

  extractChartData(): void {
    const facetFields = this.allFacetData[this.selFacetIndex].fields;
    const total = this.getCountTotal(facetFields);

    this.chartData = facetFields.map((f: FacetField) => {
      const val = this.form.value.showPercent
        ? parseFloat(((f.count / total) * 100).toFixed(2))
        : f.count;
      return {
        name: f.label,
        value: val
      };
    });
  }

  clearFilter(filterName?: string): void {
    (filterName ? [filterName] : this.facetConf).forEach((name: string) => {
      this.form.get(name).reset();
    });
    this.refresh();
  }

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

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
  HeaderNameType,
  MenuState,
  FacetField,
  TableRow,
  FmtTableData,
  Facet,
  NameValue,
  RawFacet,
  ExportType
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

  showPie = true;
  showBar = false;
  showGauge = false;
  showTab = true;
  isLoading = true;
  selFacetIndex = 0;
  allFacetData: Array<Facet>;
  chartData: Array<NameValue>;
  tableData: FmtTableData;
  tableDataRowsVisible = 5;

  constructor(
    private api: APIService,
    private csv: ExportCSVService,
    private pdf: ExportPDFService,
    private fb: FormBuilder
  ) {
    super();
    this.buildForm();
    this.beginPolling();
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
    let apiOnly = '';
    let server;
    const ct = this.getFormattedContentTierParam();
    const filterParam = this.getFormattedFilterParam();
    const datasetNameParam = this.getFormatteddatasetNameParam();
    const dateParam = this.getFormattedDateParam();

    if (portal) {
      server = 'https://www.europeana.eu/en/search';
    } else {
      server = 'https://api.europeana.eu/record/v2/search.json';
      apiOnly =
        '&wskey=api2demo&profile=facets&rows=0' + this.getFormattedFacetParam();
    }
    return `${server}?query=*${ct}${apiOnly}${filterParam}${datasetNameParam}${dateParam}`;
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

  /** beginPolling
  /* - set up data polling for facet data
  */
  beginPolling(): void {
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
          this.tableDataRowsVisible = 2;
          this.chartData = [];
          this.tableData = {
            columns: this.columnNames,
            tableRows: []
          };
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
      facetParameter: [this.facetConf[0]],
      contentTierZero: [false],
      showPercent: [false],
      chartType: [this.chartTypes[0]],
      datasetName: [''],
      dateFrom: [''],
      dateTo: ['']
    });

    this.facetConf.map((s: string) => {
      this.form.addControl(s, this.fb.group({}));
    });
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

  /** getFormatteddatasetNameParam
   */
  getFormatteddatasetNameParam(): string {
    const val = this.form.value.datasetName;
    return val ? `&facet=edm_datasetName&qf=edm_datasetName:${val}` : '';
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
      this.dateTo.nativeElement.setAttribute('min', valFrom);
    } else {
      this.dateFrom.nativeElement.setAttribute(
        'max',
        valTo ? valTo : this.today
      );
    }
    this.refresh();
  }

  enableFilters(): void {
    this.facetConf.forEach((name: string) => {
      this.form.controls[name].enable();
      this.menuStates[name].disabled = false;
    });
  }

  switchFacet(disableName: string): void {
    this.enableFilters();
    this.form.controls[disableName].disable();
    this.menuStates[disableName].disabled = true;
    this.refresh();
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
  /* @param
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

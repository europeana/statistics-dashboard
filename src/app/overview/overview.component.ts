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

import { facetNames } from '../_data';
import { RenameRightsPipe } from '../_translate';

import { environment } from '../../environments/environment';
import { BarChartCool } from '../chart/chart-defaults';
import { BarComponent } from '../chart';
import { SnapshotsComponent } from '../snapshots';

import {
  fromInputSafeName,
  rightsUrlMatch,
  toInputSafeName,
  validateDateGeneric
} from '../_helpers';

import {
  ExportType,
  Facet,
  FacetField,
  FacetFieldProcessed,
  FacetProcessed,
  FilterState,
  HeaderNameType,
  IHashArrayNameLabel,
  IHashNumber,
  NameLabel,
  NameValuePercent,
  RawFacet
} from '../_models';

import { APIService, ExportCSVService, ExportPDFService } from '../_services';
import { DataPollingComponent } from '../data-polling';
import { GridComponent } from '../grid';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [RenameRightsPipe],
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent extends DataPollingComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('downloadAnchor') downloadAnchor: ElementRef;
  @ViewChild('barChart') barChart: BarComponent;
  @ViewChild('snapshots') snapshots: SnapshotsComponent;
  @ViewChild('canvas') canvas: ElementRef;

  // Make variables available to template
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

  exportTypes: Array<ExportType> = [ExportType.CSV, ExportType.PDF];

  experimental = true;

  facetConf = facetNames;
  nonFilterQPs = ['content-tier-zero', 'date-from', 'date-to', 'dataset-name'];

  filterStates: { [key: string]: FilterState } = {};
  contentTiersOptions = Array(5)
    .fill(0)
    .map((x, index) => `${x + index}`);

  pollRefresh: Subject<boolean>;

  form: FormGroup;

  downloadOptionsOpen = false;
  isShowingSearchList = false;

  isLoading = false;

  selFacetIndex = 0;
  allProcessedFacetData: Array<FacetProcessed>;

  filterData: IHashArrayNameLabel = {};
  queryParams: Params = {};

  constructor(
    private api: APIService,
    private csv: ExportCSVService,
    private pdf: ExportPDFService,
    private fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly renameRights: RenameRightsPipe
  ) {
    super();
    this.buildForm();
    this.initialiseFilterStates();
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
        ['colour', 'series', 'name', 'count', 'percent'].map((x) => {
          return x as HeaderNameType;
        }),
        this.grid.getTableRows()
      );
      this.csv.download(res, this.downloadAnchor);
    } else if (type === ExportType.PDF) {
      this.barChart.getSvgData().then((imgUrl: string) => {
        this.pdf.download(this.grid.tableData, imgUrl);
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
      this.grid.setRows([]);
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
    this.extractSeriesData();
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
    nvs: Array<NameValuePercent>
  ): void {
    const name = this.seriesNameFromUrl();
    let label = `All (${this.form.value.facetParameter})`;

    // Generate human-readable label
    if (Object.keys(this.queryParams).length > 0) {
      label = Object.keys(this.queryParams)
        .map((key: string) => {
          const innerRes = [];
          const values = this.queryParams[key];
          if (!this.nonFilterQPs.includes(key)) {
            values
              .map((s: string) => {
                return fromInputSafeName(s);
              })
              .forEach((valPart: string) => {
                innerRes.push(valPart);
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
      dataPercent: this.iHashNumberFromNVPs(nvs, true),
      applied: applied,
      pinIndex: 0,
      saved: saved
    });
  }

  /** removeSeries
  /*  Invokes functions to remove series from the chart and table
  /* @param { string : seriesKey } - the key of the series to remove
   */
  removeSeries(seriesKey: string): void {
    this.removeSeriesFromChart(seriesKey);
    this.showAppliedSeriesInTable();
  }

  /** removeSeriesFromChart
  /*  Sets series.applied to false and removes it from the chart
  /* @param { string : seriesKey } - the key of the series to remove
   */
  removeSeriesFromChart(seriesKey: string): void {
    this.barChart.removeSeries(seriesKey);
    this.snapshots.unapply(seriesKey);
  }

  /** addSeries
  /*  Calls functions to add series data to the bar chart and the table
  /* @param { Array<string> : seriesKeys } - the keys of the series to add
   */
  addSeries(seriesKeys: Array<string>): void {
    this.addSeriesToChart(seriesKeys);
    this.showAppliedSeriesInTable();
  }

  /** addSeriesToChart
  /*  Add series data to the bar chart
  /*  (colours handled by snapshots)
  /* @param { Array<string> : seriesKeys } - the keys of the series to visualise
   */
  addSeriesToChart(seriesKeys: Array<string>): void {
    const seriesData = this.snapshots.applySeries(
      this.form.value.facetParameter,
      seriesKeys,
      this.form.value.showPercent
    );
    const fn = (): void => {
      this.barChart.addSeries(seriesData);
    };
    setTimeout(fn, 0);
  }

  /** addAppliedSeriesToChart
  /*  adds all compareData entries (where applied = true)
   */
  addAppliedSeriesToChart(): void {
    this.addSeriesToChart(
      this.snapshots.filteredCDKeys(this.form.value.facetParameter, 'applied')
    );
  }

  /** togglePercent
  /*  removes all series objects from the barchart
  /*  re-applies series....
   */
  togglePercent(): void {
    this.barChart.removeAllSeries();
    this.snapshots.clearColourIndexes();
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
  ): Array<NameLabel> {
    const matchIndex = this.findFacetIndex(facetName, facetData);
    return facetData[matchIndex].fields.map((ff: FacetField) => {
      let prefix = '';
      let label = ff.label;

      if (['contentTier', 'metadataTier'].includes(facetName)) {
        prefix = 'Tier ';
      } else if ('RIGHTS' === facetName) {
        label = this.renameRights.transform(label);
      }
      return {
        name: toInputSafeName(ff.label),
        label: prefix + label
      };
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
    this.setIsShowingSearchList(false);
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
      queryParams: qp
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

  toggleDownloadOptions(): void {
    this.downloadOptionsOpen = !this.downloadOptionsOpen;
  }

  closeDisplayOptions(): void {
    this.downloadOptionsOpen = false;
  }

  /** extractSeriesData
  /*
  /* @param { number } facetIndex - the index of the facet to use
  */
  extractSeriesData(facetIndex = this.selFacetIndex): void {
    const facetFields = this.allProcessedFacetData[facetIndex].fields;

    if (this.barChart) {
      // force refresh of axes when switching category
      this.barChart.drawChart();
    }

    const chartData = facetFields.map((ff: FacetFieldProcessed) => {
      return {
        name: ff.labelFormatted ? ff.labelFormatted : ff.label,
        value: ff.count,
        percent: ff.percent
      };
    });

    const filtersApplied = Object.keys(this.queryParams).length > 0;

    // store as hidden unless "all"
    this.storeSeries(true, !filtersApplied, chartData);

    // show other applied
    this.addAppliedSeriesToChart();
    this.showAppliedSeriesInTable();
  }

  /* showAppliedSeriesInTable
  /*
  /* sets table set table rows (combined series)
  */
  showAppliedSeriesInTable(): void {
    const seriesKeys = this.snapshots.filteredCDKeys(
      this.form.value.facetParameter,
      'applied'
    );

    const rows = this.snapshots.getSeriesDataForTable(
      this.form.value.facetParameter,
      seriesKeys
    );

    this.grid.showingSeriesInfo = seriesKeys.length > 1;
    this.grid.setRows(rows);
  }
}

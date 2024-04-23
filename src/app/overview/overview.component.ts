import {
  Component,
  inject,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  DatePipe,
  formatDate,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet
} from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  externalLinks,
  facetNames,
  nonFacetFilters,
  portalNames,
  portalNamesFriendly
} from '../_data';
import {
  filterList,
  fromCSL,
  fromInputSafeName,
  getDateAsISOString,
  today,
  toInputSafeName,
  validateDateGeneric,
  yearZero
} from '../_helpers';
import { BarChartCool } from '../chart/chart-defaults';
import { SubscriptionManager } from '../subscription-manager';
import {
  BreakdownRequest,
  BreakdownResult,
  BreakdownResults,
  CountPercentageValue,
  DimensionName,
  FilterInfo,
  FilterOptionSet,
  FilterState,
  FmtTableData,
  IHash,
  IHashArray,
  NameLabel,
  NameLabelValid,
  NamesValuePercent,
  NonFacetFilterNames,
  RequestFilter
} from '../_models';

import { APIService } from '../_services';
import { BarComponent } from '../chart';
import { SnapshotsComponent } from '../snapshots';
import { ExportComponent } from '../export';
import { GridComponent } from '../grid';
import { GridSummaryComponent } from '../grid-summary';
import { RenameApiFacetPipe } from '../_translate/rename-facet.pipe';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { IsScrollableDirective } from '../_directives/is-scrollable/is-scrollable.directive';
import { FilterComponent } from '../filter/filter.component';
import { CTZeroControlComponent } from '../ct-zero-control/ct-zero-control.component';
import { ResizeComponent } from '../resize/resize.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ResizeComponent,
    MatDialogModule,
    RouterLink,
    CTZeroControlComponent,
    NgIf,
    NgFor,
    NgTemplateOutlet,
    FilterComponent,
    IsScrollableDirective,
    CheckboxComponent,
    ExportComponent,
    BarComponent,
    GridSummaryComponent,
    SnapshotsComponent,
    GridComponent,
    DatePipe,
    RenameApiFacetPipe
  ]
})
export class OverviewComponent extends SubscriptionManager implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridSummary') gridSummary: GridSummaryComponent;
  @ViewChild('export') export: ExportComponent;
  @ViewChild('barChart') barChart: BarComponent;
  @ViewChild('snapshots') snapshots: SnapshotsComponent;
  @ViewChild('dialogRef') dialogRef!: TemplateRef<HTMLElement>;

  private readonly api = inject(APIService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Make variables available to template
  public fromCSL = fromCSL;
  public emptyDataset = true;
  public externalLinks = externalLinks;
  public DimensionName = DimensionName;
  public toInputSafeName = toInputSafeName;
  public fromInputSafeName = fromInputSafeName;
  public NonFacetFilterNames = NonFacetFilterNames;
  public nonFacetFilters = nonFacetFilters;
  public tierPrefix = $localize`:@@tierPrefix@@:Tier `;

  public barChartSettings = {
    prefixValueAxis: '',
    ...BarChartCool
  };

  public barChartSettingsTiers = {
    prefixValueAxis: this.tierPrefix,
    ...BarChartCool
  };

  readonly MAX_FILTER_OPTIONS = 50;
  readonly facetConf = facetNames;

  filterStates: { [key: string]: FilterState } = {};
  userFilterSearchTerms = facetNames.reduce((newMap, item: string) => {
    newMap[item] = {
      dimension: item,
      term: ''
    };
    return newMap as FilterInfo;
  }, {});

  chartPosition = 0;
  chartRefresher = new Subject<boolean>();

  contentTiersOptions = Array(5)
    .fill(0)
    .map((x, index) => `${x + index}`);

  disabledParams: IHashArray<string>;
  form = this.fb.group({
    facetParameter: [],
    contentTierZero: [false],
    datasetId: [''],
    dateFrom: ['', this.validateDateFrom.bind(this)],
    dateTo: ['', this.validateDateTo.bind(this)],
    chartFormat: this.fb.group({
      percent: [false]
    })
  });

  isLoading = true;
  locale = 'en-GB';

  selFacetIndex = 0;
  resultTotal: number;

  filterData: IHashArray<NameLabelValid> = {};
  displayedFilterData: IHash<FilterOptionSet> = {};

  queryParams: Params = {};
  queryParamsRaw: Params = {};

  dataServerData: BreakdownResults;
  targetLinkAvailable = false;

  /**
   * constructor
   * untyped formbuilder used so that unpredictable datasetId fields can be added
   **/
  constructor() {
    super();
    this.facetConf.forEach((s: string) => {
      this.form.addControl(s, this.fb.group({}));
      this.form.addControl(`filter_list_${s}`, new FormControl(''));
    });
    this.initialiseFilterStates();
  }

  getDataServerDataRequest(): BreakdownRequest {
    const breakdownRequest: BreakdownRequest = { filters: {} };

    breakdownRequest.filters[this.form.value.facetParameter] = {
      breakdown: 0
    };

    Object.keys(this.queryParams).forEach((key: string) => {
      if (!Object.values(nonFacetFilters).includes(key)) {
        breakdownRequest.filters[key] = { values: this.queryParamsRaw[key] };
      }
    });

    if (!this.form.value.contentTierZero) {
      let ct = breakdownRequest.filters[
        DimensionName.contentTier
      ] as RequestFilter;
      if (!ct) {
        breakdownRequest.filters[DimensionName.contentTier] = {};
        ct = breakdownRequest.filters[DimensionName.contentTier];
      }
      if (!ct.values) {
        ct.values = ['1', '2', '3', '4'];
      }
    }

    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;

    if (valFrom && valTo) {
      breakdownRequest.filters['updatedDate'] = {
        from: new Date(valFrom).toISOString().split('T')[0],
        to: new Date(valTo).toISOString().split('T')[0]
      };
    }

    const valDatasetId = this.form.value.datasetId;

    if (valDatasetId) {
      breakdownRequest.filters['datasetId'] = {
        values: fromCSL(valDatasetId)
      };
    }
    return breakdownRequest;
  }

  /** ngOnInit
  /* Event hook: subscribe to changes in the route / query params
  */
  ngOnInit(): void {
    this.subs.push(
      this.chartRefresher
        .pipe(debounceTime(400))
        .subscribe((redraw: boolean) => {
          this.refreshChart(redraw, 0);
        })
    );

    this.subs.push(
      combineLatest([this.route.params, this.route.queryParams])
        .pipe(
          map((results) => {
            const qp = results[1];
            const qpValArrays = {};

            Object.keys(qp).forEach((paramName: string) => {
              this.queryParamsRaw[paramName] = [];
              qpValArrays[paramName] = (
                Array.isArray(qp[paramName]) ? qp[paramName] : [qp[paramName]]
              ).map((qpVal: string) => {
                this.queryParamsRaw[paramName].push(qpVal);
                return toInputSafeName(qpVal);
              });
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

          this.targetLinkAvailable =
            Object.keys(queryParams).length === 2 &&
            !!queryParams['country'] &&
            `${queryParams['type']}` === '3D' &&
            queryParams['type'].length === 1;

          if (!this.targetLinkAvailable) {
            this.targetLinkAvailable =
              !!queryParams['country'] &&
              !!queryParams['metadataTier'] &&
              queryParams['metadataTier'].indexOf('0') === -1 &&
              !!queryParams['contentTier'] &&
              queryParams['contentTier'].indexOf('1') === -1;
          }

          // checkbox representation of (split) datasetId
          this.form.addControl('datasetIds', this.fb.group({}));

          const datasetId =
            queryParams[nonFacetFilters[NonFacetFilterNames.datasetId]];
          if (datasetId) {
            const datasetIds = this.form.get('datasetIds') as UntypedFormGroup;
            `${datasetId}`.split(',').forEach((part: string) => {
              datasetIds.addControl(part.trim(), new FormControl(''));
            });
          }

          if (queryParams[params.facet]) {
            this.disabledParams[params.facet] = queryParams[params.facet];
            delete queryParams[params.facet];
          }

          const facetChanged =
            params.facet &&
            params.facet !== this.form.controls.facetParameter.value;

          if (facetChanged) {
            this.form.controls.facetParameter.setValue(params.facet);
            if (this.dataServerData) {
              this.switchFacet();
            }
          }
          this.queryParams = queryParams;
          this.setCtZeroInputToQueryParam();
          this.setDateInputsToQueryParams();
          this.setDatasetIdInputToQueryParam();
          this.loadData((): void => {
            this.updateFilterAvailability();
          });
        })
    );
  }

  getGridData(): FmtTableData {
    return this.grid.getData();
  }

  getChartData(): Promise<string> {
    return this.barChart.getSvgData();
  }

  /** chartPositionChanged
  /* @param {number} position - absolute position
  */
  chartPositionChanged(absPos: number): void {
    const newPosition = Math.floor(absPos / this.barChart.maxNumberBars);
    const scrollDiff = absPos % this.barChart.maxNumberBars;
    if (newPosition !== this.chartPosition) {
      this.chartPosition = newPosition;
      this.refreshChart(true, scrollDiff);
    } else {
      this.barChart.zoomTop(scrollDiff);
    }
  }

  /** getUrl
  /* @param {false} omitCTParam - flag to omit the content tier param
  /* returns a url parameter string (for api or the portal) according to the form state
  /* returns a url parameter string according to the form state
  /* @returns string
  */
  getUrl(omitCTParam = false): string {
    // filterParam cannot rely on checkbox values as filters aren't built until the data is initialised
    /*
      for each page query parameter:
        - take its (array of) values
        - filter out non-standard filters (nonFacetFilters)
        - filter out any dead facets
        - map the facet name to the corresponding portal name
        - return joined on the '&qf' string
    */
    let filterParam = Object.keys(this.queryParams)
      .map((key: string) => {
        const innerRes = [];
        const values = this.queryParams[key];

        // skip rights parameters
        if (key === DimensionName.rightsCategory) {
          return '';
        }

        if (values && !Object.values(nonFacetFilters).includes(key)) {
          values.forEach((valPart: string) => {
            const portalKey = portalNames[key] ? portalNames[key] : key;
            innerRes.push(
              `${portalKey}:"${encodeURIComponent(fromInputSafeName(valPart))}"`
            );
          });
          return innerRes.join('&qf=');
        }
        return '';
      })
      .filter((x) => x.length > 0)
      .join('&qf=');

    // Prepend the above with the '&qf' parameter identifier if it isn't empty
    if (filterParam.length > 0) {
      filterParam = `&qf=${filterParam}`;
    }

    const queryParam = `?query=${this.getFormattedDatasetIdParam()}`;

    const dateParam = this.getFormattedDateParam();
    const ct =
      omitCTParam || this.queryParams[DimensionName.contentTier]
        ? ''
        : this.getFormattedContentTierParam();
    return `${queryParam}${ct}${filterParam}${dateParam}`;
  }

  /** getUrlRow
  /* @param {string} qfVal - the specific item's value for the currently-selected facet
  /* returns the (portal) url for a specific item
  */
  getUrlRow(facet: string, qfVal?: string): string {
    const rootUrl = `${environment.serverPortal}${this.getUrl(
      facet === DimensionName.contentTier && !!qfVal
    )}`;
    if (!qfVal) {
      return rootUrl;
    }
    if (facet === DimensionName.rightsCategory) {
      // the rest of the rights url is decoded when the link is clicked
      return rootUrl;
    }
    return `${rootUrl}&qf=${portalNames[facet]}:"${encodeURIComponent(qfVal)}"`;
  }

  /** processServerResult
  /* @returns { boolean } - if valid
  **/
  processServerResult(results: BreakdownResults): boolean {
    this.dataServerData = results;
    if (results.results?.count) {
      this.emptyDataset = false;
      this.resultTotal = results.results.count;
      return true;
    } else {
      this.clearData();
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
    if (dsd?.filteringOptions) {
      this.buildFilters(dsd.filteringOptions);
      if (dsd.results?.breakdowns) {
        // set pie and table data
        this.extractSeriesServerData(dsd.results.breakdowns);
      } else {
        this.clearData();
      }
    }
  }

  formatNLV(prefix: string, name: string, valid: boolean): NameLabelValid {
    return {
      name: toInputSafeName(name),
      label: prefix + name,
      valid: valid
    };
  }

  /** buildFilters
   * maintains this.filterData sorted data and invokes this.filterDisplayData()
   * @param { IHashArray<string> : ops } - the filter data
   **/
  buildFilters(ops: IHashArray<string>): void {
    this.facetConf
      .filter((facetName: DimensionName) => {
        return !!ops[facetName];
      })
      .forEach((facetName: DimensionName) => {
        // calculate prefix
        let prefix = '';
        if (
          [DimensionName.contentTier, DimensionName.metadataTier].includes(
            facetName
          )
        ) {
          prefix = this.tierPrefix;
        }

        // calculate filter options from the data and query params
        const opsFromData = ops[facetName];
        const opsFromQP: Array<NameLabelValid> = [];
        const qpVals = this.queryParams[facetName];

        if (qpVals) {
          this.queryParamsRaw[facetName].forEach((val: string) => {
            if (!opsFromData.includes(val)) {
              opsFromQP.push(this.formatNLV(prefix, val, false));
            }
          });
        }

        // calculate full list of in-memory safe options
        const allSortedOps = opsFromData
          .filter((op: string) => {
            return !(
              !this.form.value.contentTierZero &&
              op === '0' &&
              facetName === DimensionName.contentTier
            );
          })
          .map((op: string) => {
            return this.formatNLV(prefix, op, true);
          })
          .concat(opsFromQP);

        allSortedOps.sort((op1: NameLabel, op2: NameLabel) => {
          // ensure that selected filters appear...
          const qp = this.queryParams;
          if (qp[facetName]) {
            const includes1 = qp[facetName].includes(op1.name);
            const includes2 = qp[facetName].includes(op2.name);
            if (includes1 && !includes2) {
              return -1;
            } else if (includes2 && !includes1) {
              return 1;
            }
          }
          // ...and sort on label
          return op1.label.localeCompare(op2.label);
        });
        this.filterData[facetName] = allSortedOps;
        this.filterDisplayData(this.userFilterSearchTerms[facetName]);
      });
  }

  /** loadData
  /* - loads the facet data
  */
  loadData(fnCallback?: (refresh?: boolean) => void): void {
    this.subs.push(
      this.api
        .getBreakdowns(this.getDataServerDataRequest())
        .subscribe((breakdownResults: BreakdownResults) => {
          this.isLoading = false;
          if (this.processServerResult(breakdownResults)) {
            this.postProcessResult();
          } else {
            // build filter data using param data to allow removal of any blocking filters
            this.buildFilters(this.queryParamsRaw);
          }
          if (fnCallback) {
            fnCallback();
          }
        })
    );
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

  iHashNumberFromNVPs(
    src: Array<NamesValuePercent>,
    percent = false
  ): IHash<number> {
    return src.reduce(function (newMap: IHash<number>, nvp: NamesValuePercent) {
      newMap[nvp.name] = percent ? nvp.percent : nvp.value;
      return newMap;
    }, {});
  }

  /** portalUrlsFromNVPs
  /* Generates portal urls from form info and result data
  /* @param { string : facet } - the current facet
  /* @param { Array<NamesValuePercent> : src } - the data to convert
  /* @returns IHash<string> - (map { [name]: url })
  /*
  **/
  portalUrlsFromNVPs(
    facet: string,
    src: Array<NamesValuePercent>
  ): IHash<string> {
    const result = src.reduce(
      (newMap: IHash<string>, nvp: NamesValuePercent) => {
        const url = this.getUrlRow(facet, nvp.name);
        newMap[nvp.name] = url;
        return newMap;
      },
      {}
    );
    result['summary'] = this.getUrlRow(facet);
    return result;
  }

  /** generateSeriesLabel
  /* Generates a human readable label for the current series
  **/
  generateSeriesLabel(): string {
    const queryKeys = Object.keys(this.queryParams);
    if (!queryKeys || queryKeys.length === 0) {
      const friendlyName = portalNamesFriendly[this.form.value.facetParameter];
      return $localize`:@@snapshotTitleAll:All (${friendlyName})`;
    }

    const snapshotTitleOr = $localize`:@@snapshotTitleOr:or`;
    const snapshotTitleAnd = $localize`:@@snapshotTitleAnd:and`;

    return Object.keys(this.queryParams)
      .map((key: string) => {
        const values = this.queryParamsRaw[key];
        if (values.length === 0) {
          return '';
        } else if (key === 'content-tier-zero') {
          return $localize`:@@snapshotTitleCTZero:CT-Zero`;
        } else if (key === 'date-from') {
          // return both dates, formatted and localised
          const dateToValues = this.queryParamsRaw['date-to'];
          if (dateToValues.length === 0) {
            return '';
          }
          const fmt = 'MMM d, y';
          const label = $localize`:@@snapshotTitlePeriod:Period`;
          const dateFrom = formatDate(new Date(values[0]), fmt, this.locale);
          const dateTo = formatDate(
            new Date(dateToValues[0]),
            fmt,
            this.locale
          );
          return `${label} (${dateFrom} - ${dateTo})`;
        } else if (key === 'date-to') {
          // this is handled together with "date-from"
          return '';
        } else if (key === 'dataset-id') {
          const label = $localize`:@@snapshotTitleDatasetId:Dataset Id`;
          return `${label} (${values[0]})`;
        } else {
          const innerRes = [];
          this.queryParamsRaw[key].forEach((valPart: string) => {
            innerRes.push(valPart);
          });
          const friendlyKey = portalNamesFriendly[key];
          const joinedVals = innerRes.join(` ${snapshotTitleOr} `);
          return `${friendlyKey} (${joinedVals})`;
        }
      })
      .filter((x) => x.length > 0)
      .join(` ${snapshotTitleAnd} `);
  }

  /** storeSeries
  /*
  /*  Store series data
  */
  storeSeries(
    applied: boolean,
    saved: boolean,
    nvs: Array<NamesValuePercent>,
    seriesTotal: number
  ): void {
    const name = JSON.stringify(this.queryParams).replace(
      /[:".,\s()[]{}]/g,
      ''
    );
    const rightsInfo = this.form.value.rightsCategory;
    const rightsFilters = Object.keys(rightsInfo).filter((key: string) => {
      return rightsInfo[key];
    });
    this.snapshots.snap(this.form.value.facetParameter, name, {
      name: name,
      label: this.generateSeriesLabel(),
      data: this.iHashNumberFromNVPs(nvs),
      dataPercent: this.iHashNumberFromNVPs(nvs, true),
      orderOriginal: [],
      orderPreferred: [],
      portalUrls: this.portalUrlsFromNVPs(this.form.value.facetParameter, nvs),
      rightsFilters: rightsFilters,
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

    this.snapshots.preSortAndFilter(
      this.form.value.facetParameter,
      seriesKeys,
      this.grid.sortInfo,
      this.grid.filterTerm
    );

    this.showAppliedSeriesInGrid();
    this.chartRefresher.next(true);
  }

  showDateDisclaimer(): void {
    this.dialog.open(this.dialogRef);
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
    const fn = (): void => {
      const maxbars = this.barChart.maxNumberBars;
      const seriesData = this.snapshots.getSeriesDataForChart(
        this.form.value.facetParameter,
        seriesKeys,
        this.form.value['chartFormat']['percent'],
        this.chartPosition * maxbars,
        maxbars
      );
      this.barChart.addSeries(seriesData);
    };
    setTimeout(fn, 0);
  }

  /** refreshChart
  /* (conditionally) calls drawChart on chart object
  /*  removes all series objects from the barchart
  /*  re-applies active series
  /* @param { boolean : redrawChart } - flag redraw
   */
  refreshChart(redrawChart = false, scrollToTop = 0): void {
    this.barChart.removeAllSeries();
    this.addSeriesToChart(
      this.snapshots.filteredCDKeys(this.form.value.facetParameter, 'applied')
    );
    if (redrawChart) {
      this.barChart.drawChart(scrollToTop);
    }
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
      const defaultValue = `${this.queryParams[name]}`.includes(fName);

      if (!ctrl) {
        checkboxes.addControl(fName, new FormControl(defaultValue));
      } else {
        ctrl.setValue(defaultValue);
      }
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
   * - updates displayedFilterData to a filtered and (then) truncated subset for display
   * - ensures form controls exist for all data
   *
   * @param {FilterInfo} filterInfo
   */
  filterDisplayData(filterInfo: FilterInfo): void {
    if (!filterInfo.dimension) {
      filterInfo.dimension = this.form.value.facetParameter;
    }
    this.userFilterSearchTerms[filterInfo.dimension] = filterInfo;

    const multiplier = filterInfo.upToPage ? filterInfo.upToPage : 1;
    const possibleToDisplay = filterList(
      filterInfo.term,
      this.filterData[filterInfo.dimension],
      'label'
    );
    const toDisplay = possibleToDisplay.slice(
      0,
      multiplier * this.MAX_FILTER_OPTIONS
    );

    this.addOrUpdateFilterControls(filterInfo.dimension, toDisplay);
    this.displayedFilterData[filterInfo.dimension] = {
      options: toDisplay,
      hasMore: possibleToDisplay.length > toDisplay.length
    };
  }

  /** getFormattedContentTierParam
  /* @returns { string } - concatenated filterContentTier values if present
  /* @returns { string } - contentTierZero value if filterContentTier values not present
  */
  getFormattedContentTierParam(): string {
    const filterContentTierParam = this.getSetCheckboxValues(
      DimensionName.contentTier
    );
    let res: Array<string> = [];

    if (filterContentTierParam.length > 0) {
      res = filterContentTierParam;
    } else if (this.form.value.contentTierZero) {
      res = this.contentTiersOptions;
    } else {
      res = this.contentTiersOptions.slice(1);
    }
    return `&qf=contentTier:(${encodeURIComponent(res.join(' OR '))})`;
  }

  /** getFormattedDatasetIdParam
  /* @returns { string } - concatenated datasetId value(s) if present
  /* @returns { string } - empty string not present
  */
  getFormattedDatasetIdParam(): string {
    const filterDatasetIdParam = this.form.value.datasetId;
    if (filterDatasetIdParam && filterDatasetIdParam.length > 0) {
      const values = fromCSL(filterDatasetIdParam)
        .map((id: string) => {
          return `${id}_*`;
        })
        .join(' OR ');
      return `edm_datasetName:(${values})`;
    }
    return '*';
  }

  /** getFormattedDateParam
  /* get an empty string or the formatted date range
  /* @returns string
  */
  getFormattedDateParam(): string {
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;

    if (valFrom && valTo) {
      const valToDate = new Date(valTo);
      valToDate.setDate(valToDate.getDate() + 1);
      const range = `${new Date(valFrom).toISOString()}+TO+${new Date(
        valToDate.getTime() - 1
      ).toISOString()}`;
      return `&qf=timestamp_update:${encodeURIComponent(
        '['
      )}${range}${encodeURIComponent(']')}`;
    }
    return '';
  }

  /** getAppliedDateRange
  /* gets the date range (set or default)
  /* @returns Array<Date>
  */
  getAppliedDateRange(): Array<string> {
    const form = this.form;
    const bothPresent = form.value.dateFrom && form.value.dateTo;
    const valFrom = bothPresent ? form.value.dateFrom : yearZero;
    const valTo = bothPresent ? form.value.dateTo : today;
    return [valFrom, valTo];
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
    const paramFrom =
      this.queryParams[nonFacetFilters[NonFacetFilterNames.dateFrom]];
    const paramTo =
      this.queryParams[nonFacetFilters[NonFacetFilterNames.dateTo]];
    this.form.controls.dateFrom.setValue(paramFrom ? paramFrom[0] : '');
    this.form.controls.dateTo.setValue(paramTo ? paramTo[0] : '');
  }

  /** setDatasetIdInputToQueryParam
  /* updates the form value 'datasetId' to the page query parameter 'dataset-id'
  */
  setDatasetIdInputToQueryParam(): void {
    const param =
      this.queryParams[nonFacetFilters[NonFacetFilterNames.datasetId]];
    this.form.controls.datasetId.setValue(param ? param[0] : '');
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

  /** filterKeysLength
  /* Template utility
  /* @param { string } filterName - the filter data to check
  /* @returns number
  */
  filterKeysLength(filterName: string): number {
    if (this.filterData[filterName]) {
      return Object.keys(this.filterData[filterName]).length;
    }
    return 0;
  }

  /** getSetCheckboxValues
  /*
  /* gets the options set in the form
  /*
  /* @param { string } filterName - the relevant filter
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

  /** getRemoveFilterCheckboxData
  /*
  /* gets displayedFilterData[] filtered according to options set in the form
  /*
  /* @param { string } filterName - the filter to return
  /* @returns Array<NameLabelValid>
  */
  getRemoveFilterCheckboxData(filterName: string): Array<NameLabelValid> {
    const dfData = this.filterData[filterName];
    if (!dfData) {
      return [];
    }
    const checkedVals = this.getSetCheckboxValues(filterName);
    return dfData.filter((nlv: NameLabelValid) => {
      return checkedVals.includes(nlv.name);
    });
  }

  /** datesClear
  /* Template utility: removes the date fields from the form and calls updatePageUrl
  */
  datesClear(): void {
    this.form.controls.dateFrom.setValue('');
    this.form.controls.dateTo.setValue('');
    this.updatePageUrl();
    this.datesOpen();
  }

  /** datesOpen
  /* Opens the date fields after a millisecond pause
  */
  datesOpen(): void {
    const filterStates = this.filterStates;
    const fn = (): void => {
      filterStates.dates = {
        visible: true,
        disabled: false
      };
    };
    setTimeout(fn, 1);
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
  /* @param {false} skipload
  */
  updatePageUrl(skipLoad = false): void {
    const qp = {};
    this.getEnabledFilterNames().forEach((filterName: string) => {
      const filterVals = this.getSetCheckboxValues(filterName).map(
        (filterVal: string) => {
          return fromInputSafeName(filterVal);
        }
      );

      if (filterVals.length > 0) {
        qp[filterName] = filterVals;
      }
    });

    const dataset = this.form.value.datasetId;
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;

    if (valFrom) {
      qp[nonFacetFilters[NonFacetFilterNames.dateFrom]] = getDateAsISOString(
        new Date(valFrom)
      );
    }
    if (valTo) {
      qp[nonFacetFilters[NonFacetFilterNames.dateTo]] = getDateAsISOString(
        new Date(valTo)
      );
    }

    if (dataset) {
      qp[nonFacetFilters[NonFacetFilterNames.datasetId]] = dataset;
    }
    if (this.form.value.contentTierZero) {
      qp[nonFacetFilters[NonFacetFilterNames.contentTierZero]] = true;
    }

    if (skipLoad) {
      this.queryParams = qp;
    }
    this.router.navigate([`data/${this.form.value['facetParameter']}`], {
      queryParams: { ...qp, ...this.disabledParams }
    });
  }

  /** updateDatasetIdFieldAndPageUrl
  /*
  /* Removes a value-part from the datasetId form value and calls updatePageUrl
  /* @param { string } datasetId - the value-part to remove
  */
  updateDatasetIdFieldAndPageUrl(datasetId?: string): void {
    const ctrl = this.form.controls.datasetId;
    const cleanVal = fromCSL(ctrl.value).filter((val: string) => {
      return val !== datasetId;
    });

    switch (cleanVal.length) {
      case 0: {
        ctrl.setValue('');
        break;
      }
      case 1: {
        ctrl.setValue(cleanVal[0]);
        break;
      }
      default: {
        ctrl.setValue(cleanVal.join(', '));
      }
    }
    this.updatePageUrl();
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

  /** clearData
  /*
  /* clears the chart and grid data
  */
  clearData(): void {
    this.barChart.removeAllSeries();
    this.emptyDataset = true;
    this.grid.setRows([]);
    if (this.gridSummary) {
      this.gridSummary.summaryData = { breakdownBy: '', results: [] };
    }
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
      .filter((state: string) => {
        return state !== exempt;
      })
      .forEach((state: string) => {
        this.filterStates[state].visible = false;
      });
  }

  /** extractSeriesServerData
  /* @param { number } facetIndex - the index of the facet to use
  */
  extractSeriesServerData(br: BreakdownResult): void {
    const chartData = br.results.map((cpv: CountPercentageValue) => {
      return {
        name: cpv.value,
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

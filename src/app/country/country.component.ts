import {
  DecimalPipe,
  formatNumber,
  LowerCasePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
  UpperCasePipe
} from '@angular/common';
import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Input,
  model,
  ModelSignal,
  signal,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';
import { combineLatest, map } from 'rxjs';
import {
  colours,
  eliData,
  externalLinks,
  isoCountryCodes,
  isoCountryCodesReversed,
  targetDescriptions
} from '../_data';
import {
  BreakdownResults,
  CountPercentageValue,
  CountryHistoryRequest,
  DimensionName,
  IHash,
  IHashArray,
  NamesValuePercent,
  TargetCountryData,
  TargetData,
  TargetFieldName,
  TargetMetaData
} from '../_models';
import { APIService } from '../_services';
import {
  AbbreviateNumberPipe,
  RenameApiFacetPipe,
  RenameApiFacetShortPipe,
  RenameCountryPipe,
  RenameTargetTypeLongPipe,
  RenameTargetTypePipe,
  StripMarkupPipe
} from '../_translate';

import { AppendiceSectionComponent } from '../appendice-section';
import { BarComponent, LineComponent, LineService } from '../chart';
import { HeaderComponent } from '../header';
import { LegendGridComponent, LegendGridService } from '../legend-grid';
import { SubscriptionManager } from '../subscription-manager';
import { SpeechBubbleComponent } from '../speech-bubble';
import { TruncateComponent } from '../truncate';

@Component({
  templateUrl: './country.component.html',
  styleUrls: ['../landing/landing.component.scss', './country.component.scss'],
  imports: [
    AbbreviateNumberPipe,
    AppendiceSectionComponent,
    RouterOutlet,
    NgClass,
    NgIf,
    NgFor,
    SpeechBubbleComponent,
    TruncateComponent,
    NgTemplateOutlet,
    BarComponent,
    LineComponent,
    LegendGridComponent,
    RouterLink,
    UpperCasePipe,
    LowerCasePipe,
    DecimalPipe,
    RenameCountryPipe,
    RenameApiFacetPipe,
    RenameApiFacetShortPipe,
    RenameTargetTypePipe,
    StripMarkupPipe
  ]
})
export class CountryComponent
  extends SubscriptionManager
  implements AfterViewInit
{
  public externalLinks = externalLinks;
  public DimensionName = DimensionName;

  public isoCountryCodes = isoCountryCodes;

  public TargetFieldName = TargetFieldName;
  public colours = colours;
  public eliDocNum = eliData.eliDocNum;
  public eliUrl = eliData.eliUrl;
  public eliTitle = eliData.eliTitle;
  public targetDescriptions = targetDescriptions;

  renameTargetTypePipe = new RenameTargetTypeLongPipe();
  abbreviateNumberPipe = new AbbreviateNumberPipe();

  cardData: IHash<Array<NamesValuePercent>>;
  _includeCTZero?: boolean;

  @Input() set includeCTZero(includeCTZero: boolean) {
    this._includeCTZero = includeCTZero;
    if (this.country().length > 0) {
      this.refreshCardData();
    }
  }
  get includeCTZero(): boolean | undefined {
    return this._includeCTZero;
  }

  @ViewChild('legendGrid') legendGrid: LegendGridComponent;
  @ViewChild('barChart') barChart: BarComponent;
  @ViewChild('scrollPoint') scrollPoint: ElementRef;

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(APIService);
  public countryCodes = isoCountryCodes;

  showTargetsData = false;

  columnsEnabledCount = 3;
  columnsEnabled: IHash<boolean> = {};
  columnToEnable?: TargetFieldName;

  country = signal('');

  ngAfterViewInit(): void {
    this.initialiseIntersectionObserver();
  }

  targetMetaData: IHash<IHashArray<TargetMetaData>>;
  countryData: ModelSignal<IHash<Array<TargetData>>> = model({});
  latestCountryData = computed(() => {
    const specificCountryData = this.countryData()[this.country()];
    if (specificCountryData && specificCountryData.length) {
      const res = specificCountryData.reduce(
        (prev: TargetData, current: TargetData) => {
          return prev && prev.date && prev.date > current.date ? prev : current;
        },
        {} as TargetData
      );
      return res;
    }
  });

  appendiceExpanded = false;
  lineChartIsInitialised = false;
  legendGridIsInitialised = false;

  @Input() headerRef: HeaderComponent;

  /** constructor
   * binds the lineChartReady service to variable
   * gets the app-ref and obtains the header ref
   * binds the data variables to the url
   * initialises the intersection observer
   **/
  constructor(
    private readonly applicationRef: ApplicationRef,
    private readonly lineService: LineService,
    private readonly legendGridService: LegendGridService
  ) {
    super();

    // listen for the line chart to be initialised
    lineService.lineChartReady.subscribe(() => {
      this.lineChartIsInitialised = true;
    });
    // listen for the legend-grid to be initialised
    legendGridService.legendGridReady.subscribe((value: boolean) => {
      // first call makes the legendgrid available
      this.changeDetector.detectChanges();
      this.legendGridIsInitialised = value;

      // the second call prevents ExpressionChanged the legend gris available to the view
      this.changeDetector.detectChanges();
    });
    this.restoreHiddenColumns();

    const rootRef = this.applicationRef.components[0].instance;
    if (rootRef) {
      this.headerRef = rootRef['header'];
    }

    this.subs.push(
      combineLatest([
        this.api.getTargetMetaData(),
        this.api.getCountryData(),
        this.route.params
      ])
        .pipe(
          map((results) => {
            return {
              targetMetaData: results[0],
              countryData: results[1],
              params: results[2]
            };
          })
        )
        .subscribe({
          next: (combined) => {
            const countryParam = combined.params['country'];
            const country = isoCountryCodes[countryParam];

            if (country) {
              this.country.set(country);
              this.targetMetaData = combined.targetMetaData;
              this.countryData.set(combined.countryData);
            } else {
              const qp = this.includeCTZero
                ? { queryParams: { 'content-tier-zero': 'true' } }
                : undefined;
              if (Object.values(isoCountryCodes).includes(countryParam)) {
                const redirecCountry = isoCountryCodesReversed[countryParam];
                this.router.navigate(['country', redirecCountry], qp);
              } else {
                this.router.navigate(['/'], qp);
              }
            }
          },
          error: (e: Error) => {
            console.log(e);
          }
        })
    );

    effect(() => {
      const country = this.country();
      if (country.length) {
        if (typeof this.includeCTZero === 'boolean') {
          this.refreshCardData();
        }
        this.restoreHiddenColumns();
        this.showTargetsData = !!this.targetMetaData[country];
        this.setHeaderData(country);
      }
    });
  }

  /** intersectionObserverCallback
   *  - callback logic for showing and hiding the page title
   *  - setting is made more difficult than unsetting to prevent flickering
   **/
  intersectionObserverCallback(
    entries: Array<{ isIntersecting: boolean; intersectionRatio: number }>
  ): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
        this.headerRef.pageTitleInViewport = true;
      }
      if (!entry.isIntersecting) {
        this.headerRef.pageTitleInViewport = false;
      }
    });
  }

  /** initialiseIntersectionObserver
   * binds the headerRef's pageTitleInViewport to an intersection observer
   * generates a threshold config option of [0, 0.1, ..., 0.9]
   **/
  initialiseIntersectionObserver(): void {
    new IntersectionObserver(this.intersectionObserverCallback.bind(this), {
      threshold: [...Array(10).keys()].map((val) => (val ? val / 10 : val))
    }).observe(this.scrollPoint.nativeElement);
  }

  /** resetAppCTZeroParam
   * - UI utility: clears "lastSetContentTierZeroValue" on app component
   * - invoked before router navigates to overview page on (target) link click
   **/
  resetAppCTZeroParam(): void {
    const rootRef = this.applicationRef.components[0].instance;
    rootRef.setContentTierZeroValue(false);
  }

  /** refreshCardData
   * (re)loads all dimension card data and reinitialises barChart
   **/
  refreshCardData(): void {
    this.loadDimensionCardData(DimensionName.dataProvider);
    this.loadDimensionCardData(DimensionName.provider);
    this.loadDimensionCardData(DimensionName.rightsCategory);
    this.loadDimensionCardData(DimensionName.type, () => {
      if (this.barChart) {
        this.barChart.removeAllSeries();
        this.barChart.results = this.cardData[DimensionName.type];
        this.barChart.ngAfterViewInit();
      }
    });
  }

  /** loadDimensionCardData
   * loads dimension card data
   * @param { DimensionName } dimensionName
   * @param { ()=> void } fnCallback
   **/
  loadDimensionCardData(
    dimensionName: DimensionName,
    fnCallback?: () => void
  ): void {
    const contentTierVals = ['1', '2', '3', '4'];

    if (this.includeCTZero) {
      contentTierVals.unshift('0');
    }
    const req = {
      filters: {
        contentTier: { values: contentTierVals },
        country: { values: [this.country()] }
      }
    };
    req.filters[dimensionName] = { breakdown: 0 };

    this.subs.push(
      this.api
        .getBreakdowns(req)
        .pipe(
          map((br: BreakdownResults) => {
            return br.results.breakdowns.results;
          })
        )
        .subscribe((res) => {
          const cardData = res.map((cpv: CountPercentageValue) => {
            return {
              name: cpv.value,
              value: cpv.count,
              percent: cpv.percentage
            };
          });

          if (!this.cardData) {
            this.cardData = {};
          }
          this.cardData[dimensionName] = cardData;
          if (fnCallback) {
            fnCallback();
          }
        })
    );
  }

  /** setHeaderData
   * @param {string?} activeCountry - optional country
   **/
  setHeaderData(country?: string): void {
    this.headerRef.pageTitleDynamic = country && this.showTargetsData;
    this.headerRef.activeCountry = country;
  }

  /** loadHistory
   * picks up onLoadHistory request from legendGrid
   *
   * @param {CountryHistoryRequest} request - the data request
   **/
  loadHistory(request: CountryHistoryRequest): void {
    this.subs.push(
      this.api
        .loadCountryData(request.country)
        .subscribe((data: Array<TargetCountryData>) => {
          request.fnCallback(data);
        })
    );
  }

  tooltipsAndTotals = computed(() => {
    const fmtNum = (num: number, fmt = '1.0-1'): string => {
      return formatNumber(num, 'en-US', fmt);
    };

    const res = {
      tooltipsTotal: {},
      tooltipsPercent: {},
      tooltipsTargets: {},
      latestCountryPercentages: {},
      latestCountryPercentageOfTargets: {}
    };

    if (this.latestCountryData()) {
      Object.values(TargetFieldName).forEach((valName: string) => {
        const countryName = isoCountryCodesReversed[this.country()];
        const value: number = this.latestCountryData()[valName] || 0;

        const fmtName = this.renameTargetTypePipe.transform(valName);
        const fmtValue = fmtNum(value, '1.0-2');
        const itemPluralString = `item${value === 1 ? '' : 's'}`;
        const abbrevValue = this.abbreviateNumberPipe.transform(value);
        const percent =
          value === 0
            ? 0
            : (value / parseInt(this.latestCountryData()['total'])) * 100;

        const typeItems =
          valName === TargetFieldName.TOTAL
            ? ` (${abbrevValue})`
            : ` ${fmtName}`;

        // set tooltip / help texts

        res.tooltipsTotal[
          valName
        ] = $localize`:@@countryHelpTotal:${countryName} has ${fmtValue}${typeItems} ${itemPluralString}`;

        res.tooltipsPercent[valName] = $localize`:@@countryHelpPercent:${fmtNum(
          percent
        )}% of the data from ${countryName} is ${fmtName}`;

        // percentages
        res.latestCountryPercentages[valName] = percent;

        const targets = this.targetMetaData[this.country()][valName];

        res.latestCountryPercentageOfTargets[valName] = [
          value / targets[0].value,
          value / targets[1].value
        ].map((val: number) => {
          return val * 100;
        });

        // tooltipsTargets

        res.tooltipsTargets[valName] = targets.map(
          (x: TargetMetaData, i: number) => {
            const tgtVal = fmtNum(x.value);
            const tgtPct = fmtNum(
              res.latestCountryPercentageOfTargets[valName][i]
            );
            return $localize`:@@countryHelpTarget:The ${x.targetYear} target (${tgtVal}) is ${tgtPct}% complete`;
          }
        );
      });
    }
    return res;
  });

  toggleAppendice(): void {
    this.appendiceExpanded = !this.appendiceExpanded;
  }

  /** nextColToEnable
   *
   * @return TargetFieldName
   **/
  nextColToEnable(): TargetFieldName {
    return Object.values(TargetFieldName).find((tfn: TargetFieldName) => {
      return !this.columnsEnabled[tfn];
    });
  }

  /** toggleColumn
   *
   * @param { TargetFieldName } column
   **/
  toggleColumn(column?: TargetFieldName): void {
    column = column || this.nextColToEnable();
    this.columnsEnabled[column] = !this.columnsEnabled[column];

    this.columnsEnabledCount = Object.values(TargetFieldName).filter(
      (tfn: TargetFieldName) => {
        return this.columnsEnabled[tfn];
      }
    ).length;

    this.columnToEnable = this.nextColToEnable();
  }

  restoreHiddenColumns(): void {
    // re-initialise the hidden columns
    this.columnsEnabledCount = 3;
    Object.values(TargetFieldName).forEach((key: string) => {
      this.columnsEnabled[key] = true;
    });
  }

  ngOnDestroy(): void {
    this.setHeaderData();
  }
}

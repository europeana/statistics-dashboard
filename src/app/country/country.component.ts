import {
  DecimalPipe,
  formatNumber,
  LowerCasePipe,
  NgClass,
  NgTemplateOutlet,
  UpperCasePipe
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';
import { combineLatest, map } from 'rxjs';
import {
  colours,
  DimensionName,
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
  IHash,
  IHashArray,
  NamesValuePercent,
  TargetCountryData,
  TargetData,
  TargetFieldName,
  TargetMetaData
} from '../_models';
import { APIService, FilterStateService } from '../_services';
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
import { BarComponent, LineComponent } from '../chart';
import { HeaderComponent } from '../header';
import { LegendGridComponent } from '../legend-grid';
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
export class CountryComponent implements AfterViewInit, OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef);

  public externalLinks = externalLinks;
  public DimensionName = DimensionName;
  public isoCountryCodes = isoCountryCodes;
  public TargetFieldName = TargetFieldName;
  public colours = colours;
  public eliDocNum = eliData.eliDocNum;
  public eliUrl = eliData.eliUrl;
  public eliTitle = eliData.eliTitle;
  public targetDescriptions = targetDescriptions;

  private readonly renameTargetTypePipe = new RenameTargetTypeLongPipe();
  private readonly abbreviateNumberPipe = new AbbreviateNumberPipe();

  cardData: IHash<Array<NamesValuePercent>> = {};

  readonly legendGrid = viewChild<LegendGridComponent>('legendGrid');
  readonly barChart = viewChild<BarComponent>('barChart');
  readonly scrollPoint = viewChild<ElementRef>('scrollPoint');

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(APIService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterStateService = inject(FilterStateService);

  public countryCodes = isoCountryCodes;

  showTargetsData = false;
  columnsEnabledCount = 3;
  columnsEnabled: IHash<boolean> = {};
  columnToEnable?: TargetFieldName;
  appendiceExpanded = false;

  readonly country = signal('');
  readonly lineChartIsInitialised = signal<boolean>(false);

  readonly countryTotalMap = this.filterStateService.countryTotalMap;
  readonly headerRef = input<HeaderComponent>();
  readonly includeCTZero = this.filterStateService.includeCTZero;

  targetMetaData = model<IHash<IHashArray<TargetMetaData>> | undefined>(
    undefined
  );
  countryData = model<IHash<Array<TargetData>>>({});

  latestCountryData = computed(() => {
    const specificCountryData = this.countryData()[this.country()];
    if (specificCountryData && specificCountryData.length) {
      return specificCountryData.reduce(
        (prev: TargetData, current: TargetData) =>
          prev?.date > current.date ? prev : current,
        {} as TargetData
      );
    }
    return undefined;
  });

  private routeDataSignal = toSignal(
    combineLatest([
      this.api.getTargetMetaData(),
      this.api.getCountryData(),
      this.route.params
    ]).pipe(
      map(([targetMetaData, countryData, params]) => ({
        targetMetaData,
        countryData,
        params
      }))
    )
  );

  constructor() {
    this.restoreHiddenColumns();

    effect(() => {
      const data = this.routeDataSignal();
      if (!data) return;

      const countryParam = data.params['country'];
      let calculatedCountry = isoCountryCodes[countryParam];

      if (
        !calculatedCountry &&
        Object.keys(data.countryData).includes(countryParam) &&
        !Object.values(isoCountryCodes).includes(countryParam)
      ) {
        calculatedCountry = countryParam;
      }

      if (calculatedCountry) {
        this.country.set(calculatedCountry);
        this.targetMetaData.set(data.targetMetaData);
        this.countryData.set(data.countryData);
      } else {
        const qp = this.includeCTZero()
          ? { queryParams: { 'content-tier-zero': 'true' } }
          : undefined;
        if (Object.values(isoCountryCodes).includes(countryParam)) {
          const redirectCountry = isoCountryCodesReversed[countryParam];
          this.router.navigate(['country', redirectCountry], qp);
        } else {
          this.router.navigate(['/'], qp);
        }
      }
    });

    effect(() => {
      const activeCountry = this.country();
      const meta = this.targetMetaData();
      if (activeCountry.length) {
        if (typeof this.includeCTZero() === 'boolean') {
          this.refreshCardData();
        }
        this.restoreHiddenColumns();
        this.showTargetsData = !!(meta && meta[activeCountry]);
        this.setHeaderData(activeCountry);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initialiseIntersectionObserver();
  }

  onLineChartReady(isReady: boolean): void {
    this.lineChartIsInitialised.set(isReady);
  }

  intersectionObserverCallback(
    entries: Array<{ isIntersecting: boolean; intersectionRatio: number }>
  ): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
        this.filterStateService.pageTitleInViewport.set(true);
      }
      if (!entry.isIntersecting) {
        this.filterStateService.pageTitleInViewport.set(false);
      }
    });
  }

  initialiseIntersectionObserver(): void {
    const scrollEl = this.scrollPoint();
    if (scrollEl?.nativeElement) {
      new IntersectionObserver(this.intersectionObserverCallback.bind(this), {
        threshold: [...new Array(10).keys()].map((val) =>
          val ? val / 10 : val
        )
      }).observe(scrollEl.nativeElement);
    }
  }

  resetAppCTZeroParam(): void {
    this.filterStateService.includeCTZero.set(false);
  }

  /** refreshCardData
  /* Core layout fetcher block supporting standard and non-standard custom regions like 'Europe' (EU)
  */
  refreshCardData(): void {
    this.loadDimensionCardData(DimensionName.dataProvider, () => {
      this.changeDetector.markForCheck();
    });

    this.loadDimensionCardData(DimensionName.provider, () => {
      this.changeDetector.markForCheck();
    });

    this.loadDimensionCardData(DimensionName.rightsCategory, () => {
      this.changeDetector.markForCheck();
    });

    this.loadDimensionCardData(DimensionName.type, () => {
      const chart = this.barChart();
      if (chart) {
        chart.removeAllSeries();
        chart.results.set(this.cardData[DimensionName.type] || []);
        chart.addSeriesFromResult();
      }
      this.changeDetector.markForCheck();
    });
  }

  loadDimensionCardData(
    dimensionName: DimensionName,
    fnCallback?: () => void
  ): void {
    const contentTierVals = ['1', '2', '3', '4'];
    if (this.includeCTZero()) {
      contentTierVals.unshift('0');
    }
    const req = {
      filters: {
        contentTier: { values: contentTierVals },
        country: { values: [this.country()] }
      } as Record<string, unknown>
    };

    req.filters[dimensionName] = { breakdown: 0 };

    this.api
      .getBreakdowns(req)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((br: BreakdownResults) => br.results.breakdowns.results)
      )
      .subscribe((res) => {
        const parsedData = res.map((cpv: CountPercentageValue) => ({
          name: cpv.value,
          value: cpv.count,
          percent: cpv.percentage
        }));

        this.cardData[dimensionName] = parsedData;
        if (fnCallback) {
          fnCallback();
        }
      });
  }

  setHeaderData(country?: string): void {
    this.filterStateService.pageTitleDynamic.set(
      !!(country && this.showTargetsData)
    );
    this.filterStateService.activeCountry.set(country);
  }

  loadHistory(request: CountryHistoryRequest): void {
    this.api
      .loadCountryData(request.country)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: Array<TargetCountryData>) => {
        request.fnCallback(data);
      });
  }

  tooltipsAndTotals = computed(() => {
    const fmtNum = (num: number, fmt = '1.0-1'): string =>
      formatNumber(num, 'en-US', fmt);

    const res = {
      tooltipsTotal: {},
      tooltipsPercent: {},
      tooltipsTargets: {},
      latestCountryPercentages: {},
      latestCountryPercentageOfTargets: {}
    };

    const currentCountry = this.country();
    const currentLatestData = this.latestCountryData();
    const metaMap = this.targetMetaData();

    if (
      currentLatestData &&
      currentCountry &&
      metaMap &&
      metaMap[currentCountry]
    ) {
      Object.values(TargetFieldName).forEach((valName: string) => {
        const countryName =
          isoCountryCodesReversed[currentCountry] ?? currentCountry;
        const value: number = currentLatestData[valName] ?? 0;

        const fmtName = this.renameTargetTypePipe.transform(valName);
        const fmtValue = fmtNum(value, '1.0-2');
        const itemPluralString = `item${value === 1 ? '' : 's'}`;
        const abbrevValue = this.abbreviateNumberPipe.transform(value);
        const percent =
          value === 0
            ? 0
            : (value / Number.parseInt(currentLatestData['total'])) * 100;
        const typeItems =
          valName === TargetFieldName.TOTAL
            ? ` (${abbrevValue})`
            : ` ${fmtName}`;

        res.tooltipsTotal[
          valName
        ] = $localize`:@@countryHelpTotal:${countryName} has ${fmtValue}${typeItems} ${itemPluralString}`;
        res.tooltipsPercent[valName] = $localize`:@@countryHelpPercent:${fmtNum(
          percent
        )}% of the data from ${countryName} is ${fmtName}`;
        res.latestCountryPercentages[valName] = percent;

        const targets = metaMap[currentCountry][valName];
        if (targets && targets.length >= 2) {
          res.latestCountryPercentageOfTargets[valName] = [
            value / targets[0].value,
            value / targets[1].value
          ].map((val: number) => val * 100);

          res.tooltipsTargets[valName] = targets.map(
            (x: TargetMetaData, i: number) => {
              const tgtVal = fmtNum(x.value);
              const tgtPct = fmtNum(
                res.latestCountryPercentageOfTargets[valName][i]
              );
              return $localize`:@@countryHelpTarget:The ${x.targetYear} target (${tgtVal}) is ${tgtPct}% complete`;
            }
          );
        }
      });
    }
    return res;
  });

  toggleAppendice(): void {
    this.appendiceExpanded = !this.appendiceExpanded;
  }

  nextColToEnable(): TargetFieldName | undefined {
    return Object.values(TargetFieldName).find(
      (tfn: TargetFieldName) => !this.columnsEnabled[tfn]
    );
  }

  toggleColumn(column?: TargetFieldName): void {
    const targetCol = column || this.nextColToEnable();
    if (targetCol) {
      this.columnsEnabled[targetCol] = !this.columnsEnabled[targetCol];
      this.columnsEnabledCount = Object.values(TargetFieldName).filter(
        (tfn: TargetFieldName) => this.columnsEnabled[tfn]
      ).length;
      this.columnToEnable = this.nextColToEnable();
    }
  }

  restoreHiddenColumns(): void {
    this.columnsEnabledCount = 3;
    Object.values(TargetFieldName).forEach((key: string) => {
      this.columnsEnabled[key] = true;
    });
  }

  ngOnDestroy(): void {
    this.setHeaderData();
  }
}

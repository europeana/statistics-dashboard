import {
  DatePipe,
  DecimalPipe,
  formatNumber,
  JsonPipe,
  KeyValuePipe,
  LowerCasePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
  UpperCasePipe
} from '@angular/common';
import {
  ApplicationRef,
  Component,
  ElementRef,
  inject,
  Input,
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
  DimensionName,
  IHash,
  IHashArray,
  NamesValuePercent,
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
import { BarComponent, LineComponent } from '../chart';
import { HeaderComponent } from '../header';
import { LegendGridComponent } from '../legend-grid';
import { ResizeComponent } from '../resize';
import { CTZeroControlComponent } from '../ct-zero-control';
import { SubscriptionManager } from '../subscription-manager';
import { SpeechBubbleComponent } from '../speech-bubble';
import { TruncateComponent } from '../truncate';

@Component({
  templateUrl: './country.component.html',
  styleUrls: ['../landing/landing.component.scss', './country.component.scss'],
  standalone: true,
  imports: [
    AbbreviateNumberPipe,
    AppendiceSectionComponent,
    CTZeroControlComponent,
    RouterOutlet,
    DatePipe,
    JsonPipe,
    NgClass,
    ResizeComponent,
    NgIf,
    NgFor,
    SpeechBubbleComponent,
    TruncateComponent,
    NgTemplateOutlet,
    BarComponent,
    KeyValuePipe,
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
export class CountryComponent extends SubscriptionManager {
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
  _includeCTZero = false;

  @Input() set includeCTZero(includeCTZero: boolean) {
    this._includeCTZero = includeCTZero;
    if (this.cardData) {
      this.refreshCardData();
    }
  }
  get includeCTZero(): boolean {
    return this._includeCTZero;
  }

  // Used to parameterise links to the data page
  @ViewChild('lineChart') lineChart: LineComponent;
  @ViewChild('legendGrid') legendGrid: LegendGridComponent;
  @ViewChild('barChart') barChart: BarComponent;
  @ViewChild('scrollPoint') scrollPoint: ElementRef;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(APIService);
  public countryCodes = isoCountryCodes;

  showTargetsData = false;

  columnsEnabledCount = 3;
  columnsEnabled: IHash<boolean> = {};
  columnToEnable?: TargetFieldName;

  _country: string;

  /** country
   *  setter is used to load tertiary level card data
   **/
  set country(country: string) {
    this._country = country;
    this.refreshCardData();
    this.showTargetsData = !!this.targetMetaData[country];
    this.setHeaderData(country);
  }

  get country(): string {
    return this._country;
  }

  targetMetaData: IHash<IHashArray<TargetMetaData>>;
  countryData: IHash<Array<TargetData>> = {};
  latestCountryData: TargetData;

  latestCountryPercentages: IHash<number> = {};
  latestCountryPercentageOfTargets: IHash<Array<number>> = {};

  tooltipsTotal: IHash<string> = {};
  tooltipsPercent: IHash<string> = {};
  tooltipsTargets: IHash<Array<string>> = {};

  appendiceExpanded = false;

  @Input() headerRef: HeaderComponent;

  /** constructor
   * gets the app-ref and obtains the header ref
   * binds the data variables to the url
   * initialises the intersection observer
   **/
  constructor(private applicationRef: ApplicationRef) {
    super();

    Object.values(TargetFieldName).forEach((key: string) => {
      this.columnsEnabled[key] = true;
    });

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
            this.targetMetaData = combined.targetMetaData;
            this.countryData = combined.countryData;

            const countryParam = combined.params['country'];
            const country = isoCountryCodes[countryParam];

            if (!country) {
              if (Object.values(isoCountryCodes).includes(countryParam)) {
                const redirecCountry = isoCountryCodesReversed[countryParam];
                this.router.navigate([`country/${redirecCountry}`]);
              } else {
                this.router.navigate(['/']);
              }
            }

            this.setCountryToParam(country);
            this.initialiseIntersectionObserver();
          },
          error: (e: Error) => {
            console.log(e);
          }
        })
    );
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
        country: { values: [this.country] }
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

  /** setCountryToParam
   * - set instance variables
   * @param {string} country - the country
   **/
  setCountryToParam(country: string): void {
    this.country = country;
    const specificCountryData = this.countryData[country];

    if (specificCountryData && specificCountryData.length) {
      this.latestCountryData =
        specificCountryData[specificCountryData.length - 1];
      this.generateDerivedData();
    }
  }

  /** generateDerivedData
   *
   * set tooltip / help texts
   * sets template percentages
   **/
  generateDerivedData(): void {
    const fmtNum = (num: number, fmt = '1.0-1'): string => {
      return formatNumber(num, 'en-US', fmt);
    };

    Object.values(TargetFieldName).forEach((valName: string) => {
      const countryName = isoCountryCodesReversed[this.country];
      const value = this.latestCountryData[valName];
      const fmtName = this.renameTargetTypePipe.transform(valName);
      const fmtValue = fmtNum(value, '1.0-2');
      const itemPluralString = `item${value === 1 ? '' : 's'}`;
      const abbrevValue = this.abbreviateNumberPipe.transform(value);
      const percent =
        value === 0
          ? 0
          : (value / parseInt(this.latestCountryData['total'])) * 100;
      const typeItems =
        valName === TargetFieldName.TOTAL ? ` (${abbrevValue})` : ` ${fmtName}`;

      // set tooltip / help texts

      this.tooltipsTotal[
        valName
      ] = `${countryName} has ${fmtValue}${typeItems} ${itemPluralString}`;

      this.tooltipsPercent[valName] =
        fmtNum(percent) + `% of the data from ${countryName} is ${fmtName}`;

      // percentages
      this.latestCountryPercentages[valName] = percent;

      const targets = this.targetMetaData[this.country][valName];

      this.latestCountryPercentageOfTargets[valName] = [
        (value || 0) / targets[0].value,
        (value || 0) / targets[1].value
      ].map((val: number) => {
        return val * 100;
      });

      // tooltipsTargets

      this.tooltipsTargets[valName] = targets.map(
        (x: TargetMetaData, i: number) => {
          const tgtVal = fmtNum(x.value);
          const tgtPct = fmtNum(
            this.latestCountryPercentageOfTargets[valName][i]
          );
          return `The ${x.targetYear} target (${tgtVal}) is ${tgtPct}% complete`;
        }
      );
    });
  }

  toggleAppendice(): void {
    this.appendiceExpanded = !this.appendiceExpanded;
    this.lineChart.toggleCursor();
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

  ngOnDestroy(): void {
    this.setHeaderData();
  }
}

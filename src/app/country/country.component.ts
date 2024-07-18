import {
  DatePipe,
  DecimalPipe,
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
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { colours, externalLinks, ISOCountryCodes } from '../_data';
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
  RenameTargetTypePipe
} from '../_translate';

import { AppendiceSectionComponent } from '../appendice-section';
import { BarComponent, LineComponent } from '../chart';
import { LegendGridComponent } from '../legend-grid';
import { ResizeComponent } from '../resize';
import { SubscriptionManager } from '../subscription-manager';
import { TruncateComponent } from '../truncate';

@Component({
  templateUrl: './country.component.html',
  styleUrls: ['../landing/landing.component.scss', './country.component.scss'],
  standalone: true,
  imports: [
    AbbreviateNumberPipe,
    AppendiceSectionComponent,
    RouterOutlet,
    DatePipe,
    JsonPipe,
    NgClass,
    ResizeComponent,
    NgIf,
    NgFor,
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
    RenameTargetTypePipe
  ]
})
export class CountryComponent extends SubscriptionManager {
  public externalLinks = externalLinks;
  public DimensionName = DimensionName;
  public TargetFieldName = TargetFieldName;
  public colours = colours;

  cardData: IHash<Array<NamesValuePercent>> = {};

  // Used to parameterise links to the data page
  @Input() includeCTZero = false;
  @ViewChild('lineChart') lineChart: LineComponent;
  @ViewChild('legendGrid') legendGrid: LegendGridComponent;
  @ViewChild('barChart') barChart: BarComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(APIService);
  public countryCodes = ISOCountryCodes;

  columnsEnabledCount = 3;
  columnsEnabled: IHash<boolean> = {};
  columnToEnable?: TargetFieldName;

  _country: string;

  /** country
   *  setter is used to load tertiary level card data
   **/
  set country(country: string) {
    this._country = country;
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

  get country(): string {
    return this._country;
  }

  countryCode: string;
  targetMetaData: IHash<IHashArray<TargetMetaData>>;
  countryData: IHash<Array<TargetData>> = {};
  latestCountryData: TargetData;
  appendiceExpanded = false;

  public headerRef: ElementRef;

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
            const country = combined.params['country'];
            this.setCountryToParam(country);
            this.setCountryInHeaderMenu(country);
          },
          error: (e: Error) => {
            console.log(e);
          }
        })
    );
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
    const req = {
      filters: {
        contentTier: { values: ['1', '2', '3', '4'] },
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
          this.cardData[dimensionName] = res.map(
            (cpv: CountPercentageValue) => {
              return {
                name: cpv.value,
                value: cpv.count,
                percent: cpv.percentage
              };
            }
          );
          if (fnCallback) {
            fnCallback();
          }
        })
    );
  }

  setCountryInHeaderMenu(country?: string): void {
    (this.headerRef as unknown as { activeCountry: string }).activeCountry =
      country;
  }

  setCountryToParam(country: string): void {
    this.country = country;
    this.countryCode = ISOCountryCodes[this.country];

    const specificCountryData = this.countryData[this.countryCode];
    if (specificCountryData.length) {
      this.latestCountryData =
        specificCountryData[specificCountryData.length - 1];
    }
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
    this.setCountryInHeaderMenu();
  }
}

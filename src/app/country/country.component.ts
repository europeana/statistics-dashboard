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
  CountryTotalInfo,
  DimensionName,
  GeneralResultsFormatted,
  IHash,
  IHashArray,
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

  // Used to parameterise links to the data page
  @Input() includeCTZero = false;
  @ViewChild('lineChart') lineChart: LineComponent;
  @ViewChild('legendGrid') legendGrid: LegendGridComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(APIService);
  public countryCodes = ISOCountryCodes;

  columnsEnabledCount = 3;
  columnsEnabled: IHash<boolean> = {};
  columnToEnable?: TargetFieldName;

  country: string;
  countryCode: string;
  countryLandingData: GeneralResultsFormatted = {};

  targetMetaData: IHash<IHashArray<TargetMetaData>>;
  countryData: IHash<Array<TargetData>> = {};
  countryTotalMap: IHash<CountryTotalInfo>;
  latestCountryData: TargetData;
  detailsExpanded = false;

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
      combineLatest([this.api.getCountryData(), this.route.params])
        .pipe(
          map((results) => {
            return {
              countryData: results[0],
              params: results[1]
            };
          })
        )
        .subscribe({
          next: (combined) => {
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

    this.subs.push(
      this.api.getTargetMetaData().subscribe((data) => {
        this.targetMetaData = data;
      })
    );

    this.subs.push(
      this.api
        .getGeneralResultsCountry()
        .subscribe((data: GeneralResultsFormatted) => {
          this.countryLandingData = data;
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

  toggleDetails(): void {
    this.detailsExpanded = !this.detailsExpanded;
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

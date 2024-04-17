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

import { colours, externalLinks } from '../_data';
import {
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
  RenameApiFacetPipe,
  RenameApiFacetShortPipe,
  RenameCountryPipe
} from '../_translate';

import { BarComponent, LineComponent } from '../chart';
import { LegendGridComponent } from '../legend-grid';
import { ResizeComponent } from '../resize';
import { SubscriptionManager } from '../subscription-manager';
import { TruncateComponent } from '../truncate';

@Component({
  //selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['../landing/landing.component.scss', './country.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    //DocArrowsComponent,
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
    RenameApiFacetShortPipe
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

  country: string;
  countryCode: string;
  countryLandingData: GeneralResultsFormatted = {};
  targetMetaData: IHash<IHashArray<TargetMetaData>>;
  countryData: IHash<Array<TargetData>> = {};
  latestCountryData: TargetData;
  detailsExpanded = false;
  monotonePowerbars = true;

  private rootRef: ElementRef;

  constructor(private applicationRef: ApplicationRef) {
    super();

    this.rootRef = this.applicationRef.components[0].instance;

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
            this.setCountryToParam(combined.params['country']);
            (
              this.rootRef as unknown as { header: { activeCountry: string } }
            ).header.activeCountry = combined.params['country'];
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

  setCountryToParam(country: string): void {
    if (this.legendGrid) {
      // remove old chart lines
      Object.keys(this.legendGrid.pinnedCountries).forEach(
        (countryCode: string) => {
          this.legendGrid.toggleCountry(countryCode);
        }
      );
    }

    this.country = country;
    const code = this.api.loadISOCountryCodes()[this.country];
    this.countryCode = code;

    const specificCountryData = this.countryData[this.countryCode];
    if (specificCountryData.length) {
      this.latestCountryData =
        specificCountryData[specificCountryData.length - 1];
    }
  }

  toggleDetails(): void {
    this.detailsExpanded = !this.detailsExpanded;
    this.lineChart.toggleCursor();
    this.lineChart.toggleGridlines();
  }
}

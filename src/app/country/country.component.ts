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
import { Component, Input, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

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

  country = 'France';
  countryCode = 'FR';
  countryLandingData: GeneralResultsFormatted = {};
  targetMetaData: IHash<IHashArray<TargetMetaData>>;
  countryData: IHash<Array<TargetData>> = {};
  latestCountryData: TargetData;
  detailsExpanded = false;
  monotonePowerbars = true;

  constructor(private readonly api: APIService) {
    super();
    this.subs.push(
      api.getCountryData().subscribe((countryData) => {
        this.countryData = countryData;
        const specificCountryData = countryData[this.countryCode];

        if (specificCountryData.length) {
          this.latestCountryData =
            specificCountryData[specificCountryData.length - 1];
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

  toggleDetails(): void {
    this.detailsExpanded = !this.detailsExpanded;
    this.lineChart.toggleCursor();
    this.lineChart.toggleGridlines();
    //this.lineChart.toggleScrollbar();
  }
}

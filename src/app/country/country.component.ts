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
  TemporalDataItem
} from '../_models';
import { APIService } from '../_services';
import {
  RenameCountryPipe,
  RenameApiFacetPipe,
  RenameApiFacetShortPipe
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
  public colours = colours;

  // Used to parameterise links to the data page
  @Input() includeCTZero = false;
  @ViewChild('lineChart') lineChart: LineComponent;

  country = 'France';
  countryCode = 'FR';
  countryLandingData: GeneralResultsFormatted = {};
  targetData: IHash<IHashArray<TargetData>>;
  countryData: IHash<Array<TemporalDataItem>> = {};
  latestCountryData: TemporalDataItem;
  detailsExpanded: boolean = false;
  monotonePowerbars: boolean = false; //true;

  constructor(private readonly api: APIService) {
    super();
    this.subs.push(
      api.getCountryData().subscribe((countryData) => {
        // this is all... for the chart
        this.countryData = countryData;

        const specificCountryData = countryData[this.countryCode];
        if (specificCountryData.length) {
          this.latestCountryData =
            specificCountryData[specificCountryData.length - 1];
        }
      })
    );

    this.subs.push(
      this.api.getTargetData().subscribe((targetData) => {
        this.targetData = targetData;
        //this.targetCountries = Object.keys(targetData);
        //this.targetCountriesOO = Object.keys(targetData);
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

    // extra
    import(`../doc-arrows/doc-arrows.component`).then(
      ({ DocArrowsComponent }) => new DocArrowsComponent()
    );
  }
}

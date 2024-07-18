import {
  DecimalPipe,
  LowerCasePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
  UpperCasePipe
} from '@angular/common';
import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';

import { externalLinks, ISOCountryCodes } from '../_data';
import { DimensionName, GeneralResultsFormatted } from '../_models';
import { RenameApiFacetPipe, RenameApiFacetShortPipe } from '../_translate';
import { BarComponent } from '../chart';
import { MapComponent } from '../chart/map/map.component';
import { ResizeComponent } from '../resize';
import { TruncateComponent } from '../truncate';

@Component({
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    ResizeComponent,
    NgIf,
    NgFor,
    TruncateComponent,
    NgTemplateOutlet,
    BarComponent,
    RouterLink,
    MapComponent,
    UpperCasePipe,
    LowerCasePipe,
    DecimalPipe,
    RenameApiFacetPipe,
    RenameApiFacetShortPipe
  ]
})
export class LandingComponent {
  public externalLinks = externalLinks;
  public DimensionName = DimensionName;
  public ISOCountryCodes = ISOCountryCodes;

  // Used to parameterise links to the data page
  @Input() includeCTZero = false;

  // Used to re-draw bar-charts
  @ViewChildren(BarComponent) barCharts: QueryList<BarComponent>;

  barColour = '#0771ce';
  isLoading: boolean;
  _landingData: GeneralResultsFormatted = {};

  @Input() set landingData(results: GeneralResultsFormatted) {
    this._landingData = results;
    this.refreshCharts();
  }
  get landingData(): GeneralResultsFormatted {
    return this._landingData;
  }

  hasData(): boolean {
    return Object.keys(this.landingData).length > 0;
  }

  refreshCharts(): void {
    if (this.barCharts) {
      // Top tier records count
      setTimeout(() => {
        this.barCharts.toArray().forEach((bc) => {
          bc.removeAllSeries();
          bc.ngAfterViewInit();
        });
      }, 1);
    }
  }
}

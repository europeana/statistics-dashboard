import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { externalLinks } from '../_data';
import { BarComponent } from '../chart';
import { DimensionName, GeneralResultsFormatted } from '../_models';
import { RenameApiFacetShortPipe } from '../_translate/rename-facet-short.pipe';
import { RenameApiFacetPipe } from '../_translate/rename-facet.pipe';
import { MapComponent } from '../chart/map/map.component';
import { RouterLink } from '@angular/router';
import { BarComponent as BarComponent_1 } from '../chart/bar/bar.component';
import { TruncateComponent } from '../truncate/truncate.component';
import { ResizeComponent } from '../resize/resize.component';
import {
  DecimalPipe,
  LowerCasePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
  UpperCasePipe
} from '@angular/common';

@Component({
  selector: 'app-landing',
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
    BarComponent_1,
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

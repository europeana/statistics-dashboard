import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { externalLinks } from '../_data';
import { BarComponent } from '../chart';
import { DimensionName, GeneralResultsFormatted } from '../_models';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
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

import {
  DecimalPipe,
  JsonPipe,
  LowerCasePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
  UpperCasePipe
} from '@angular/common';
import {
  Component,
  inject,
  Input,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { externalLinks, isoCountryCodes } from '../_data';
import {
  DimensionName,
  GeneralResultsFormatted,
  IHash,
  IHashArray,
  TargetData,
  TargetMetaData
} from '../_models';
import { APIService } from '../_services';
import {
  RenameApiFacetPipe,
  RenameApiFacetShortPipe,
  RenameCountryPipe
} from '../_translate';

import { BarComponent, MapComponent } from '../chart';
import { ResizeComponent } from '../resize';
import { SubscriptionManager } from '../subscription-manager';
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
    RenameApiFacetShortPipe,
    RenameCountryPipe,
    JsonPipe
  ]
})
export class LandingComponent extends SubscriptionManager {
  public externalLinks = externalLinks;
  public DimensionName = DimensionName;
  public isoCountryCodes = isoCountryCodes;

  // Used to parameterise links to the data page
  @Input() includeCTZero = false;

  // Used to re-draw bar-charts
  @ViewChildren(BarComponent) barCharts: QueryList<BarComponent>;
  @ViewChild(MapComponent) mapChart: MapComponent;

  barColour = '#0771ce';
  isLoading: boolean;
  _landingData: GeneralResultsFormatted = {};
  targetMetaData: IHash<IHashArray<TargetMetaData>>;
  targetData: IHash<IHashArray<TargetMetaData>>;
  countryData: IHash<Array<TargetData>>;

  @Input() set landingData(results: GeneralResultsFormatted) {
    this._landingData = results;
    this.refreshCharts();
  }
  get landingData(): GeneralResultsFormatted {
    return this._landingData;
  }

  private readonly api = inject(APIService);

  constructor() {
    super();
  }

  onMapCountrySet(): void {
    if (!this.targetMetaData) {
      this.subs.push(
        this.api
          .getTargetMetaData()
          .subscribe((targetMetaData: IHash<IHashArray<TargetMetaData>>) => {
            this.targetMetaData = targetMetaData;
          })
      );
    }

    if (!this.countryData) {
      this.subs.push(
        this.api
          .getCountryData()
          .subscribe((countryData: IHash<Array<TargetData>>) => {
            this.countryData = countryData;
            console.log('loaded countryData', countryData);
          })
      );
    }
  }

  hasLandingData(): boolean {
    return Object.keys(this.landingData).length > 0;
  }

  refreshCharts(): void {
    if (this.barCharts) {
      // Top tier items count
      setTimeout(() => {
        this.barCharts.toArray().forEach((bc) => {
          bc.removeAllSeries();
          bc.ngAfterViewInit();
        });
      }, 1);
    }
  }
}

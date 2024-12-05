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
import { externalLinks, isoCountryCodes, targetDescriptions } from '../_data';
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
  RenameCountryPipe,
  RenameTargetTypePipe
} from '../_translate';

import { BarComponent, MapComponent } from '../chart';
import { ResizeComponent } from '../resize';
import { SpeechBubbleComponent } from '../speech-bubble';
import { SubscriptionManager } from '../subscription-manager';
import { TruncateComponent } from '../truncate';

@Component({
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss', './country-section.scss'],
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
    RenameTargetTypePipe,
    SpeechBubbleComponent,
    JsonPipe
  ]
})
export class LandingComponent extends SubscriptionManager {
  public externalLinks = externalLinks;
  public DimensionName = DimensionName;
  public isoCountryCodes = isoCountryCodes;
  public TargetFieldName = TargetFieldName;
  public targetDescriptions = targetDescriptions;

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
  targetExpanded: TargetFieldName | undefined;
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

  prefixClass(className: string): string {
    return 'help-' + className;
  }

  tapTargetDataLoad(targetType: TargetFieldName): TargetFieldName {
    if (!this.targetMetaData) {
      this.subs.push(
        this.api
          .getTargetMetaData()
          .subscribe((targetMetaData: IHash<IHashArray<TargetMetaData>>) => {
            this.targetMetaData = targetMetaData;
          })
      );
    }
    return targetType;
  }

  onMapCountrySet(): void {
    if (!this.countryData) {
      this.subs.push(
        this.api
          .getCountryData()
          .subscribe((countryData: IHash<Array<TargetData>>) => {
            this.countryData = countryData;
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

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
  IdValue,
  IHash,
  IHashArray,
  NameValue,
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
  allProgressSeries: IHashArray<Array<IdValue>> = {};
  mapData: Array<IdValue>;
  mapSeriesIndex = 0;

  @Input() set landingData(results: GeneralResultsFormatted) {
    this._landingData = results;
    this.mapData = results[DimensionName.country]
      ? results[DimensionName.country].map((nv: NameValue) => {
          return {
            id: nv.name,
            value: nv.value
          };
        })
      : [];
    this.refreshCharts();
  }

  get landingData(): GeneralResultsFormatted {
    return this._landingData;
  }

  private readonly api = inject(APIService);

  constructor() {
    super();
  }

  closeMapSelection(): void {
    this.mapChart.countryClick(this.mapChart.selectedCountry);
  }

  /**
   * buildDerivedSeries
   *
   **/
  buildDerivedSeries(): void {
    Object.values(TargetFieldName).forEach((targetType: TargetFieldName) => {
      this.allProgressSeries[targetType] = [[], []];

      Object.keys(this.countryData).forEach((country: string) => {
        [0, 1].forEach((targetIndex: number) => {
          const value = this.countryData[country][0][targetType];
          const target =
            this.targetMetaData[country][targetType][targetIndex].value;
          const progress = (parseInt(value) / target) * 100;

          this.allProgressSeries[targetType][targetIndex].push({
            id: country,
            value: progress
          });
        });
      });
    });
  }

  dataSwitch(seriesTargetType: TargetFieldName, targetIndex: number): void {
    console.log('dataSwitch()');

    // TODO do generation when menu is opened

    // ensure targetMetaData has loaded
    this.tapTargetDataLoad(undefined, () => {
      // ensure targetCountryData has loaded
      this.tapCountryDataLoad(() => {
        // ensure derived series have been generated
        if (Object.keys(this.allProgressSeries).length === 0) {
          this.buildDerivedSeries();
        }

        this.mapChart.mapData =
          this.allProgressSeries[seriesTargetType][targetIndex];

        this.mapSeriesIndex += 1;
        if (this.mapSeriesIndex > 1) {
          this.mapSeriesIndex = 0;
        }
        this.mapChart.dataSwitch(this.mapSeriesIndex);
      });
    });
  }

  prefixClass(className: string): string {
    return 'help-' + className;
  }

  tapCountryDataLoad(fnCallback?: () => void): void {
    if (!this.countryData) {
      this.subs.push(
        this.api
          .getCountryData()
          .subscribe((countryData: IHash<Array<TargetData>>) => {
            this.countryData = countryData;
            if (fnCallback) {
              fnCallback();
            }
          })
      );
    } else if (fnCallback) {
      fnCallback();
    }
  }

  tapTargetDataLoad(
    targetType?: TargetFieldName,
    fnCallback?: () => void
  ): TargetFieldName | undefined {
    if (!this.targetMetaData) {
      this.subs.push(
        this.api
          .getTargetMetaData()
          .subscribe((targetMetaData: IHash<IHashArray<TargetMetaData>>) => {
            this.targetMetaData = targetMetaData;
            if (fnCallback) {
              fnCallback();
            }
          })
      );
    } else if (fnCallback) {
      fnCallback();
    }
    return targetType;
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

import {
  DecimalPipe,
  JsonPipe,
  KeyValuePipe,
  LowerCasePipe,
  NgClass,
  NgFor,
  NgIf,
  NgStyle,
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

type VisibleHeatMap = {
  [key in
    | TargetFieldName.THREE_D
    | TargetFieldName.HQ
    | TargetFieldName.TOTAL]: number;
};

@Component({
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss', './landing.component-country.scss'],
  standalone: true,
  imports: [
    NgClass,
    ResizeComponent,
    NgIf,
    NgFor,
    TruncateComponent,
    NgStyle,
    NgTemplateOutlet,
    BarComponent,
    RouterLink,
    KeyValuePipe,
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

  singleCountryMode = false;
  barColour = '#0771ce';
  isLoading: boolean;
  _landingData: GeneralResultsFormatted = {};
  targetMetaData: IHash<IHashArray<TargetMetaData>>;
  targetData: IHash<IHashArray<TargetMetaData>>;
  targetExpanded: TargetFieldName | undefined;
  countryData: IHash<Array<TargetData>>;
  allProgressSeries: IHashArray<Array<IdValue>> = {};
  mapData: Array<IdValue>;
  mapMenuIsOpen = false;
  heatmapActivated = false;
  _visibleHeatMap?: VisibleHeatMap;

  get visibleHeatMap(): VisibleHeatMap | undefined {
    return this._visibleHeatMap;
  }

  set visibleHeatMap(visibleHeatMap: VisibleHeatMap) {
    if (!this.visibleHeatMap && visibleHeatMap) {
      this.heatmapActivated = true;
    } else {
      this.heatmapActivated = false;
    }
    this._visibleHeatMap = visibleHeatMap;
  }

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

  // template utility
  getCountryRows(
    defaultResult: Array<NameValue>
  ): Array<IdValue> | Array<NameValue> {
    if (this.visibleHeatMap) {
      const key = Object.keys(this.visibleHeatMap)[0];
      return this.allProgressSeries[key][this.visibleHeatMap[key]];
    }
    return defaultResult;
  }

  closeMapSelection(): void {
    this.mapChart.countryClick(this.mapChart.selectedCountry);
  }

  /**
   * onMapCountrySet
   * reacts to mapChart events by loading data
   **/
  onMapCountrySet(singleCountryMode: boolean): void {
    this.singleCountryMode = singleCountryMode;
    this.tapCountryDataLoad();
    if (this.visibleHeatMap) {
      const vhm = this.visibleHeatMap;
      this.targetExpanded = Object.keys(vhm)[0] as TargetFieldName;
    }
  }

  /**
   * mapMenuOpenerClicked
   *
   * toggles mapMenuIsOpen
   * triggers data load if needed
   **/
  mapMenuOpenerClicked(): void {
    this.mapMenuIsOpen = !this.mapMenuIsOpen;
    if (this.mapMenuIsOpen) {
      this.tapCountryDataLoad();
      this.tapTargetDataLoad();
    }
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
          const progress = value
            ? parseFloat(((parseInt(value) / target) * 100).toFixed(2))
            : 0;
          this.allProgressSeries[targetType][targetIndex].push({
            id: country,
            value: progress
          });
        });
      });
    });
  }

  /**
   * sortDerivedSeries
   *
   **/
  sortDerivedSeries(): void {
    Object.values(TargetFieldName).forEach((targetType: TargetFieldName) => {
      [0, 1].forEach((targetIndex: number) => {
        this.allProgressSeries[targetType][targetIndex].sort(
          (itemA: IdValue, itemB: IdValue) => {
            if (itemA.value > itemB.value) {
              return -1;
            } else if (itemA.value < itemB.value) {
              return 1;
            }
            return 0;
          }
        );
      });
    });
  }

  getDerivedSeriesValue(
    targetType: TargetFieldName,
    targetIndex: number,
    id: string
  ): number {
    const idVal = this.allProgressSeries[targetType][targetIndex].find(
      (idVal: IdValue) => {
        return idVal.id === id;
      }
    );
    if (idVal) {
      return idVal.value;
    }
    return 0;
  }

  /** clearHeatmap
   * restore the default data in the map component
   * set colours and unset percentage mode in the map component
   * reset visibleHeatMap variable
   **/
  clearHeatmap(): void {
    this.mapChart.mapData = this.mapData;
    this.mapChart.colourScheme = this.mapChart.colourSchemeDefault;
    this.mapChart.setPercentMode(false);

    this.visibleHeatMap = undefined;
    this.mapMenuIsOpen = false;
  }

  /** showHeatmap
   * overwrite the data in the map component with derived target-progress series
   * set colours and percentage mode in the map component
   * set visibleHeatMap variable
   **/
  showHeatmap(seriesTargetType: TargetFieldName, targetIndex: number): void {

    if (Object.keys(this.allProgressSeries).length === 0) {
      this.buildDerivedSeries();
      this.sortDerivedSeries();
    }

    this.mapChart.mapData =
      this.allProgressSeries[seriesTargetType][targetIndex];

    this.mapChart.setPercentMode(true);

    const vhm = [seriesTargetType].reduce(
      (ob: VisibleHeatMap, tType: TargetFieldName) => {
        ob[tType] = targetIndex;
        return ob;
      },
      {} as VisibleHeatMap
    );
    this.visibleHeatMap = vhm;
    this.mapChart.colourScheme =
      this.mapChart.colourSchemeTargets[seriesTargetType][targetIndex];

    if (this.singleCountryMode) {
      this.targetExpanded = seriesTargetType;
    }

    this.mapMenuIsOpen = false;
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

import {
  DecimalPipe,
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
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClickAwareDirective, OpenerFocusDirective } from '../_directives';
import {
  DimensionName,
  externalLinks,
  isoCountryCodes,
  targetDescriptions
} from '../_data';
import {
  IdValue,
  IHash,
  IHashArray,
  NameValue,
  TargetData,
  TargetFieldName,
  TargetMetaData,
  VisibleHeatMap
} from '../_models';
import { APIService, FilterStateService } from '../_services';
import {
  RenameApiFacetPipe,
  RenameApiFacetShortPipe,
  RenameCountryPipe,
  RenameTargetTypePipe
} from '../_translate';
import { BarComponent, MapComponent } from '../chart';
import { ResizeComponent } from '../resize';
import { SpeechBubbleComponent } from '../speech-bubble';
import { TruncateComponent } from '../truncate';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss', './landing.component-country.scss'],
  imports: [
    ClickAwareDirective,
    OpenerFocusDirective,
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
    SpeechBubbleComponent
  ]
})
export class LandingComponent implements OnDestroy {
  private readonly api = inject(APIService);
  private readonly filterStateService = inject(FilterStateService);
  private readonly cdr = inject(ChangeDetectorRef);

  public externalLinks = externalLinks;
  public DimensionName = DimensionName;
  public isoCountryCodes = isoCountryCodes;
  public TargetFieldName = TargetFieldName;
  public targetDescriptions = targetDescriptions;

  readonly includeCTZero = this.filterStateService.includeCTZero;

  barCharts = viewChildren(BarComponent);
  mapChart = viewChild(MapComponent);
  layerOpener = viewChild<ElementRef<HTMLElement>>('layerOpener');

  singleCountryMode = false;
  barColour = '#0771ce';

  targetMetaData = signal<IHash<IHashArray<TargetMetaData>> | undefined>(
    undefined
  );
  countryData = signal<IHash<Array<TargetData>> | undefined>(undefined);

  targetExpanded: TargetFieldName | undefined;
  allProgressSeries: IHashArray<Array<IdValue>> = {};
  mapMenuIsOpen = false;
  heatmapActivated = false;

  private _visibleHeatMap?: VisibleHeatMap;
  private readonly activeSubscriptions: Subscription[] = [];

  get visibleHeatMap(): VisibleHeatMap | undefined {
    return this._visibleHeatMap;
  }

  set visibleHeatMap(visibleHeatMap: VisibleHeatMap | undefined) {
    this.heatmapActivated = !this.visibleHeatMap && !!visibleHeatMap;
    this._visibleHeatMap = visibleHeatMap;
    this.cdr.markForCheck();
  }

  readonly landingData = this.filterStateService.landingData;
  readonly landingDataIsLoading = this.filterStateService.landingDataIsLoading;

  readonly mapData = computed<Array<IdValue>>(() => {
    const results = this.landingData();
    return results[DimensionName.country]
      ? results[DimensionName.country].map((nv: NameValue) => ({
          id: nv.name,
          value: nv.value
        }))
      : [];
  });

  activeMapData = signal<Array<IdValue>>([]);

  constructor() {
    effect(() => {
      this.landingData();
      this.activeMapData.set(this.mapData());
      queueMicrotask(() => {
        this.refreshCharts();
      });
    });
  }

  ngOnDestroy(): void {
    this.activeSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  getCountryRows(
    defaultResult: Array<NameValue>
  ): Array<IdValue> | Array<NameValue> {
    if (this.visibleHeatMap) {
      const key = Object.keys(this.visibleHeatMap)[0];
      return this.allProgressSeries[key][this.visibleHeatMap[key]];
    }
    return defaultResult;
  }

  getDerivedSeriesValue(
    targetType: TargetFieldName,
    targetIndex: number,
    id: string
  ): number {
    const series = this.allProgressSeries[targetType]?.[targetIndex];
    if (!series) return 0;
    const idVal = series.find((item: IdValue) => item.id === id);
    return idVal ? idVal.value : 0;
  }

  closeMapSelection(): void {
    const chart = this.mapChart();
    if (chart) {
      chart.countryClick(chart.selectedCountry);
    }
  }

  onMapCountrySet(singleCountryMode: boolean): void {
    this.singleCountryMode = singleCountryMode;
    this.tapCountryDataLoad();
    if (this.visibleHeatMap) {
      const vhm = this.visibleHeatMap;
      this.targetExpanded = Object.keys(vhm)[0] as TargetFieldName;
    }
    this.cdr.markForCheck();
  }

  mapMenuOpenerClicked(): void {
    this.mapMenuIsOpen = !this.mapMenuIsOpen;
    if (this.mapMenuIsOpen) {
      this.tapCountryDataLoad();
      this.tapTargetDataLoad();
    }
    this.cdr.markForCheck();
  }

  buildDerivedSeries(): void {
    const cData = this.countryData();
    const meta = this.targetMetaData();
    if (!cData || !meta) return;

    Object.values(TargetFieldName).forEach((targetType: TargetFieldName) => {
      this.allProgressSeries[targetType] = [[], []];

      Object.keys(cData).forEach((country: string) => {
        [0, 1].forEach((targetIndex: number) => {
          const value = cData[country][0]?.[targetType];
          const countryMeta = meta[country]?.[targetType]?.[targetIndex];
          const target = countryMeta ? countryMeta.value : 0;

          const progress =
            value && target
              ? Number.parseFloat(
                  ((Number.parseInt(value) / target) * 100).toFixed(2)
                )
              : 0;

          this.allProgressSeries[targetType][targetIndex].push({
            id: country,
            value: progress
          });
        });
      });
    });
  }

  sortDerivedSeries(): void {
    Object.values(TargetFieldName).forEach((targetType: TargetFieldName) => {
      [0, 1].forEach((targetIndex: number) => {
        this.allProgressSeries[targetType][targetIndex].sort(
          (itemA: IdValue, itemB: IdValue) => itemB.value - itemA.value
        );
      });
    });
  }

  clearHeatmap(): void {
    this.activeMapData.set(this.mapData());
    const chart = this.mapChart();
    if (chart) {
      chart.colourScheme = chart.colourSchemeDefault;
      chart.setMapPercentMode(false);
    }
    this.visibleHeatMap = undefined;
    this.closeMapMenu();
  }

  closeMapMenu(): void {
    const wasAlreadyClosed = !this.mapMenuIsOpen;
    this.mapMenuIsOpen = false;
    if (!this.mapMenuIsOpen && !wasAlreadyClosed) {
      this.layerOpener()?.nativeElement.focus();
    }
    this.cdr.markForCheck();
  }

  showHeatmap(seriesTargetType: TargetFieldName, targetIndex: number): void {
    if (Object.keys(this.allProgressSeries).length === 0) {
      this.buildDerivedSeries();
      this.sortDerivedSeries();
    }

    const seriesData =
      this.allProgressSeries[seriesTargetType]?.[targetIndex] || [];
    this.activeMapData.set(seriesData);

    const chart = this.mapChart();
    if (chart) {
      chart.setMapPercentMode(true);
      chart.colourScheme =
        chart.colourSchemeTargets[seriesTargetType]?.[targetIndex];
    }

    if (this.singleCountryMode) {
      this.targetExpanded = seriesTargetType;
    }

    this.closeMapMenu();
  }

  prefixClass(className: string): string {
    return 'help-' + className;
  }

  tapCountryDataLoad(fnCallback?: () => void): void {
    if (!this.countryData()) {
      this.activeSubscriptions.push(
        this.api
          .getCountryData()
          .subscribe((countryData: IHash<Array<TargetData>>) => {
            this.countryData.set(countryData);
            if (fnCallback) fnCallback();
            this.cdr.markForCheck();
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
    if (!this.targetMetaData()) {
      this.activeSubscriptions.push(
        this.api
          .getTargetMetaData()
          .subscribe((targetMetaData: IHash<IHashArray<TargetMetaData>>) => {
            this.targetMetaData.set(targetMetaData);
            if (fnCallback) fnCallback();
            this.cdr.markForCheck();
          })
      );
    } else if (fnCallback) {
      fnCallback();
    }
    return targetType;
  }

  hasLandingData(): boolean {
    return Object.keys(this.landingData()).length > 0;
  }

  refreshCharts(): void {
    const charts = this.barCharts();
    if (charts && charts.length > 0) {
      charts.forEach((bc) => {
        bc.removeAllSeries();
        bc.addSeriesFromResult();
      });
      this.cdr.markForCheck();
    }
  }
}

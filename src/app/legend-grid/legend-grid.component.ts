import {
  DecimalPipe,
  LowerCasePipe,
  NgClass,
  NgStyle,
  NgTemplateOutlet
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  OnDestroy,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import {
  CountryHistoryRequest,
  IHash,
  IHashArray,
  TargetCountryData,
  TargetData,
  TargetFieldName,
  TargetMetaData,
  TargetSeriesSuffixes
} from '../_models';
import { RenameCountryPipe, RenameTargetTypePipe } from '../_translate';
import { LineComponent } from '../chart';

@Component({
  selector: 'app-legend-grid',
  templateUrl: './legend-grid.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./legend-grid.component.scss'],
  imports: [
    DecimalPipe,
    LowerCasePipe,
    NgClass,
    NgTemplateOutlet,
    NgStyle,
    RenameCountryPipe,
    RenameTargetTypePipe
  ]
})
export class LegendGridComponent implements AfterViewInit, OnDestroy {
  private readonly injector = inject(Injector);

  private readonly cdr = inject(ChangeDetectorRef);

  readonly columnEnabled3D = input<boolean>(true);
  readonly columnEnabledHQ = input<boolean>(true);
  readonly columnEnabledALL = input<boolean>(true);
  readonly countryCode = input<string>('');
  readonly targetMetaData = input<IHash<IHashArray<TargetMetaData>>>({});

  private readonly _pinnedCountries = signal<IHash<number>>({});
  public pinnedCountries: IHash<number> = {};

  readonly columnsEnabledCount = computed(() => {
    return [
      this.columnEnabled3D(),
      this.columnEnabledHQ(),
      this.columnEnabledALL()
    ].filter(Boolean).length;
  });

  private readonly targetCountriesOO = computed(() => {
    return Object.keys(this.targetMetaData());
  });

  readonly targetCountries = computed(() => {
    const pins = this._pinnedCountries();
    const originalOrder = this.targetCountriesOO();
    return Object.keys(pins).concat(
      originalOrder.filter((country) => !(country in pins))
    );
  });

  timeoutAnimation = 800;
  public classReference = LegendGridComponent;
  private readonly renameCountry = new RenameCountryPipe();
  static readonly itemHeight = 84.5;

  countryData = model<IHash<Array<TargetData>>>({});
  lineChart = input.required<LineComponent>();

  unpinColumn = output<TargetFieldName>();
  historyLoadded = output<CountryHistoryRequest>();

  legendGrid = viewChild<ElementRef>('legendGrid');

  hiddenColumnRanges: IHash<IHash<Array<number>>> = {};
  hiddenColumnPinData: Array<Array<string>> = [[], [], []];
  hiddenSeriesSetData: Array<IHash<am4charts.LineSeries>> = [{}, {}, {}];

  public TargetSeriesSuffixes = TargetSeriesSuffixes;
  public seriesSuffixesFmt = [' (3D)', ' (hq)', ' (total)'];
  public seriesValueNames = Object.keys(TargetFieldName);

  public TargetFieldName = TargetFieldName;

  constructor() {
    effect(() => {
      if (this.columnEnabled3D()) {
        this.showSeriesSet(0);
        this.showHiddenRangesByColumn(TargetFieldName.THREE_D);
      } else {
        this.hideRangesByColumn(TargetFieldName.THREE_D);
        this.hideSeriesSet(0);
      }
      this.cdr.markForCheck();
    });

    effect(() => {
      if (this.columnEnabledHQ()) {
        this.showSeriesSet(1);
        this.showHiddenRangesByColumn(TargetFieldName.HQ);
      } else {
        this.hideRangesByColumn(TargetFieldName.HQ);
        this.hideSeriesSet(1);
      }
      this.cdr.markForCheck();
    });

    effect(() => {
      if (this.columnEnabledALL()) {
        this.showSeriesSet(2);
        this.showHiddenRangesByColumn(TargetFieldName.TOTAL);
      } else {
        this.hideRangesByColumn(TargetFieldName.TOTAL);
        this.hideSeriesSet(2);
      }
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    effect(
      () => {
        const code = this.countryCode();
        const meta = this.targetMetaData();

        untracked(() => {
          if (!meta || Object.keys(meta).length === 0) {
            return;
          }

          if (this.lineChart()?.chart?.colors) {
            this.lineChart().chart.colors.reset();
          }

          let timeout = 0;
          const pinnedKeys = Object.keys(this.pinnedCountries);
          if (pinnedKeys.length) {
            timeout = this.timeoutAnimation;
          }

          pinnedKeys.forEach((pinnedCode: string) =>
            this.toggleCountry(pinnedCode)
          );

          setTimeout(() => {
            if (code) {
              this.toggleCountry(code);
            }
            if (this.lineChart()) {
              this.lineChart().enableAxes();
            }
            this.cdr.markForCheck();
          }, timeout);
        });
      },
      { injector: this.injector }
    );
  }

  ngOnDestroy(): void {
    untracked(this.targetCountriesOO).forEach((country: string) => {
      if (this.lineChart()) {
        this.lineChart().removeRange(country);
      }
    });
  }

  getCountrySeries(country: string): Array<am4charts.LineSeries> {
    if (!this.lineChart()?.allSeriesData) return [];
    return TargetSeriesSuffixes.map((seriesSuffix: string) => {
      return this.lineChart().allSeriesData[`${country}${seriesSuffix}`];
    }).filter((x) => x);
  }

  sortPins(strings: Array<string>, desiredOrder: Array<string>): void {
    const reversedOrder = structuredClone(desiredOrder).reverse();
    strings.sort((a: string, b: string) => {
      return reversedOrder.indexOf(b) - reversedOrder.indexOf(a);
    });
  }

  showSeriesSet(colIndex: number): void {
    const seriesSet = this.hiddenSeriesSetData[colIndex];
    const pinOrder = this.hiddenColumnPinData[colIndex];

    Object.keys(seriesSet).forEach((country: string) => {
      seriesSet[country].show();
      if (!(country in this.pinnedCountries)) {
        this.togglePin(country, false, pinOrder);
      }
    });

    this.hiddenSeriesSetData[colIndex] = {};
    this.hiddenColumnPinData[colIndex] = [];
  }

  hideSeriesSet(colIndex: number): void {
    const countries = Object.keys(this.pinnedCountries);

    countries.forEach((country: string) => {
      const countrySeriesKeys = TargetSeriesSuffixes.map(
        (suffix: string) => `${country}${suffix}`
      );
      const countrySeriesObjects = countrySeriesKeys.map(
        (key: string) => this.lineChart().allSeriesData[key]
      );
      const targetSeries = countrySeriesObjects[colIndex];

      if (targetSeries && !targetSeries.isHidden) {
        targetSeries.hide();
        this.hiddenSeriesSetData[colIndex][country] = targetSeries;

        const visibleCount = countrySeriesObjects.filter(
          (item) => item && !item.isHidden
        ).length;
        if (visibleCount === 1) {
          this.hiddenColumnPinData[colIndex] = structuredClone(countries);
          this.togglePin(country, false);
        }
      }
    });
  }

  hideRangesByColumn(column?: TargetFieldName): void {
    const all = this.hiddenColumnRanges;
    Object.keys(this.pinnedCountries).forEach((country: string) => {
      const removed = this.lineChart().removeRange(country, column);
      Object.keys(removed).forEach((key: string) => {
        all[key] = Object.assign(all[key] ? all[key] : {}, removed[key]);
      });
    });
  }

  showHiddenRangesByColumn(column?: TargetFieldName): void {
    const hidden = this.hiddenColumnRanges;

    Object.keys(hidden)
      .filter((key: string) =>
        column
          ? TargetFieldName[key as keyof typeof TargetFieldName] === column
          : true
      )
      .forEach((targetFieldName: string) => {
        Object.keys(hidden[targetFieldName]).forEach((country: string) => {
          const seriesKey =
            country +
            TargetSeriesSuffixes[
              this.seriesValueNames.indexOf(targetFieldName)
            ];
          const fillColour = this.lineChart().allSeriesData[seriesKey]
            .fill as am4core.Color;

          hidden[targetFieldName][country].forEach((index: number) => {
            this.lineChart().showRange(
              country,
              TargetFieldName[targetFieldName as keyof typeof TargetFieldName],
              index,
              fillColour
            );
          });
        });
        delete hidden[targetFieldName];
      });
  }

  resetChartColors(seriesIndex: number, countryPinIndex: number): void {
    const currentPinCount = Object.keys(this.pinnedCountries).length;
    const resolvedPinIndex = countryPinIndex || currentPinCount;
    const skips = resolvedPinIndex * 3 + (seriesIndex || 0);

    if (skips && this.lineChart()?.chart?.colors) {
      this.lineChart().chart.colors.reset();
      for (let i = 0; i < skips; i++) {
        this.lineChart().chart.colors.next();
      }
    }
  }

  loadCountryChartData(
    country: string,
    seriesTypes: TargetFieldName[] = []
  ): void {
    this.historyLoadded.emit({
      country: country,
      fnCallback: (data: Array<TargetCountryData>) => {
        const currentData = this.countryData();

        currentData[country] = (currentData[country] || []).concat(data);

        this.lineChart().sortSeriesData(currentData[country]);
        this.addSeriesSetAndPin(country, currentData[country], seriesTypes);

        this.cdr.markForCheck();
      }
    });
  }

  toggleCountry(country: string): void {
    const countrySeries = this.getCountrySeries(country);

    if (countrySeries.length === 0) {
      const countryData = this.countryData()[country];
      const seriesTypes = [
        TargetFieldName.THREE_D,
        TargetFieldName.HQ,
        TargetFieldName.TOTAL
      ];

      if (countryData && countryData.length > 1) {
        this.addSeriesSetAndPin(country, countryData, seriesTypes);
      } else {
        this.loadCountryChartData(country, seriesTypes);
      }
    } else {
      const hasVisible = countrySeries.some((series) => !series.isHidden);
      if (hasVisible) {
        countrySeries.forEach((series) => series.hide());
        this.lineChart().removeRange(country);
        this.togglePin(country);
        this._pinnedCountries.set({ ...this.pinnedCountries });
      } else {
        countrySeries.forEach((series) => series.show());
        this.togglePin(country);
        this._pinnedCountries.set({ ...this.pinnedCountries });
      }
    }
  }

  addSeriesSetAndPin(
    country: string,
    data: Array<TargetData>,
    seriesToAdd: Array<TargetFieldName> = []
  ): void {
    const dataAscending = [...data].reverse();
    const activeColumns = [
      this.columnEnabled3D(),
      this.columnEnabledHQ(),
      this.columnEnabledALL()
    ];

    activeColumns.forEach((colEnabled: boolean, i: number) => {
      if (colEnabled) {
        const typeFromIndex =
          TargetFieldName[
            this.seriesValueNames[i] as keyof typeof TargetFieldName
          ];
        if (seriesToAdd.includes(typeFromIndex)) {
          const currentPinIndex = this.pinnedCountries[country];
          this.resetChartColors(i, currentPinIndex);
          this.lineChart().addSeries(
            this.renameCountry.transform(country) + this.seriesSuffixesFmt[i],
            country + TargetSeriesSuffixes[i],
            typeFromIndex,
            dataAscending
          );
        }
      }
    });

    if (!(country in this.pinnedCountries)) {
      this.togglePin(country);
    }
  }

  toggleRange(
    country: string,
    type: TargetFieldName,
    index: number,
    colour?: am4core.Color
  ): void {
    if (colour) {
      this.lineChart().showRange(country, type, index, colour);
    } else {
      this.lineChart().removeRange(country, type, index);
    }
  }

  togglePin(
    country: string,
    purgePinData = true,
    reorder?: Array<string>
  ): void {
    if (country in this.pinnedCountries) {
      delete this.pinnedCountries[country];

      if (purgePinData) {
        [0, 1, 2].forEach((colIndex: number) => {
          const pinOrder = this.hiddenColumnPinData[colIndex];
          if (pinOrder) {
            this.hiddenColumnPinData[colIndex] = pinOrder.filter(
              (elem) => elem !== country
            );
            delete this.hiddenSeriesSetData[colIndex][country];
          }
        });
      }
    } else {
      this.pinnedCountries[country] = 1;
    }

    if (reorder) {
      const sortTarget = structuredClone(Object.keys(this.pinnedCountries));
      this.sortPins(sortTarget, reorder);
      this.pinnedCountries = sortTarget.reduce(
        (res: IHash<number>, item: string) => {
          res[item] = 0;
          return res;
        },
        {}
      );
    }

    Object.keys(this.pinnedCountries).forEach((key: string, i: number) => {
      this.pinnedCountries[key] = i;
    });

    this._pinnedCountries.set({ ...this.pinnedCountries });
  }

  gridScroll(): void {
    const el = this.legendGrid().nativeElement;
    const canScrollDown =
      el.scrollHeight > el.scrollTop + el.getBoundingClientRect().height + 1;
    el.classList.toggle('scrollable-downwards', canScrollDown);
  }

  toggleSeries(
    country: string,
    type: TargetFieldName,
    series?: am4charts.LineSeries
  ): void {
    if (!series) {
      if ((this.countryData()[country] || []).length < 2) {
        this.loadCountryChartData(country, [type]);
      } else {
        const data = this.countryData()[country].map((cd) => {
          cd['country'] = country;
          return cd as TargetCountryData;
        });
        this.addSeriesSetAndPin(country, data, [type]);
      }
    } else if (series.isHidden) {
      series.show();
      if (!(country in this.pinnedCountries)) {
        this.togglePin(country);
      }
    } else {
      series.hide();
      this.lineChart().removeRange(country, type);

      let visCount = 0;
      TargetSeriesSuffixes.forEach((suffix: string) => {
        const sd = this.lineChart().allSeriesData[country + suffix];
        if (sd && !sd.isHidden) {
          visCount += 1;
        }
      });

      if (visCount === 1) {
        this.togglePin(country);
      }
    }
  }

  fireUnpinColumn(column: TargetFieldName): void {
    this.unpinColumn.emit(column);
  }
}

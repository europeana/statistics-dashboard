import {
  DatePipe,
  DecimalPipe,
  JsonPipe,
  KeyValuePipe,
  NgClass,
  NgFor,
  NgIf,
  NgStyle,
  NgTemplateOutlet
} from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
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
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    JsonPipe,
    NgClass,
    NgIf,
    NgFor,
    NgTemplateOutlet,
    NgStyle,
    KeyValuePipe,
    LineComponent,
    RenameCountryPipe,
    RenameTargetTypePipe
  ]
})
export class LegendGridComponent {
  targetCountries: Array<string>;
  targetCountriesOO: Array<string>;
  timeoutAnimation = 800;
  static itemHeight = 84.5;

  _columnEnabled3D = true;
  _columnEnabledHQ = true;
  _columnEnabledALL = true;
  columnsEnabledCount = 3;

  @Input() set columnEnabled3D(value: boolean) {
    if (value) {
      this.showSeriesSet(0);
      this.showHiddenRangesByColumn(TargetFieldName.THREE_D);
    } else {
      this.hideRangesByColumn(TargetFieldName.THREE_D);
      this.hideSeriesSet(0);
    }
    this._columnEnabled3D = value;
    this.calculateColumnsEnabledCount();
  }

  get columnEnabled3D(): boolean {
    return this._columnEnabled3D;
  }

  @Input() set columnEnabledHQ(value: boolean) {
    if (value) {
      this.showSeriesSet(1);
      this.showHiddenRangesByColumn(TargetFieldName.HQ);
    } else {
      this.hideRangesByColumn(TargetFieldName.HQ);
      this.hideSeriesSet(1);
    }
    this._columnEnabledHQ = value;
    this.calculateColumnsEnabledCount();
  }

  get columnEnabledHQ(): boolean {
    return this._columnEnabledHQ;
  }

  @Input() set columnEnabledALL(value: boolean) {
    if (value) {
      this.showSeriesSet(2);
      this.showHiddenRangesByColumn(TargetFieldName.TOTAL);
    } else {
      this.hideRangesByColumn(TargetFieldName.TOTAL);
      this.hideSeriesSet(2);
    }
    this._columnEnabledALL = value;
    this.calculateColumnsEnabledCount();
  }

  get columnEnabledALL(): boolean {
    return this._columnEnabledALL;
  }

  _countryCode: string;
  _targetMetaData: IHash<IHashArray<TargetMetaData>>;

  @Input() set countryCode(countryCode: string) {
    if (this.lineChart) {
      this.lineChart.chart.colors.reset();
    }

    let timeout = 0;

    // remove old chart lines

    if (this._countryCode) {
      const pinned = Object.keys(this.pinnedCountries);
      if (pinned.length) {
        timeout = this.timeoutAnimation;
      }
      pinned.forEach((countryCode: string) => {
        this.toggleCountry(countryCode);
      });
    }

    // set new country
    this._countryCode = countryCode;
    setTimeout(() => {
      this.toggleCountry(this.countryCode);
      this.lineChart.enableAxes();
    }, timeout);
  }

  get countryCode(): string {
    return this._countryCode;
  }

  @Input() set targetMetaData(data: IHash<IHashArray<TargetMetaData>>) {
    this._targetMetaData = data;
    this.targetCountries = Object.keys(data);
    this.targetCountriesOO = Object.keys(data);
  }
  get targetMetaData(): IHash<IHashArray<TargetMetaData>> {
    return this._targetMetaData;
  }

  @Input() countryData: IHash<Array<TargetData>> = {};
  @Input() lineChart: LineComponent;

  @Output() unpinColumn: EventEmitter<TargetFieldName> = new EventEmitter();
  @Output() onLoadHistory: EventEmitter<CountryHistoryRequest> =
    new EventEmitter();

  @ViewChild('legendGrid') legendGrid: ElementRef;

  // country names mapped to pin offset
  pinnedCountries: IHash<number> = {};
  hiddenColumnRanges: IHash<IHash<Array<number>>> = {};
  hiddenColumnPinData: Array<Array<string>> = [[], [], []];
  hiddenSeriesSetData: Array<IHash<am4charts.LineSeries>> = [{}, {}, {}];

  public TargetSeriesSuffixes = TargetSeriesSuffixes;
  public seriesSuffixesFmt = [' (3D)', ' (hq)', ' (total)'];
  public seriesValueNames = Object.keys(TargetFieldName);
  public TargetFieldName = TargetFieldName;

  calculateColumnsEnabledCount(): void {
    this.columnsEnabledCount = [
      this.columnEnabled3D,
      this.columnEnabledHQ,
      this.columnEnabledALL
    ].filter((val: boolean) => !!val).length;
  }

  /** getCountrySeries
   * @param { string } country
   * @returns country mapped to the series suffix
   **/
  getCountrySeries(country: string): Array<am4charts.LineSeries> {
    const res = TargetSeriesSuffixes.map((seriesSuffix: string) => {
      return this.lineChart.allSeriesData[`${country}${seriesSuffix}`];
    }).filter((x) => {
      return x;
    });
    return res;
  }

  /** sortPins
   * sorts string array based on order of strings in separate array
   * @param { Array<string> } strings
   * @param { Array<string> } desiredOrder
   **/
  sortPins(strings: Array<string>, desiredOrder: Array<string>): void {
    desiredOrder = structuredClone(desiredOrder).reverse();
    strings.sort((a: string, b: string) => {
      const indexA = desiredOrder.indexOf(a);
      const indexB = desiredOrder.indexOf(b);
      if (indexA < indexB) {
        return 1;
      }
      if (indexA > indexB) {
        return -1;
      }
      return 0;
    });
  }

  /** showSeriesSet
   *
   * - calls show() on the series referenced in hiddenCountrySeries
   * - optionally pins the country associated with the series
   **/
  showSeriesSet(colIndex: number): void {
    const seriesSet = this.hiddenSeriesSetData[colIndex];
    const pinOrder = this.hiddenColumnPinData[colIndex];

    // re-enable pins
    Object.keys(seriesSet).forEach((country: string) => {
      seriesSet[country].show();
      if (!(country in this.pinnedCountries)) {
        this.togglePin(country, false, pinOrder);
      }
    });

    this.hiddenSeriesSetData[colIndex] = {};
    this.hiddenColumnPinData[colIndex] = [];
  }

  /** hideSeriesSet
   *
   * - stores the country/object in hiddenCountrySeries
   * - optionally unpins the series' associated country
   *
   * @param { TargetFieldName } setType - the type to hide
   **/
  hideSeriesSet(colIndex: number): void {
    const countries = Object.keys(this.pinnedCountries);

    countries.forEach((country: string) => {
      const countrySeriesKeys = TargetSeriesSuffixes.map((suffix: string) => {
        return `${country}${suffix}`;
      });

      const countrySeriesObjects = countrySeriesKeys.map((key: string) => {
        return this.lineChart.allSeriesData[key];
      });

      const targetSeries = countrySeriesObjects[colIndex];

      if (targetSeries && !targetSeries.isHidden) {
        targetSeries.hide();
        this.hiddenSeriesSetData[colIndex][country] = targetSeries;
        if (
          countrySeriesObjects.filter((item) => {
            return item && !item.isHidden;
          }).length === 1
        ) {
          this.hiddenColumnPinData[colIndex] = structuredClone(countries);
          this.togglePin(country, false);
        }
      }
    });
  }

  hideRangesByColumn(column?: TargetFieldName): void {
    const all = this.hiddenColumnRanges;
    Object.keys(this.pinnedCountries).forEach((country: string) => {
      const removed = this.lineChart.removeRange(country, column);
      Object.keys(removed).forEach((key: string) => {
        all[key] = Object.assign(all[key] ? all[key] : {}, removed[key]);
      });
    });
  }

  showHiddenRangesByColumn(column?: TargetFieldName): void {
    const hidden = this.hiddenColumnRanges;

    Object.keys(hidden)
      .filter((key: string) => {
        return column ? TargetFieldName[key] === column : true;
      })
      .forEach((targetFieldName: string) => {
        Object.keys(hidden[targetFieldName]).forEach((country: string) => {
          // get the range's colour
          const colour = this.lineChart.allSeriesData[
            country +
              TargetSeriesSuffixes[
                this.seriesValueNames.indexOf(targetFieldName)
              ]
          ].fill as am4core.Color;

          hidden[targetFieldName][country].forEach((index: number) => {
            this.lineChart.showRange(
              country,
              TargetFieldName[targetFieldName],
              index,
              colour
            );
          });
        });
        delete hidden[targetFieldName];
      });
  }

  /** resetChartColors
   * aligns the chart's internal color index with the visible series count
   **/
  resetChartColors(countryPinIndex?: number, seriesIndex?: number): void {
    if (countryPinIndex === undefined) {
      countryPinIndex = Object.keys(this.pinnedCountries).length;
    }
    const skips = countryPinIndex * 3 + (seriesIndex || 0);
    if (skips) {
      this.lineChart.chart.colors.reset();
      for (let i = 0; i < skips; i++) {
        this.lineChart.chart.colors.next();
      }
    }
  }

  /** toggleCountry
   * shows existing (hidden) data or loads and creates series
   * @param { string } country - the target series
   * @return boolean
   **/
  toggleCountry(country: string): void {
    const countrySeries = this.getCountrySeries(country);
    if (countrySeries.length === 0) {
      this.onLoadHistory.emit({
        country: country,
        fnCallback: (data: Array<TargetCountryData>) => {
          // append to existing countryData
          this.countryData[country] = this.countryData[country].concat(data);
          this.lineChart.sortSeriesData(data);

          // append to graph series data
          for (let i = 0; i < TargetSeriesSuffixes.length; i++) {
            this.lineChart.addSeriesData(
              country + TargetSeriesSuffixes[i],
              TargetFieldName[this.seriesValueNames[i]],
              data
            );
          }
          this.lineChart.chart.invalidateData();
        }
      });

      this.addSeriesSetAndPin(country, this.countryData[country]);
    } else {
      const hasVisible =
        countrySeries.filter((series: am4charts.LineSeries) => {
          return !series.isHidden;
        }).length > 0;

      if (hasVisible) {
        countrySeries.forEach((series: am4charts.LineSeries) => {
          series.hide();
        });
        // remove associated ranges
        this.lineChart.removeRange(country);
        this.togglePin(country);
      } else {
        countrySeries.forEach((series: am4charts.LineSeries) => {
          series.show();
        });
        this.togglePin(country);
      }
    }
  }

  addSeriesSetAndPin(country: string, data: Array<TargetData>): void {
    this.resetChartColors();

    // add pin
    this.togglePin(country);

    // add relevant series
    [this.columnEnabled3D, this.columnEnabledHQ, this.columnEnabledALL].forEach(
      (colEnabled: boolean, i: number) => {
        if (colEnabled) {
          this.lineChart.addSeries(
            country + this.seriesSuffixesFmt[i],
            country + TargetSeriesSuffixes[i],
            TargetFieldName[this.seriesValueNames[i]],
            data
          );
        }
      }
    );
  }

  toggleRange(
    country: string,
    type: TargetFieldName,
    index: number,
    colour?: am4core.Color
  ): void {
    if (colour) {
      this.lineChart.showRange(country, type, index, colour);
    } else {
      this.lineChart.removeRange(country, type, index);
    }
  }

  /** togglePin
   * pins or unpins an item, maintaining pinnedCountries
   * and the order of targetCountries
   * @param { string } country - the country to (un)pin
   * @param { boolean } purgePinData - flag pin data deletion
   **/
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

    // re-assign pin keys
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

    // re-assign pin values
    Object.keys(this.pinnedCountries).forEach((key: string, i: number) => {
      this.pinnedCountries[key] = i * LegendGridComponent.itemHeight;
    });

    // re-order targetCountries, putting the pinned items first
    this.targetCountries = Object.keys(this.pinnedCountries).concat(
      this.targetCountriesOO.filter((country: string) => {
        return !(country in this.pinnedCountries);
      })
    );
  }

  gridScroll(): void {
    const el = this.legendGrid.nativeElement;
    const sh = el.scrollHeight;
    const h = el.getBoundingClientRect().height;
    const st = el.scrollTop;
    const canScrollDown = sh > st + h + 1;
    el.classList.toggle('scrollable-downwards', canScrollDown);
  }

  /** toggleSeries
   * loads a series if it hasn't been loaded and toggles its display
   * @param { string }
   * @param { string }
   * @param { LineSeries }
   **/
  toggleSeries(
    country: string,
    type: TargetFieldName,
    series?: am4charts.LineSeries
  ): void {
    const typeIndex = Object.values(TargetFieldName).indexOf(type);

    if (!series) {
      // create from existing data

      const visibleSiblingCount = this.getCountrySeries(country).filter(
        (series: am4charts.LineSeries) => {
          return !series.isHidden;
        }
      ).length;

      let countryPinIndex: number = undefined;

      if (visibleSiblingCount > 0) {
        countryPinIndex = Object.keys(this.pinnedCountries).indexOf(country);
      }
      this.resetChartColors(countryPinIndex, typeIndex);
      this.lineChart.addSeries(
        country + this.seriesSuffixesFmt[typeIndex],
        country + TargetSeriesSuffixes[typeIndex],
        TargetFieldName[this.seriesValueNames[typeIndex]],
        this.countryData[country]
      );
      if (visibleSiblingCount === 0) {
        this.togglePin(country);
      }
    } else if (series.isHidden) {
      series.show();
      if (!(country in this.pinnedCountries)) {
        this.togglePin(country);
      }
    } else {
      series.hide();
      // remove associated ranges
      this.lineChart.removeRange(country, type);

      let visCount = 0;
      TargetSeriesSuffixes.forEach((suffix: string) => {
        const sd = this.lineChart.allSeriesData[country + suffix];
        if (sd && !sd.isHidden) {
          visCount += 1;
        }
      });
      // we can unpin (it will be 0 on animation completion)
      if (visCount === 1) {
        this.togglePin(country);
      }
    }
  }

  /** fireUnpinColumn
   *
   *  invokes emit unpinColumn
   * @param { TargetFieldName } column
   ***/
  fireUnpinColumn(column: TargetFieldName): void {
    this.unpinColumn.emit(column);
  }
}

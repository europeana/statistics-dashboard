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
  IHash,
  IHashArray,
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
    } else {
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
    } else {
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
    } else {
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
      this.toggleRange(
        this.countryCode,
        TargetFieldName.THREE_D,
        0,
        this.lineChart.chart.colors.getIndex(0)
      );
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
  @ViewChild('legendGrid') legendGrid: ElementRef;

  // country names mapped to pin offset
  pinnedCountries: IHash<number> = {};
  hiddenSeriesSetData: Array<IHash<IHash<Array<am4charts.LineSeries>>>> = [
    {},
    {},
    {}
  ];
  /*
    - has prevPins  // TODO

    - restoring the pin order:
  	- record previous pins
  	- look up dependency graph when restoring
  	- full rewrite of toggleCountry() needed

        - because this breaks UI state maintenance

        - colour maintenance...
  */

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

  /** showSeriesSet
   *
   * - calls show() on the series referenced in hiddenCountrySeries
   * - optionally pins the country associated with the series
   **/
  showSeriesSet(colIndex: number): void {
    Object.keys(this.hiddenSeriesSetData[colIndex]).forEach(
      (country: string) => {
        this.hiddenSeriesSetData[colIndex][country].series.forEach(
          (series: am4charts.LineSeries) => {
            series.show();
          }
        );
        if (!(country in this.pinnedCountries)) {
          this.togglePin(country);
        }
      }
    );
    this.hiddenSeriesSetData[colIndex] = {};
  }

  /** hideSeriesSet
   *
   * - hides any 'total' series stores the country/object in hiddenCountrySeries
   * - optionally unpins the series' associated country
   *
   * @param { TargetFieldName } setType - the type to hide
   **/
  hideSeriesSet(colIndex: number): void {
    Object.keys(this.pinnedCountries).forEach((country: string) => {
      const countrySeriesKeys = TargetSeriesSuffixes.map((suffix: string) => {
        return `${country}${suffix}`;
      });

      const countrySeriesData = countrySeriesKeys.map((key: string) => {
        return this.lineChart.allSeriesData[key];
      });

      if (
        countrySeriesData[colIndex] &&
        !countrySeriesData[colIndex].isHidden
      ) {
        this.hiddenSeriesSetData[colIndex][country] = { series: [] };
        this.hiddenSeriesSetData[colIndex][country].series.push(
          countrySeriesData[colIndex]
        );

        countrySeriesData[colIndex].hide();
        this.lineChart.removeRange(
          country,
          TargetFieldName[this.seriesValueNames[colIndex]]
        );

        let hasOtherVisible = false;
        for (let i = 0; i < 3; i++) {
          if (
            i !== colIndex &&
            countrySeriesData[i] &&
            !countrySeriesData[i].isHidden
          ) {
            hasOtherVisible = true;
          }
        }
        if (!hasOtherVisible) {
          this.togglePin(country);
        }
      }
    });
  }

  /** resetChartColors
   * aligns the chart's internal color index with the visible series count
   **/
  resetChartColors(): void {
    const data = this.lineChart.allSeriesData;
    let openCount = 0;

    Object.keys(data).forEach((key: string) => {
      const isHidden = this.lineChart.allSeriesData[key].isHidden;
      if (!isHidden) {
        openCount += 1;
      }
    });

    this.lineChart.chart.colors.reset();
    for (
      let i = 0;
      i < openCount % this.lineChart.chart.colors.list.length;
      i++
    ) {
      this.lineChart.chart.colors.next();
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
   **/
  togglePin(country: string): void {
    if (country in this.pinnedCountries) {
      // delete and re-assign existing pin values
      delete this.pinnedCountries[country];
      Object.keys(this.pinnedCountries).forEach((key: string, i: number) => {
        this.pinnedCountries[key] = i * LegendGridComponent.itemHeight;
      });
    } else {
      // add new pin
      this.pinnedCountries[country] =
        Object.keys(this.pinnedCountries).length *
        LegendGridComponent.itemHeight;
    }

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
      this.resetChartColors();
      const visibleSiblings = this.getCountrySeries(country).filter(
        (series: am4charts.LineSeries) => {
          return !series.isHidden;
        }
      );

      this.lineChart.addSeries(
        country + this.seriesSuffixesFmt[typeIndex],
        country + TargetSeriesSuffixes[typeIndex],
        TargetFieldName[this.seriesValueNames[typeIndex]],
        this.countryData[country]
      );

      if (visibleSiblings.length === 0) {
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

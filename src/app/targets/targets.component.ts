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
  ViewChild
} from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import {
  IHash,
  IHashArray,
  TargetData,
  TemporalDataItem,
  TemporalLocalisedDataItem
} from '../_models';
import { APIService } from '../_services';
import { RenameCountryPipe, RenameTargetTypePipe } from '../_translate';
import { LineComponent } from '../chart';
import { SubscriptionManager } from '../subscription-manager';

@Component({
  selector: 'app-targets',
  templateUrl: './targets.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./targets.component.scss'],
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
export class TargetsComponent extends SubscriptionManager {
  targetCountries: Array<string>;
  targetCountriesOO: Array<string>;
  targetData: IHash<IHashArray<TargetData>>;
  countryData: IHash<Array<TemporalDataItem>> = {};
  pinnedCountries: IHash<number> = {};

  public seriesSuffixes = ['total', '3D', 'META_A'];
  public seriesSuffixesFmt = [' (total)', ' (3D)', ' (meta tier A)'];
  public seriesValueNames = ['total', 'three_d', 'meta_tier_a'];

  @ViewChild('lineChart') lineChart: LineComponent;
  @ViewChild('legendGrid') legendGrid: ElementRef;

  constructor(private readonly api: APIService) {
    super();

    this.subs.push(
      this.api
        .loadCountryData()
        .subscribe((countryData: Array<TemporalLocalisedDataItem>) => {
          this.countryData = countryData.reduce(
            (
              res: IHash<Array<TemporalDataItem>>,
              item: TemporalLocalisedDataItem
            ) => {
              if (!res[item.country]) {
                res[item.country] = [];
              }
              const { country, ...itemNoCountry } = item;
              res[country].push(itemNoCountry);
              return res;
            },
            {}
          );
        })
    );

    this.subs.push(
      this.api.getTargetData().subscribe((targetData) => {
        this.targetData = targetData;
        this.targetCountries = Object.keys(targetData);
        this.targetCountriesOO = Object.keys(targetData);
      })
    );
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.toggleCountry('DE');
    }, 0);
  }

  getCountrySeries(country: string): Array<am4charts.LineSeries> {
    const res = this.seriesSuffixes
      .map((seriesSuffix: string) => {
        return this.lineChart.allSeriesData[`${country}${seriesSuffix}`];
      })
      .filter((x) => {
        return x;
      });
    return res;
  }

  toggleCursor(): void {
    this.lineChart.toggleCursor();
  }

  toggleGridlines(): void {
    this.lineChart.toggleGridlines();
  }

  toggleScrollbar(): void {
    this.lineChart.toggleScrollbar();
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
        // should create missinf...

        countrySeries.forEach((series: am4charts.LineSeries) => {
          series.show();
        });
        this.togglePin(country);
      }
    }
  }

  addSeriesSetAndPin(
    country: string,
    data: Array<TemporalDataItem>
    //    specificSeriesTypeIndex?: number
  ): void {
    this.resetChartColors();

    // add pin and series
    this.togglePin(country);

    // loop the types
    [...Array(3).keys()].forEach((i: number) => {
      this.lineChart.addSeries(
        country + this.seriesSuffixesFmt[i],
        country + this.seriesSuffixes[i],
        this.seriesValueNames[i],
        data
      );
    });
  }

  removeRange(country: string, type: string, index: number): void {
    this.lineChart.removeRange(country, type, index);
  }

  /** togglePin
   * pins or unpins an item, maintaining pinnedCountries
   * and the order of targetCountries
   * @param { string } country - the country to (un)pin
   **/
  togglePin(country: string): void {
    const itemHeight = 84.5;

    if (country in this.pinnedCountries) {
      // delete and re-assign existing pin values
      delete this.pinnedCountries[country];
      Object.keys(this.pinnedCountries).forEach((key: string, i: number) => {
        this.pinnedCountries[key] = i * itemHeight;
      });
    } else {
      // add new pin
      this.pinnedCountries[country] =
        Object.keys(this.pinnedCountries).length * itemHeight;
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
    type: string,
    series?: am4charts.LineSeries
  ): void {
    const typeIndex = this.seriesValueNames.indexOf(type);

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
        country + this.seriesSuffixes[typeIndex],
        this.seriesValueNames[typeIndex],
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
      this.seriesSuffixes.forEach((suffix: string) => {
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
}

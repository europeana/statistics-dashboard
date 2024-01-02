import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  NgZone,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import {
  ChartSettings,
  ColourSeriesData,
  IHash,
  NameValue
} from '../../_models';

import { colours } from '../../_data';

import { BarChartDefaults } from '../chart-defaults';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements AfterViewInit {
  private chart: am4charts.XYChart;
  readonly maxNumberBars = 50;
  preferredNumberBars = 8;
  maxBarSizeRelativeRatio = 20;

  _results?: Array<NameValue>;
  categoryAxis: am4charts.CategoryAxis;

  allSeries: { [key: string]: am4charts.ColumnSeries } = {};
  series: am4charts.ColumnSeries;

  settings = structuredClone(BarChartDefaults);
  valueAxis: am4charts.ValueAxis;

  @Input() chartId = 'barChart';
  @Input() showPercent: boolean;
  @Input() set results(results: Array<NameValue>) {
    // empty setter forces it to be ready before AfterViewInit
    this._results = results;
  }
  get results(): Array<NameValue> {
    return this._results;
  }
  @Input() set extraSettings(extraSettings: ChartSettings) {
    this.settings = { ...this.settings, ...extraSettings };
  }
  get extraSettings(): ChartSettings {
    return this.settings;
  }

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId,
    private readonly zone: NgZone
  ) {
    this.browserOnly(() => {
      am4core.options.autoDispose = true;
    });
  }

  /** browserOnly
  /* function-wrapping function for running outside Angular
  /* (this exempts the chart from change detection)
  */
  browserOnly(f: () => void): void {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular((): void => {
        f();
      });
    }
  }

  /** ngAfterViewInit
  /* Event hook: calls drawChart and generates a series for the declarative use case
  */
  ngAfterViewInit(): void {
    this.drawChart();
    this.addSeriesFromResult();
  }

  addSeriesFromResult(): void {
    if (this.results) {
      this.addSeries([
        {
          data: this.results.reduce(function (
            map: IHash<number>,
            nv: NameValue
          ) {
            map[nv.name] = nv.value;
            return map;
          },
          {}),
          colour: colours[0],
          seriesName: 'seriesKey'
        } as ColourSeriesData
      ]);
    }
  }

  /** toggleCtrls
  /* Template utility for showing / hiding control panel
  */
  toggleCtrls(): void {
    this.settings.ctrlsOpen = !this.settings.ctrlsOpen;
  }

  /** roundUpNumber
  /* Rounds up the number
  /*
  /* @param { number } num - the number to round
  /* @returns number
  */
  roundUpNumber(num: number): number {
    return Math.ceil(num / 10) * 10;
  }

  /** addAxisBreak
  /* Adds an axis break
  /*
  /* @param { number } seriesMin - the smallest value in the series
  /* @param { number } seriesMax - the largest value in the series
  */
  addAxisBreak(seriesMin: number, seriesMax: number): void {
    const diff = seriesMax - seriesMin;
    const chunkToRemove = diff - this.maxBarSizeRelativeRatio * seriesMin;
    this.valueAxis.min = 0;
    this.valueAxis.max = this.roundUpNumber(seriesMax);
    this.valueAxis.strictMinMax = true;

    const axisBreak = this.valueAxis.axisBreaks.create();
    axisBreak.startValue = (seriesMax - chunkToRemove) / 2;
    axisBreak.endValue = seriesMax - axisBreak.startValue;

    const d = (axisBreak.endValue - axisBreak.startValue) / diff;
    axisBreak.breakSize = (0.075 * (1 - d)) / d; // 0.075 means that the break will take 7.5% of the total value axis height

    // make break expand on hover
    const hoverState = axisBreak.states.create('hover');
    hoverState.properties.breakSize = 1;
    hoverState.properties.opacity = 0.1;
    hoverState.transitionDuration = 1500;

    axisBreak.defaultState.transitionDuration = 1000;
  }

  removeSeries(id: string): void {
    const series = this.allSeries[id];

    if (series) {
      const seriesIndex = this.chart.series.indexOf(series);
      if (seriesIndex > -1) {
        this.chart.series.removeIndex(seriesIndex).dispose();
      }
      delete this.allSeries[id];
    } else {
      console.log(`Bar: can't find series to remove (${id})`);
    }
    this.chart.invalidateData();
  }

  removeAllSeries(): void {
    Object.keys(this.allSeries).forEach((id: string) => {
      this.removeSeries(id);
    });
  }

  /** addSeries
  /*
  /* creates chart.data if it doesn't exist
  /* adds series data to the chart data
  /* adds series object to the chart / the allSeries track-map
  /*
  /* @param { Array<ColourSeriesData> } csds - series info
   */
  addSeries(csds: Array<ColourSeriesData>): void {
    let anySeries;
    const seriesVals = [];

    csds.forEach((csd: ColourSeriesData) => {
      if (!this.chart.data.length) {
        this.chart.data = Object.keys(csd.data)
          .slice(0, this.maxNumberBars)
          .map((s: string) => {
            const res = { name: s };
            res[csd.seriesName] = csd.data[s];
            seriesVals.push(csd.data[s]);
            return res;
          });
      } else {
        this.chart.data.forEach((cd: IHash<number>) => {
          seriesVals.push(csd.data[cd.name]);
          cd[csd.seriesName] = csd.data[cd.name];
        });
      }

      anySeries = this.createSeries(csd.colour, csd.seriesName);
      this.allSeries[csd.seriesName] = anySeries;
    });

    if (anySeries && this.settings.hasScroll && this.isZoomable()) {
      anySeries.events.on('ready', (): void => {
        const fn = (): void => {
          const customiseGrip = (grip): void => {
            grip.icon.disabled = true;
            grip.background.fill = am4core.color('#0a72cc');
            grip.background.fillOpacity = 0.8;
          };
          this.chart.scrollbarY = new am4core.Scrollbar();
          customiseGrip(this.chart.scrollbarY.startGrip);
          customiseGrip(this.chart.scrollbarY.endGrip);

          this.chart.scrollbarY.background.fill = am4core.color('#0a72cc');
          this.chart.scrollbarY.background.fillOpacity = 0.1;

          this.chart.scrollbarY.thumb.background.fill =
            am4core.color('#0a72cc');
          this.chart.scrollbarY.thumb.background.fillOpacity = 0.2;
        };
        setTimeout(fn, 0);
      });
    }

    if (!this.isZoomable()) {
      const seriesMin = Math.min(...seriesVals);
      const seriesMax = Math.max(...seriesVals);
      const scale = seriesMax / seriesMin;
      if (scale > this.maxBarSizeRelativeRatio) {
        this.addAxisBreak(seriesMin, seriesMax);
      }
    }
    this.chart.invalidateData();
  }

  /** createSeries
   * - instantiates and returns a series
   *
   * @param { string } colour - the series bar colour
   * @param { string } valueField - the field to read
   */
  createSeries(colour: string, valueField = 'value'): am4charts.ColumnSeries {
    const series = this.chart.series.push(new am4charts.ColumnSeries());
    const labelSuffix = this.showPercent ? '%' : '';

    series.columns.template.events.once('inited', function (event) {
      event.target.fill = am4core.color(colour);
    });

    if (this.settings.isHorizontal) {
      series.dataFields.valueX = valueField;
      series.dataFields.categoryY = 'name';
      series.columns.template.tooltipText = `{categoryY}: [bold]{valueX}[/]${labelSuffix}`;
    } else {
      series.dataFields.valueY = valueField;
      series.dataFields.categoryX = 'name';
      series.columns.template.tooltipText = `{categoryX}: [bold]{valueY}[/]${labelSuffix}`;
    }
    series.columns.template.fillOpacity = 1;
    series.columns.template.strokeWidth = 0;
    return series;
  }

  isZoomable(): boolean {
    return this.chart.data && this.chart.data.length > this.preferredNumberBars;
  }

  zoomTop(start = 0): void {
    if (this.isZoomable()) {
      const fn = (): void => {
        this.categoryAxis.zoomToIndexes(
          start,
          start + this.preferredNumberBars,
          false,
          true
        );
      };
      setTimeout(fn, 100);
    }
  }

  getSvgData(): Promise<string> {
    this.chart.exporting.useWebFonts = false;
    return this.chart.exporting.getImage('png', {
      minHeight: 1000,
      minWidth: 1000
    });
  }

  /** applyPadding
   * - applies padding settings to the chart
   */
  applyPadding(): void {
    ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop'].forEach(
      (s: string) => {
        if (!isNaN(this.settings[s])) {
          this.chart[s] = this.settings[s];
        }
      }
    );
  }

  /** applyRendererDefaults
   * - applies settings to category / value axis renderers
   */
  applyRendererDefaults(): void {
    // force show all labels
    this.categoryAxis.renderer.minGridDistance = 30;

    // disable grid lines
    this.categoryAxis.renderer.grid.template.disabled = true;
    this.valueAxis.renderer.grid.template.disabled = true;

    // axis / tick styling
    this.categoryAxis.renderer.ticks.template.disabled = false;
    this.categoryAxis.renderer.ticks.template.strokeOpacity = 1;
    this.categoryAxis.renderer.ticks.template.stroke = am4core.color('#CCC');
    this.categoryAxis.renderer.ticks.template.strokeWidth = 1;
    this.categoryAxis.renderer.ticks.template.length = 9;

    // labels
    this.categoryAxis.renderer.labels.template.maxWidth =
      this.settings.maxLabelWidth;
    this.categoryAxis.renderer.labels.template.truncate =
      this.settings.labelTruncate;
    this.categoryAxis.renderer.labels.template.wrap = this.settings.labelWrap;

    this.categoryAxis.renderer.labels.template.fontSize = 10;
    this.categoryAxis.renderer.labels.template.fontWeight = '600';
    this.categoryAxis.renderer.labels.template.marginRight = 9;
    this.categoryAxis.renderer.labels.template.fill = am4core.color('#4D4D4D');
    this.valueAxis.renderer.labels.template.fontSize = 12;
    this.valueAxis.renderer.labels.template.fill = am4core.color('#4D4D4D');

    this.categoryAxis.renderer.labels.template.adapter.add(
      'text',
      (label: string) => {
        let prefix = '';
        if (this.settings.prefixValueAxis) {
          prefix = `${this.settings.prefixValueAxis} `;
        }
        return `${prefix}${label}`;
      }
    );

    this.valueAxis.renderer.labels.template.adapter.add(
      'text',
      (label: string) => {
        return `${label}${this.showPercent ? '%' : ''}`;
      }
    );
  }

  /** drawChart
   * - instantiates chart and axes according to rotation
   * - assigns data
   * - invokes series and settings functions
   */
  drawChart(zoomIndex?: number): void {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      this.chart = am4core.create(this.chartId, am4charts.XYChart);
      const chart = this.chart;

      if (typeof zoomIndex !== 'undefined') {
        this.chart.events.on('ready', () => {
          this.zoomTop(zoomIndex);
        });
      }

      this.applyPadding();

      // Create axes
      this.categoryAxis = new am4charts.CategoryAxis();
      this.valueAxis = new am4charts.ValueAxis();

      this.valueAxis.numberFormatter = new am4core.NumberFormatter();
      this.valueAxis.numberFormatter.numberFormat = this.showPercent
        ? '#.'
        : '#.0a';

      this.categoryAxis.dataFields.category = 'name';

      if (this.settings.isHorizontal) {
        chart.yAxes.push(this.categoryAxis);
        chart.xAxes.push(this.valueAxis);
        this.categoryAxis.renderer.inversed = true;
        this.valueAxis.paddingRight = 25;
      } else {
        chart.xAxes.push(this.categoryAxis);
        chart.yAxes.push(this.valueAxis);

        if (this.settings.hasScroll) {
          chart.scrollbarX = new am4core.Scrollbar();
        }

        // Label / rotation
        this.categoryAxis.renderer.labels.template.horizontalCenter = 'right';
        this.categoryAxis.renderer.labels.template.verticalCenter = 'middle';
        this.categoryAxis.renderer.labels.template.rotation = 270;
      }

      this.applyRendererDefaults();
    });
  }
}

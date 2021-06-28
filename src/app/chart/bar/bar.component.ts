import { Component, Inject, Input, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { ChartSettings, ColourSeriesData, NameValue } from '../../_models';

import { BarChartDefaults } from '../chart-defaults';

interface CustomLegendItem {
  name: 'string';
  fill: 'string';
  customData: { hide(): void; show(): void };
}

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent {
  private chart: am4charts.XYChart;
  _results: Array<NameValue>;
  categoryAxis: am4charts.CategoryAxis;
  colours = ['#0a72cc']; // TODO import from data file
  legendContainer: am4core.Container;
  preferredNumberBars = 15;

  allSeries: { [key: string]: am4charts.ColumnSeries } = {};
  series: am4charts.ColumnSeries;

  settings = Object.assign({}, BarChartDefaults);
  valueAxis: am4charts.ValueAxis;

  @Input() chartId = 'barChart';
  @Input() showPercent: boolean;
  @Input() set results(results: Array<NameValue>) {
    this._results = results;
    if (this.chart) {
      this.chart.data = this._results;
      this.drawChart();
    }
  }
  @Input() set extraSettings(extraSettings: ChartSettings) {
    this.settings = Object.assign(this.settings, extraSettings);
  }

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) {
    am4core.options.autoDispose = true;
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
  /* Event hook: calls drawChart
  */
  ngAfterViewInit(): void {
    this.drawChart();
  }

  /** toggleCtrls
  /* Template utility for showing / hiding control panel
  */
  toggleCtrls(): void {
    this.settings.ctrlsOpen = !this.settings.ctrlsOpen;
  }

  /** addLegend
  /* - create legend and legendContainer
  /* - create custom items from series
  /* - add event handling for resize / click
  */
  addLegend(): void {
    const legendId = 'barLegend';
    let seriesReady = false;

    this.chart.legend = new am4charts.Legend();

    const legend = this.chart.legend;
    const series = this.series;

    this.legendContainer = am4core.create(legendId, am4core.Container);
    this.legendContainer.width = am4core.percent(100);
    this.legendContainer.height = am4core.percent(100);
    legend.parent = this.legendContainer;

    legend.itemContainers.template.events.on(
      'hit',
      function (ev: { type: 'hit'; target: am4core.Container }) {
        const context = ev.target.dataItem.dataContext as CustomLegendItem;
        if (!ev.target.isActive) {
          context.customData.hide();
        } else {
          context.customData.show();
        }
      }
    );

    const resizeLegend = (): void => {
      if (legend.appeared && seriesReady) {
        const el = document.getElementById(legendId);
        if (el) {
          el.style.height = `${legend.contentHeight}px`;
        }
      }
    };

    this.chart.events.on('datavalidated', () => {
      resizeLegend();
      console.log('datavalidated ever called???');
    });

    legend.events.on('datavalidated', resizeLegend);
    this.chart.events.on('maxsizechanged', resizeLegend);
    legend.events.on('maxsizechanged', resizeLegend);

    series.events.on('ready', (): void => {
      seriesReady = true;
      const legenddata = [];
      const xyTarget = this.settings.isHorizontal ? 'categoryY' : 'categoryX';

      series.columns.each(function (column) {
        legenddata.push({
          name: column.dataItem[xyTarget],
          fill: column.fill,
          customData: column.dataItem
        });
      });
      legend.data = legenddata;
    });
  }

  /** applySettings
  /* - updates chart variables according to inputs
  /* @param { boolean: force } - flag whether to invoke drawChart function
  */
  applySettings(force = false): void {
    if (force) {
      this.drawChart();
      return;
    }

    this.categoryAxis.renderer.labels.template.maxWidth =
      this.settings.maxLabelWidth;
    this.categoryAxis.renderer.labels.template.truncate =
      this.settings.labelTruncate;
    this.categoryAxis.renderer.labels.template.wrap = this.settings.labelWrap;
  }

  removeSeries(id: string): void {
    const series = this.allSeries[id];
    if (series) {
      this.chart.series
        .removeIndex(this.chart.series.indexOf(series))
        .dispose();
      delete this.allSeries[id];
    } else {
      console.log(`can't find series to remove (${id})`);
    }
    this.chart.invalidateData();
  }

  addSeries(csds: Array<ColourSeriesData>): void {
    csds.forEach((csd: ColourSeriesData) => {
      const series = this.createSeries([csd.colour], csd.seriesName);
      this.allSeries[csd.seriesName] = series;

      // TODO: make this possible for percentages, i.e. this.chart.dataPercent.forEach(...)

      this.chart.data.forEach((cd) => {
        cd[csd.seriesName] = csd.data[cd.name];
      });
    });

    this.chart.invalidateData();
  }

  /** createSeries
  /* - instantiates series class
  /* - build colour model
  */
  createSeries(
    colours: Array<string>,
    valueField = 'value'
  ): am4charts.ColumnSeries {
    const series = this.chart.series.push(new am4charts.ColumnSeries());
    const labelSuffix = this.showPercent ? '%' : '';

    series.columns.template.events.once('inited', function (event) {
      event.target.fill = am4core.color(
        colours[event.target.dataItem.index % colours.length]
      );
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
    return series;
  }

  zoomTop(): void {
    if (this._results.length > this.preferredNumberBars) {
      this.categoryAxis.zoomToIndexes(1, this.preferredNumberBars, false, true);
    }
  }

  getSvgData(): Promise<string> {
    this.chart.exporting.useWebFonts = false;
    return this.chart.exporting.getImage('png');
  }

  /** drawChart
  /* - instantiates chart and axes according to rotation
  /* - assigns data
  /* - invokes series, legend and settings functions
  */
  drawChart(): void {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      this.chart = am4core.create(this.chartId, am4charts.XYChart);
      const chart = this.chart;

      this.chart.events.on('ready', () => {
        this.zoomTop();
      });

      ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop'].forEach(
        (s: string) => {
          if (this.settings[s]) {
            chart[s] = this.settings[s];
          }
        }
      );

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

        this.series = this.createSeries(this.colours);

        if (this.settings.hasScroll) {
          if (this._results.length > this.preferredNumberBars) {
            chart.scrollbarY = new am4core.Scrollbar();
          }
        }
        this.valueAxis.paddingRight = 25;
      } else {
        chart.xAxes.push(this.categoryAxis);
        chart.yAxes.push(this.valueAxis);

        this.series = this.createSeries(this.colours);

        if (this.settings.hasScroll) {
          chart.scrollbarX = new am4core.Scrollbar();
        }

        // Label / rotation
        this.categoryAxis.renderer.labels.template.horizontalCenter = 'right';
        this.categoryAxis.renderer.labels.template.verticalCenter = 'middle';
        this.categoryAxis.renderer.labels.template.rotation = 270;
      }

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

      this.categoryAxis.renderer.labels.template.fontSize = 12;
      this.categoryAxis.renderer.labels.template.fontWeight = '600';
      this.categoryAxis.renderer.labels.template.marginRight = 9;
      this.categoryAxis.renderer.labels.template.fill =
        am4core.color('#4D4D4D');
      this.valueAxis.renderer.labels.template.fontSize = 12;
      this.valueAxis.renderer.labels.template.fill = am4core.color('#4D4D4D');

      this.chart.data = this._results;

      // TODO: remove this adapter when we're not using a prefix
      if (this.settings.prefixValueAxis) {
        this.categoryAxis.renderer.labels.template.adapter.add(
          'text',
          (label: string) => {
            return `${this.settings.prefixValueAxis} ${label}`;
          }
        );
      }

      if (this.showPercent) {
        this.valueAxis.renderer.labels.template.adapter.add(
          'text',
          (label: string) => {
            return `${label}%`;
          }
        );
      }

      if (this.settings.chartLegend) {
        this.addLegend();
      }
      this.applySettings();
    });

    // this has to be outside browserOnly()
    if (this.settings.showExports) {
      this.chart.exporting.menu = new am4core.ExportMenu();
      this.chart.exporting.menu.align = 'right';

      const legendContainer = this.legendContainer;

      if (legendContainer) {
        this.chart.exporting.extraSprites.push({
          sprite: legendContainer,
          position: 'bottom',
          marginTop: 20
        });
      }
    }
  }
}

import { Component, Inject, Input, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4plugins_sliceGrouper from '@amcharts/amcharts4/plugins/sliceGrouper';

import { NameValue } from '../../_models';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent {
  chart: am4charts.PieChart;
  pieSeries: am4charts.PieSeries;
  _results: Array<NameValue>;
  legendContainer: am4core.Container;

  // controls

  ctrlsOpen = false;
  alignLabels = false;
  bendLabels = false;
  chartLegend = true;
  groupOther = true;
  useThreshold = false;
  groupThreshold = 2;
  groupLimit = 10;
  chartRadius = 70;
  isRadial = true;
  labelCutoffPercent = 1.5;
  labelsRadius = 15;
  labelTruncate = true;
  labelWrap = false;
  legendExternal = true;
  legendPosition = 'bottom';
  rotateLabels = false;
  showExports = true;
  showTotals = true;
  chartRadiusInner = this.showTotals ? 40 : 0;
  tooltipTruncate = false;
  tooltipWrap = true;
  maxLabelWidth = 250;
  maxTooltiptWidth = 250;

  @Input() colours: Array<string>;
  @Input() set results(results: Array<NameValue>) {
    this._results = results;
    this.updateData();
  }

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) {
    am4core.options.autoDispose = true;
  }

  ngAfterViewInit(): void {
    this.drawChart();
  }

  // Run the function only in the browser / (exempt rendering from change detection)
  browserOnly(f: () => void): void {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular((): void => {
        f();
      });
    }
  }

  toggleCtrls(): void {
    this.ctrlsOpen = !this.ctrlsOpen;
  }

  updateData(): void {
    if (!this.chart) {
      return;
    }
    // hide the small slices
    const labelCutoffPercent = this.labelCutoffPercent;
    const hideSmall = (ev): void => {
      if (
        ev.target.dataItem &&
        ev.target.dataItem.values.value.percent < labelCutoffPercent
      ) {
        ev.target.hide();
      } else {
        ev.target.show();
      }
    };

    this.pieSeries.ticks.template.events.on('ready', hideSmall);
    this.pieSeries.ticks.template.events.on('visibilitychanged', hideSmall);
    this.pieSeries.labels.template.events.on('ready', hideSmall);
    this.pieSeries.labels.template.events.on('visibilitychanged', hideSmall);

    // total
    if (this.showTotals) {
      this.chart.seriesContainer.zIndex = -1;
      this.chart.innerRadius = am4core.percent(this.chartRadiusInner);
      const container = new am4core.Container();
      container.parent = this.pieSeries;
      container.horizontalCenter = 'middle';
      container.verticalCenter = 'middle';
      container.fill = am4core.color('#FFF');

      const totalLabel = new am4core.Label();
      totalLabel.parent = container;
      totalLabel.text = '{values.value.sum}';
      totalLabel.horizontalCenter = 'middle';
      totalLabel.verticalCenter = 'middle';
      totalLabel.fontSize = 30;

      this.chart.events.on('sizechanged', () => {
        let scale =
          (this.pieSeries.pixelInnerRadius * 2) / totalLabel.bbox.width;
        if (scale > 1) {
          scale = 1;
        }
        totalLabel.scale = scale;
      });
    }
    this.chart.data = this._results;
  }

  applySettings(force = false): void {
    if (force) {
      this.cleanup();
      this.drawChart();
      return;
    }

    this.chart.radius = am4core.percent(this.chartRadius);
    if (!this.showTotals) {
      this.chart.innerRadius = am4core.percent(this.chartRadiusInner);
    }

    if (this.chartLegend) {
      if (this.chart.legend) {
        this.chart.legend.dispose();
      }
      this.chart.legend = new am4charts.Legend();
      if (this.legendExternal) {
        const legend = this.chart.legend;
        const legendId = 'legend';
        this.legendContainer = am4core.create(legendId, am4core.Container);

        this.legendContainer.width = am4core.percent(100);
        this.legendContainer.height = am4core.percent(100);

        legend.parent = this.legendContainer;

        const resizeLegend = (): void => {
          const el = document.getElementById(legendId);
          if (el) {
            el.style.height = legend.contentHeight + 'px';
          }
        };
        this.chart.events.on('datavalidated', resizeLegend);
        this.chart.events.on('maxsizechanged', resizeLegend);
        legend.events.on('datavalidated', resizeLegend);
        legend.events.on('maxsizechanged', resizeLegend);
      } else {
        this.chart.legend.position = this
          .legendPosition as am4maps.LegendPosition;
      }
    }

    if (this.rotateLabels) {
      this.pieSeries.labels.template.relativeRotation = 90;
    }

    this.pieSeries.alignLabels = this.alignLabels;
    this.pieSeries.labels.template.bent = this.bendLabels;
    this.pieSeries.labels.template.radius = am4core.percent(this.labelsRadius);

    this.pieSeries.labels.template.maxWidth = this.maxLabelWidth;
    this.pieSeries.labels.template.truncate = this.labelTruncate;
    this.pieSeries.labels.template.wrap = this.labelWrap;

    this.pieSeries.tooltip.label.maxWidth = this.maxTooltiptWidth;
    this.pieSeries.tooltip.label.truncate = this.tooltipTruncate;
    this.pieSeries.tooltip.label.wrap = this.tooltipWrap;
  }

  drawChart(): void {
    this.browserOnly((): void => {
      am4core.useTheme(am4themes_animated);

      this.chart = am4core.create('pie', am4charts.PieChart);
      this.pieSeries = this.chart.series.push(new am4charts.PieSeries());

      if (this.isRadial) {
        const rgm = new am4core.RadialGradientModifier();
        rgm.brightnesses.push(-0.8, -0.8, -0.5, 0, -0.5);
        this.pieSeries.slices.template.fillModifier = rgm;
        this.pieSeries.slices.template.strokeModifier = rgm;
        this.pieSeries.slices.template.strokeWidth = 0;
      }

      const pieSeries = this.pieSeries;
      const colours = this.colours;

      if (this.groupOther) {
        const grouper = pieSeries.plugins.push(
          new am4plugins_sliceGrouper.SliceGrouper()
        );
        grouper.clickBehavior = 'zoom';
        grouper.groupName = 'Other';
        grouper.syncLegend = true;
        if (this.useThreshold) {
          grouper.threshold = this.groupThreshold;
        } else {
          grouper.limit = this.groupLimit;
        }
      }

      //chart.legend.valueLabels.template.text = '{value.value}';

      pieSeries.dataFields.value = 'value';
      pieSeries.dataFields.category = 'name';

      this.pieSeries.slices.template.events.once('inited', function (event) {
        event.target.fill = am4core.color(
          colours[event.target.dataItem.index % colours.length]
        );
      });

      if (this.showExports) {
        this.chart.exporting.menu = new am4core.ExportMenu();
        this.chart.exporting.menu.align = 'right';
      }

      this.updateData();

      // Delay needed to prevent legend (especially external) conflicting with grouping
      setTimeout(() => {
        this.applySettings();
      }, 1000);
    });
  }

  cleanup(): void {
    this.browserOnly((): void => {
      if (this.legendContainer) {
        this.legendContainer.dispose();
      }
      if (this.chart.legend) {
        this.chart.legend.dispose();
      }
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}

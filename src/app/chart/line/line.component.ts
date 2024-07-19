import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  NgZone,
  PLATFORM_ID
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4plugins_bullets from '@amcharts/amcharts4/plugins/bullets';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { colourGrid } from '../../_data';
import {
  IHash,
  IHashArray,
  TargetData,
  TargetFieldName,
  TargetMetaData
} from '../../_models';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor]
})
export class LineComponent implements AfterViewInit {
  allSeriesData: IHash<am4charts.LineSeries> = {};
  chart: am4charts.XYChart;
  dateAxis: am4charts.DateAxis;
  padding = {
    top: 21,
    bottom: 6,
    left: 0,
    rightDefault: 14,
    rightWide: 30
  };
  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;

  @Input() targetMetaData: IHash<IHashArray<TargetMetaData>>;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId,
    private readonly zone: NgZone
  ) {
    am4core.options.autoDispose = true;
  }

  ngAfterViewInit(): void {
    this.drawChart();
  }

  /** removeRange
   * Removes either a single range or a set of ranges
   **/
  removeRange(
    country: string,
    specificValueName?: string,
    specificIndex?: number
  ): IHash<IHash<Array<number>>> {
    const allRemovals = {} as IHash<IHash<Array<number>>>;

    Object.keys(TargetFieldName).forEach((seriesValueName: string) => {
      if (
        !specificValueName ||
        specificValueName === TargetFieldName[seriesValueName]
      ) {
        const targetDataType =
          this.targetMetaData[country][TargetFieldName[seriesValueName]];
        if (targetDataType) {
          targetDataType.forEach((td: TargetMetaData, tdIndex: number) => {
            if (parseInt(`${specificIndex}`) > -1) {
              if (specificIndex !== tdIndex) {
                return;
              }
            }

            if (td.range) {
              if (!allRemovals[seriesValueName]) {
                allRemovals[seriesValueName] = {};
                allRemovals[seriesValueName][country] = [];
              }
              allRemovals[seriesValueName][country].push(tdIndex);
              this.valueAxis.axisRanges.removeValue(td.range);
              td.range.dispose();
              delete td.range;
            }
          });
        }
      }
    });

    if (this.valueAxis.axisRanges.values.length === 0) {
      this.chart.paddingRight = this.padding.rightDefault;
    }

    return allRemovals;
  }

  showRange(
    country: string,
    seriesValueName: TargetFieldName,
    index: number,
    colour: am4core.Color
  ): void {
    this.createRange(
      this.targetMetaData[country][seriesValueName][index],
      colour
    );
    this.chart.paddingRight = this.padding.rightWide;
  }

  /** createRange
   * creates and styles a (pinned) axisRange
   * assigns reference for open / closing behaviour
   **/
  createRange(targetData: TargetMetaData, colour: am4core.Color): void {
    const colourPin = am4core.color('#0c529c'); // eu-flag colour
    const range = this.valueAxis.axisRanges.create();

    targetData.range = range;

    range.axisFill.fill = colour;
    range.axisFill.fillOpacity = 0.3;

    if (targetData.isInterim) {
      range.grid.strokeDasharray = '3,3';
    }

    range.grid.above = true;
    range.grid.location = 0;
    range.grid.stroke = colour;
    range.grid.strokeWidth = 2;
    range.grid.strokeOpacity = 1;
    range.label.align = 'right';
    range.label.fill = range.grid.stroke;
    range.label.fontSize = 14;
    range.label.inside = true;
    range.label.location = 0;

    range.label.text = `${targetData.targetYear} Target`;

    range.label.verticalCenter = 'bottom';
    range.value = targetData.value;

    const pin = range.label.createChild(am4plugins_bullets.PinBullet);

    pin.background.radius = 10;
    pin.background.fill = colourPin;
    pin.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    pin.image = new am4core.Image();
    pin.image.href =
      'https://upload.wikimedia.org/wikipedia/en/2/27/EU_flag_square.PNG';
    pin.verticalCenter = 'top';

    const defaultPinDx = 86;
    const defaultPinDy = 28;

    const setRangeAndPinDefaults = (): void => {
      range.endValue = range.value;
      pin.background.pointerAngle = 180;
      pin.dx = defaultPinDx;
      pin.dy = defaultPinDy;
      range.label.text = `${targetData.targetYear} Target`;
      range.label.dx = 0;
    };

    setRangeAndPinDefaults();

    // toggle display of the limit floor
    pin.events.on('hit', function () {
      // the minimum allowed is 40% of the target
      const targetMargin = 40;
      if (range.endValue === range.value) {
        range.endValue = range.value * (targetMargin / 100);
        pin.background.pointerAngle = 90;
        pin.dx = defaultPinDx + 100;
        pin.dy = defaultPinDy - 3;
        range.label.text = `${targetData.targetYear} Target (${targetMargin}% margin)`;
        range.label.dx = -10;
      } else {
        setRangeAndPinDefaults();
      }
    });
  }

  /**
   * addSeries
   * adds a LineSeries object to the chart / stores ref to this.allSeriesData
   * adds the (renmed) series data to the chart data
   * @param { string } axisLabel - axis label
   * @param { string } seriesValueY - unique per-series per-country series key
   * @param { TargetFieldName } valueY
   * @param { Array<TargetData> } seriesData:
   **/
  addSeries(
    axisLabel: string,
    seriesValueY: string,
    valueY: TargetFieldName,
    seriesData: Array<TargetData>
  ): void {
    const series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = seriesValueY;
    series.dataFields.dateX = 'date';
    series.strokeWidth = 2;
    series.tooltipText = `${axisLabel} {${seriesValueY}}`;
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.getFillFromObject = true;

    const chartData = this.chart.data;

    seriesData.forEach((sd: TargetData, rowIndex: number) => {
      const val = sd[valueY];
      if (rowIndex >= chartData.length) {
        chartData.push(sd);
      }
      chartData[rowIndex][seriesValueY] = val;
    });
    this.allSeriesData[seriesValueY] = series;
  }

  /** drawChart
   * initialises chart object
   **/
  drawChart(): void {
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    const chart = am4core.create('lineChart', am4charts.XYChart);
    this.chart = chart;
    chart.seriesContainer.zIndex = -1;

    chart.paddingTop = this.padding.top;
    chart.paddingBottom = this.padding.bottom;
    chart.paddingLeft = this.padding.left;
    chart.paddingRight = this.padding.rightDefault;

    chart.colors.list = colourGrid.map((colour: string) => {
      return am4core.color(colour);
    });

    chart.data = [{}];

    const colourAxis = am4core.color('#4d4d4d');

    // Create date axis
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    this.dateAxis = dateAxis;
    dateAxis.renderer.minGridDistance = 78;
    dateAxis.renderer.labels.template.fill = colourAxis;
    dateAxis.renderer.labels.template.dy = 16;
    dateAxis.renderer.labels.template.fontSize = 14;

    // Create value axis
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    this.valueAxis = valueAxis;
    valueAxis.extraMax = 0.1;
    valueAxis.min = 0;
    valueAxis.includeRangesInMinMax = true;
    valueAxis.renderer.labels.template.fill = colourAxis;
    valueAxis.renderer.labels.template.fontSize = 14;
    this.valueAxis.renderer.grid.template.disabled = true;
    this.dateAxis.renderer.grid.template.disabled = true;
  }

  toggleGridlines(): void {
    // disable grid lines
    if (this.dateAxis.renderer.grid.template.disabled) {
      this.valueAxis.renderer.grid.template.disabled = false;
      this.dateAxis.renderer.grid.template.disabled = false;
    } else {
      this.valueAxis.renderer.grid.template.disabled = true;
      this.dateAxis.renderer.grid.template.disabled = true;
    }
    this.chart.invalidateData();
  }

  toggleCursor(): void {
    if (this.chart.cursor) {
      this.chart.cursor.dispose();
      this.chart.cursor = undefined;
    } else {
      const cursor = new am4charts.XYCursor();
      this.chart.cursor = cursor;
      cursor.xAxis = this.dateAxis;
    }
  }

  toggleScrollbar(): void {
    if (this.chart.scrollbarX) {
      this.chart.scrollbarX.dispose();
      this.chart.scrollbarX = undefined;
    } else {
      const scrollbar = new am4core.Scrollbar();
      const scrollbarColour = am4core.color('#0a72cc');

      this.chart.scrollbarX = scrollbar;
      scrollbar.dy = -25;

      const customiseGrip = (grip): void => {
        grip.icon.disabled = true;
        grip.background.fill = scrollbarColour;
        grip.background.fillOpacity = 0.8;
      };
      customiseGrip(scrollbar.startGrip);
      customiseGrip(scrollbar.endGrip);

      scrollbar.background.fill = scrollbarColour;
      scrollbar.background.fillOpacity = 0.1;

      scrollbar.thumb.background.fill = scrollbarColour;
      scrollbar.thumb.background.fillOpacity = 0.2;
    }
  }
}

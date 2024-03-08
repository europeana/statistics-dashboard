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

import { colours } from '../../_data';

import { IHash, IHashArray, TargetData, TemporalDataItem } from '../../_models';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor]
})
export class LineComponent implements AfterViewInit {
  allSeriesData: {
    [key: string]: {
      series: am4charts.LineSeries;
      dataMax: number;
      appliedTargetIndicatorValue?: number;
    };
  } = {};

  chart: am4charts.XYChart;

  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;

  @Input() targetData: IHash<IHashArray<TargetData>>;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId,
    private readonly zone: NgZone
  ) {
    am4core.options.autoDispose = true;
  }

  ngAfterViewInit(): void {
    this.drawChart();
  }

  rangeRemovalCleanUp(): void {
    if (this.valueAxis.axisRanges.length === 0) {
      this.chart.paddingRight = 0;
      this.valueAxis.max = undefined;
      this.valueAxis.min = undefined;
    } else {
      // TODO: recalculate the max min to reclaim freed space.
      console.log('recalculate the max min to reclaim freed space');

      // who are the other range users?

      // this is the series data... now recorded...
      // ...but it may not be needed...
      Object.keys(this.allSeriesData).forEach((key: string) => {
        const seriesData = this.allSeriesData[key];
        const series = seriesData.series;
        if (!series.isHidden) {
          console.log(' - still showing ' + seriesData.dataMax);
        }
      });
      // this.targetData[country][the others....]
    }
  }

  /** removeRange
   * Removes either a single range or a set of ranges
   **/
  removeRange(
    country: string,
    specificType?: string,
    specificIndex?: number
  ): void {
    /*
    //orig

    this.targetData[country][type]
    .forEach(
      (td: TargetData, tdIndex: number) => {
        if (parseInt(`${specificIndex}`) > -1) {
          if (specificIndex !== tdIndex) {
            return;
          }
        }
        this.valueAxis.axisRanges.removeValue(td.range);
        delete td.range;
      }
    );
    */

    ['total', 'three_d', 'meta_tier_a'].forEach((seriesType: string) => {
      if (!specificType || specificType === seriesType) {
        const targetDataType = this.targetData[country][seriesType];
        if (targetDataType) {
          targetDataType.forEach((td: TargetData, tdIndex: number) => {
            if (parseInt(`${specificIndex}`) > -1) {
              if (specificIndex !== tdIndex) {
                return;
              }
            }
            this.valueAxis.axisRanges.removeValue(td.range);
            delete td.range;
          });
        }
      }
    });

    /*
this.targetData[country][type]
.forEach(
  (td: TargetData, tdIndex: number) => {
    if (parseInt(`${specificIndex}`) > -1) {
      if (specificIndex !== tdIndex) {
        return;
      }
    }
    this.valueAxis.axisRanges.removeValue(td.range);
    delete td.range;
  }
);

*/
    this.rangeRemovalCleanUp();
  }

  /*
  removeRangeSet(country: string, type: string): void {
    this.targetData[country][type].forEach((td: TargetData)=> {
      this.valueAxis.axisRanges.removeValue(td.range);
      delete td.range;
    });
    this.rangeRemovalCleanUp();
  }

  removeRange(country: string, type: string, index: number): void {
    //this.valueAxis.axisRanges.clear();
    this.valueAxis.axisRanges.removeValue(
      this.targetData[country][type][index].range
    );
    delete this.targetData[country][type][index].range;
    this.rangeRemovalCleanUp();
  }
  */

  showRange(
    country: string,
    type: string,
    index: number,
    colour: am4core.Color
  ): void {
    this.chart.paddingRight = 38;
    console.log('showRange type = ' + type + ', color = ' + colour);
    this.addChartTargetIndicator(country, type, index, colour);
  }

  /** createRange
   * creates and styles a (pinned) axisRange
   * assigns reference for open / closing behaviour
   * updates appliedTargetIndicatorValue
   **/
  createRange(
    valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>,
    targetData: TargetData,
    colour: am4core.Color
  ): void {
    const colourPin = am4core.color('#0c529c'); // eu-flag colour
    const colourRangeLine = colour; // '#009900'; //'#A96478';
    const colourRangeFill = colourRangeLine; //'#990000';//'#396478';

    const range = valueAxis.axisRanges.create();
    range.value = targetData.value;

    console.log('createRange: add limit of ' + targetData.value);
    /*
    TODO: can we update this here?
      // allSeriesData[] appliedTargetIndicatorValue
    no.
    We'd have to run a lookup...
    ...and it doesn't map yet, because the targetData is not typed?
    */

    range.axisFill.fill = colourRangeFill;
    range.axisFill.fillOpacity = 0.3;

    if (targetData.interim) {
      range.grid.strokeDasharray = '3,3';
    }
    range.grid.above = true;
    // the grid line should be at the top, not the middle
    range.grid.location = 0;
    range.grid.stroke = colourRangeLine;
    range.grid.strokeWidth = 2;
    range.grid.strokeOpacity = 1;

    range.label.inside = true;
    range.label.location = 0;
    //    range.label.zIndex = 3;

    range.label.align = 'right';
    range.label.text = targetData.label;
    range.label.fill = range.grid.stroke;
    range.label.verticalCenter = 'bottom';
    range.label.fontSize = 14;

    const pin = range.label.createChild(am4plugins_bullets.PinBullet);

    //pin.background.radius = 20;
    pin.background.radius = 10;
    pin.background.fill = colourPin;
    pin.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    pin.dy = 29;

    const setRangeAndPinDefaults = (): void => {
      const defaultDx = 24;
      range.endValue = range.value;
      pin.background.pointerAngle = 180;
      pin.dx = defaultDx;
    };

    setRangeAndPinDefaults();

    pin.verticalCenter = 'top';
    pin.image = new am4core.Image();
    pin.image.href =
      'https://upload.wikimedia.org/wikipedia/en/2/27/EU_flag_square.PNG';

    // toggle display of the limit floor
    pin.events.on('hit', function () {
      if (range.endValue === range.value) {
        // the minimum allowed is 40% of the target
        range.endValue = range.value * 0.4;
        pin.background.pointerAngle = 90;
        pin.dx = 42;
      } else {
        setRangeAndPinDefaults();
      }
    });
    // targetData.pin = pin;
    targetData.range = range;
  }

  getMaxValue(data: Array<TemporalDataItem>, country: string): number {
    return data.reduce((highest: number, item: TemporalDataItem) => {
      const val = item[country] as number;
      if (val && val > highest) {
        highest = val;
      }
      return highest;
    }, 0);
  }

  addChartTargetIndicator(
    country: string,
    type: string,
    index: number,
    colour: am4core.Color
  ): void {
    const targetData = this.targetData[country][type][index];
    const maxValue = this.getMaxValue(this.chart.data, country);

    console.log('maxValue for ' + country + ' = ' + maxValue);

    this.createRange(this.valueAxis, targetData, colour);

    if (targetData.value > maxValue) {
      console.log(
        'LIMIT (' + targetData.value + ') exceeds highest value ' + maxValue
      );
      if (targetData.value > this.valueAxis.max) {
        console.log(
          'limits (' +
            targetData.value +
            ') exceeds AXIS value ' +
            this.valueAxis.max
        );
      } else {
        console.log(
          'limits (' +
            targetData.value +
            ') NOT exceeds AXIS value ' +
            this.valueAxis.max
        );
      }
      this.valueAxis.max = targetData.value;
    }
  }

  removeSeries(id: string): void {
    const series = this.allSeriesData[id];

    if (series) {
      const seriesIndex = this.chart.series.indexOf(series.series);
      if (seriesIndex > -1) {
        this.chart.series.removeIndex(seriesIndex).dispose();

        console.log('remove series id ' + id);
      }
      delete this.allSeriesData[id];
    } else {
      console.log(`Line: can't find series to remove (${id})`);
    }
    this.chart.invalidateData();
  }

  hideSeries(id: string): void {
    const series = this.allSeriesData[id];
    if (series) {
      series.series.hide();
    }
  }

  showSeries(id: string): void {
    const series = this.allSeriesData[id];
    if (series) {
      series.series.show();
    }
  }

  addSeries(
    seriesDisplayName: string,
    seriesValueY: string,
    valueY: string,
    //    isHidden: boolean,
    seriesData?: Array<TemporalDataItem>
  ): void {
    const series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = seriesValueY;
    series.dataFields.dateX = 'date';

    series.strokeWidth = 2;
    series.tooltipText = `${seriesDisplayName} {${seriesValueY}}`;
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.getFillFromObject = true;

    //    series.hidden = isHidden;

    let seriesMax = 0;
    if (seriesData) {
      const chartData = this.chart.data;

      seriesData.forEach((sd: TemporalDataItem, rowIndex: number) => {
        const val = sd[valueY] as number;
        if (rowIndex >= chartData.length) {
          chartData.push(sd);
        }
        chartData[rowIndex][seriesValueY] = val;
        if (val > seriesMax) {
          seriesMax = val;
        }
      });

      //this.chart.invalidateData();
    }

    //    console.log('add series name ' + seriesValueY + ', max is ' + seriesMax);

    //    const maxValue = this.getMaxValue(this.chartData, country);

    this.allSeriesData[seriesValueY] = {
      series: series,
      dataMax: seriesMax
    };
  }

  /** drawChart
  /* ...
  */
  drawChart(): void {
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    const chart = am4core.create('lineChart', am4charts.XYChart);
    this.chart = chart;

    chart.colors.list = colours.map((colour: string) => {
      return am4core.color(colour);
    });

    //chart.maskBullets = false;
    //    chart.data = this.chartData;
    chart.data = [{}]; //this.chartData;

    // Create date axis
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 60;

    // Create value axis
    this.valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    this.valueAxis.extraMax = 0.1;
    //this.valueAxis.extraMin = 0.2;

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
    //chart.scrollbarX = new am4core.Scrollbar();
    //chart.legend = new am4charts.Legend();
  }
}

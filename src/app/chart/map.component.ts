import { Component, Inject, Input, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';

import { APIService } from '../_services';
import { IHash, NameValue } from '../_models';

@Component({
  selector: 'app-map-chart',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  _results: Array<NameValue>;
  chart: am4maps.MapChart;
  polygonSeries: am4maps.MapPolygonSeries;
  countryCodes: IHash;

  // controls
  hasLegend = true;

  @Input() set results(results: Array<NameValue>) {
    this._results = results;
    this.updateData();
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private zone: NgZone,
    private api: APIService
  ) {
    this.countryCodes = api.loadISOCountryCodes();
  }

  // Run the function only in the browser / (exempt rendering from change detection)
  browserOnly(f: () => void): void {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular((): void => {
        f();
      });
    }
  }

  updateData(): void {
    if (!this.chart) {
      return;
    }
    if (!this._results) {
      return;
    }

    this.polygonSeries.data = this._results.map((nv: NameValue) => {
      return {
        id: this.countryCodes[nv.name],
        name: nv.name,
        value: nv.value
      };
    });
  }

  /** ngAfterViewInit
  /* Event hook: calls drawChart
  */
  ngAfterViewInit(): void {
    this.drawChart();
  }

  /** drawChart
  /* ...
  */
  drawChart(): void {
    this.browserOnly((): void => {
      // Themes begin
      am4core.useTheme(am4themes_animated);

      // Create map instance
      const chart = am4core.create('mapChart', am4maps.MapChart);
      this.chart = chart;

      // Set map definition
      //chart.geodata = am4geodata_usaLow;
      chart.geodata = am4geodata_worldHigh;

      // Set projection
      chart.projection = new am4maps.projections.Miller();

      // Create map polygon series
      const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

      this.polygonSeries = polygonSeries;

      // Hide antarctica
      polygonSeries.exclude = ['AQ'];

      //Set min/max fill color for each area
      polygonSeries.heatRules.push({
        property: 'fill',
        target: polygonSeries.mapPolygons.template,
        min: chart.colors.getIndex(1).brighten(1),
        max: chart.colors.getIndex(1).brighten(-0.3)
      });

      // Make map load polygon data (state shapes and names) from GeoJSON
      polygonSeries.useGeodata = true;

      // Set up heat legend
      if (this.hasLegend) {
        const heatLegend = chart.createChild(am4maps.HeatLegend);
        heatLegend.id = 'mapLegend';
        heatLegend.series = polygonSeries;
        heatLegend.align = 'left';
        heatLegend.valign = 'bottom';
        heatLegend.width = am4core.percent(35);
        heatLegend.marginRight = am4core.percent(4);
        heatLegend.background.fill = am4core.color('#000');
        heatLegend.background.fillOpacity = 0.05;
        heatLegend.padding(5, 5, 5, 5);
        // Set up custom heat map legend labels using axis ranges
        const minRange = heatLegend.valueAxis.axisRanges.create();
        minRange.label.horizontalCenter = 'left';

        const maxRange = heatLegend.valueAxis.axisRanges.create();
        maxRange.label.horizontalCenter = 'right';

        // Blank out internal heat legend value axis labels
        heatLegend.valueAxis.renderer.labels.template.adapter.add(
          'text',
          function (_: string) {
            return '';
          }
        );

        // Update heat legend value labels
        polygonSeries.events.on('datavalidated', function (ev) {
          const heatLegend = ev.target.map.getKey('mapLegend');
          const min = heatLegend.series.dataItem.values.value.low;
          const minRange = heatLegend.valueAxis.axisRanges.getIndex(0);
          minRange.value = min;
          minRange.label.text = '' + heatLegend.numberFormatter.format(min);

          const max = heatLegend.series.dataItem.values.value.high;
          const maxRange = heatLegend.valueAxis.axisRanges.getIndex(1);
          maxRange.value = max;
          maxRange.label.text = '' + heatLegend.numberFormatter.format(max);
        });
      }

      // Configure series tooltip
      const polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.tooltipText = '{name}: {value}';
      polygonTemplate.nonScalingStroke = true;
      polygonTemplate.strokeWidth = 0.5;

      // Create hover state and set alternative fill color
      const hs = polygonTemplate.states.create('hover');
      hs.properties.fill = am4core.color('#3c5bdc');

      this.updateData();

      const fn = (): void => {
        this.zoomToCountries(['IS', 'TR', 'ES', 'NO']);
      };
      chart.events.on('ready', fn);
    });
  }

  zoomToCountries(zoomTo: Array<string>): void {
    // Init extrems
    let north, south, west, east;

    // Find extreme coordinates for all pre-zoom countries
    for (let i = 0; i < zoomTo.length; i++) {
      const country = this.polygonSeries.getPolygonById(zoomTo[i]);
      if (north == undefined || country.north > north) {
        north = country.north;
      }
      if (south == undefined || country.south < south) {
        south = country.south;
      }
      if (west == undefined || country.west < west) {
        west = country.west;
      }
      if (east == undefined || country.east > east) {
        east = country.east;
      }

      country.isActive = true;
      // Pre-zoom
      this.chart.zoomToRectangle(north, east, south, west, 1, true);
    }
  }
}

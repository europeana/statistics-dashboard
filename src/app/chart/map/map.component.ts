import { Component, Inject, Input, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';

import { APIService } from '../../_services';
import { IHash, NameValue } from '../../_models';

@Component({
  selector: 'app-map-chart',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  _results: Array<NameValue>;
  chart: am4maps.MapChart;
  polygonSeries: am4maps.MapPolygonSeries;
  countryCodes: IHash<string>;

  // controls
  hasLegend = true;

  @Input() set results(results: Array<NameValue>) {
    this._results = results;
    this.updateData();
    am4core.options.autoDispose = true;
  }
  get results(): Array<NameValue> {
    return this._results;
  }

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId,
    private readonly zone: NgZone,
    private readonly api: APIService
  ) {
    this.countryCodes = api.loadISOCountryCodes();
    am4core.options.autoDispose = true;
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
    this.browserOnly((): void => {
      if (!this.results) {
        return;
      }
      this.polygonSeries.data = this.results.map((nv: NameValue) => {
        return {
          id: this.countryCodes[nv.name],
          name: nv.name,
          value: nv.value
        };
      });
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
        const legend = chart.createChild(am4maps.HeatLegend);
        legend.id = 'mapLegend';
        legend.series = polygonSeries;
        legend.align = 'left';
        legend.valign = 'bottom';
        legend.width = am4core.percent(35);
        legend.marginRight = am4core.percent(4);
        legend.background.fill = am4core.color('#000');
        legend.background.fillOpacity = 0.05;
        legend.padding(5, 5, 5, 5);
        // Set up custom heat map legend labels using axis ranges
        const minRange = legend.valueAxis.axisRanges.create();
        minRange.label.horizontalCenter = 'left';

        const maxRange = legend.valueAxis.axisRanges.create();
        maxRange.label.horizontalCenter = 'right';

        // Blank out internal heat legend value axis labels
        legend.valueAxis.renderer.labels.template.adapter.add(
          'text',
          function (_: string) {
            return '';
          }
        );

        // Update heat legend value labels
        polygonSeries.events.on('datavalidated', function (ev) {
          const heatLegend = ev.target.map.getKey('mapLegend');
          const hlMin = heatLegend.series.dataItem.values.value.low;
          const hlMinRange = heatLegend.valueAxis.axisRanges.getIndex(0);
          hlMinRange.value = hlMin;
          hlMinRange.label.text = '' + heatLegend.numberFormatter.format(hlMin);

          const hlMax = heatLegend.series.dataItem.values.value.high;
          const hlMaxRange = heatLegend.valueAxis.axisRanges.getIndex(1);
          hlMaxRange.value = hlMax;
          hlMaxRange.label.text = '' + heatLegend.numberFormatter.format(hlMax);
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
        this.zoomToCountries();
      };
      chart.events.on('ready', fn);
    });
  }

  zoomToCountries(zoomTo = ['IS', 'TR', 'ES', 'NO']): void {
    this.browserOnly((): void => {
      // Init extremes
      let north, south, west, east;

      // Find extreme coordinates for all pre-zoom countries
      zoomTo.forEach((countryId: string) => {
        const country = this.polygonSeries.getPolygonById(countryId);
        if (!north || country.north > north) {
          north = country.north;
        }
        if (!south || country.south < south) {
          south = country.south;
        }
        if (!west || country.west < west) {
          west = country.west;
        }
        if (!east || country.east > east) {
          east = country.east;
        }
      });

      // Pre-zoom
      this.chart.zoomToRectangle(north, east, south, west, 1, true);
    });
  }
}

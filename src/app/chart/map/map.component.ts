import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';

import { IHash, NameValue } from '../../_models';

enum ZoomLevel {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
  INTERMEDIATE = 'INTERMEDIATE'
}

@Component({
  selector: 'app-map-chart',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true
})
export class MapComponent {
  @Output() mapCountrySet = new EventEmitter<string | undefined>();

  _results: Array<NameValue>;
  chart: am4maps.MapChart;
  chartHidden: am4maps.MapChart;
  polygonSeries: am4maps.MapPolygonSeries;
  polygonSeriesHidden: am4maps.MapPolygonSeries;
  legend: am4maps.HeatLegend;

  mapHeight: number;
  mapWidth: number;

  animationTime = 750;
  boundingCountries = ['IS', 'TR', 'ES', 'NO'];
  mapCountries = [];

  selectedCountryNext?: string;
  selectedCountryPrev?: string;
  _selectedCountry?: string;
  selectedIndex: number;

  get selectedCountry(): string {
    return this._selectedCountry;
  }

  set selectedCountry(selectedCountry: string | undefined) {
    this._selectedCountry = selectedCountry;
    this.polygonSeries.tooltip.disabled = !!selectedCountry;

    const selectedIndex = this.mapCountries.indexOf(selectedCountry);
    const length = this.mapCountries.length;
    const indexNext = (selectedIndex + 1) % length;
    const indexPrev = (selectedIndex ? selectedIndex : length) - 1;

    this.selectedIndex = selectedCountry ? selectedIndex : undefined;
    this.selectedCountryNext = this.mapCountries[indexNext];
    this.selectedCountryPrev = this.mapCountries[indexPrev];

    // emit output
    this.mapCountrySet.emit(selectedCountry);
  }

  // TODO rename results
  // generate unique list of countries than includes the bounding countries
  @Input() set results(results: Array<NameValue>) {
    this.mapCountries = Object.keys(
      results
        .map((item: NameValue) => {
          return item.name;
        })
        .concat(this.boundingCountries)
        .reduce((ob: IHash<boolean>, name) => {
          ob[name] = true;
          return ob;
        }, {})
    );

    this._results = results;
    this.updateData();
    am4core.options.autoDispose = true;
  }

  get results(): Array<NameValue> {
    return this._results;
  }

  constructor() {
    am4core.options.autoDispose = true;
  }

  /** updateData
   *
   **/
  updateData(): void {
    if (!this.polygonSeries || !this.results) {
      return;
    }
    this.polygonSeries.data = this.filterResultsData();
    this.polygonSeriesHidden.data = this.filterResultsData();
  }

  /** ngAfterViewInit
   * Event hook: calls drawChart
   **/
  ngAfterViewInit(): void {
    this.drawChart();
  }

  /** filterResultsData
   * filters mapped data
   **/
  filterResultsData(
    countries = this.mapCountries
  ): Array<{ id: string; value: number }> {
    return this.results
      .filter((nv: NameValue) => {
        return countries.includes(nv.name);
      })
      .map((nv: NameValue) => {
        return {
          id: nv.name,
          value: nv.value
        };
      });
  }

  /** setCountryInclusion
   * @param { Array<string> } countries
   * sets the countries to include in the map: isolates single
   * country or restores all countries, triggers a zoom and
   * optionally resets the selectedCountry.
   **/
  setCountryInclusion(countries: Array<string>): void {
    this.polygonSeries.include = countries;
    this.polygonSeries.data = this.filterResultsData();
    this.polygonSeries.events.once('datavalidated', () => {
      if (countries.length === 1) {
        this.zoomToCountries(countries, ZoomLevel.SINGLE, 0);
      } else {
        this.selectedCountry = undefined;
        this.zoomToCountries(this.boundingCountries, ZoomLevel.MULTIPLE, 0);
      }
    });
  }

  /** countryMorph
   * @param { string } newCountry - the country to select
   * assumes single-country mode
   **/
  countryMorph(newCountry: string): void {
    const oldCountry = this.polygonSeries.include[0];
    if (this.polygonSeriesHidden.include.length === 1) {
      console.log('countryMorph exit: animating!');
      return;
    }
    if (this.polygonSeries.include.length > 1) {
      console.log('countryMorph exit: not in single country mode');
      return;
    }
    if (oldCountry === newCountry) {
      console.log('countryMorph exit: old and new are the same: ' + oldCountry);
      return;
    }

    // curtail the hidden map to include only the
    this.polygonSeriesHidden.data = [];
    this.polygonSeriesHidden.include = [newCountry];
    this.selectedCountry = newCountry;

    this.polygonSeriesHidden.events.once('validated', () => {
      const polyHidden = this.polygonSeriesHidden.mapPolygons.getIndex(0);
      const poly = this.polygonSeries.getPolygonById(oldCountry);
      const morphAnimationEnded = (): void => {
        // reset the hidden / update the actual
        this.polygonSeriesHidden.data = [];
        this.polygonSeriesHidden.include = this.mapCountries;
        setTimeout(() => {
          this.setCountryInclusion([newCountry]);
        });
      };
      if (poly) {
        const morphAnimation = polyHidden
          ? poly.polygon.morpher.morphToPolygon(
              polyHidden.polygon.points,
              this.animationTime
            )
          : poly.polygon.morpher.morphToCircle(1, this.animationTime);
        morphAnimation.events.on('animationended', morphAnimationEnded);
      } else {
        morphAnimationEnded();
      }
    });
  }

  /** countryClick
   * @param { string } country - the clicked country
   * toggles selected setCountryInclusion with (optional animation)
   **/
  countryClick(country: string): void {
    const singleMode = this.polygonSeries.include.length === 1;
    if (singleMode) {
      // revert back to full map
      this.setCountryInclusion(this.mapCountries);
    } else {
      // set selection and zoom
      this.legend.hide();
      this.selectedCountry = country;
      const animation = this.zoomToCountries(
        [country],
        ZoomLevel.INTERMEDIATE,
        this.animationTime
      );
      animation.events.on('animationended', () => {
        // remove other countries
        this.setCountryInclusion([country]);
      });
    }
  }

  /** drawChart
   *
   **/
  drawChart(): void {
    const countryClick = this.countryClick.bind(this);

    am4core.useTheme(am4themes_animated);

    // Create map instance
    const chart = am4core.create('mapChart', am4maps.MapChart);
    const chartHidden = am4core.create('mapChartHidden', am4maps.MapChart);
    this.chart = chart;
    this.chartHidden = chartHidden;

    // Set map definition
    chart.geodata = am4geodata_worldHigh;
    chartHidden.geodata = am4geodata_worldHigh;

    chart.events.on('over', () => {
      if (this.polygonSeries.include.length > 1) {
        this.legend.show();
      }
    });

    chart.events.on('out', () => {
      this.legend.hide();
    });

    // Set projection

    const mp = new am4maps.projections.Miller();
    chart.projection = mp;
    const mpHidden = new am4maps.projections.Miller();
    chartHidden.projection = mpHidden;

    // Create map polygon series
    const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    const polygonSeriesHidden = chartHidden.series.push(
      new am4maps.MapPolygonSeries()
    );

    this.polygonSeries = polygonSeries;
    this.polygonSeriesHidden = polygonSeriesHidden;

    polygonSeries.include = this.mapCountries;
    polygonSeries.data = this.filterResultsData();
    polygonSeriesHidden.include = this.mapCountries;

    // Make map load polygon data (state shapes and names) from GeoJSON
    polygonSeries.useGeodata = true;
    polygonSeriesHidden.useGeodata = true;

    // add heat rules
    polygonSeries.heatRules.push({
      property: 'fill',
      target: this.polygonSeries.mapPolygons.template,
      min: this.chart.colors.getIndex(1).brighten(1),
      max: this.chart.colors.getIndex(1).brighten(-0.3)
    });

    // add legend
    const legend = this.chart.createChild(am4maps.HeatLegend);
    this.legend = legend;
    legend.hide();
    legend.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    legend.id = 'mapLegend';
    legend.series = this.polygonSeries;
    legend.align = 'left';
    legend.valign = 'bottom';
    legend.width = am4core.percent(35);
    legend.marginRight = am4core.percent(4);
    legend.background.fillOpacity = 0.05;
    legend.padding(5, 5, 5, 5);
    legend.events.on('hit', () => {
      this.zoomToCountries();
    });

    //legend.tooltipText = 'home';

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
    polygonSeries.events.once('datavalidated', function (ev) {
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

    //chart.seriesContainer.draggable = false;
    //chart.seriesContainer.resizable = false;

    this.chart.maxZoomLevel = 24;
    this.chartHidden.maxZoomLevel = 24;
    this.chart.minZoomLevel = 0.2;
    this.chartHidden.minZoomLevel = 0.2;

    // Bind to country click
    polygonSeries.mapPolygons.template.events.on('hit', function (ev) {
      const clickedId = ev.target.dataItem.dataContext['id'];
      countryClick(clickedId);
    });

    // Configure series tooltip
    const polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = '{name}: {value}';
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeWidth = 0.5;

    // Create hover state and set alternative fill color
    const hs = polygonTemplate.states.create('hover');

    hs.properties.fill = am4core.color('#0a72cc'); // $stats-blue
    hs.properties.strokeWidth = 2.5;
    hs.properties.stroke = am4core.color('#ffcb5c'); // $eu-yellow

    this.updateData();

    chart.zoomLevel = 1;
    chart.events.on('ready', () => {
      const [n, s, e, w] = this.getBoundingCoords(this.mapCountries);
      this.mapHeight = n - s;
      this.mapWidth = e - w;
      this.zoomToCountries();
    });
  }

  getBoundingCoords(countryIds: Array<string>): Array<number> {
    let [north, south, east, west] = [-90, 90, -180, 180];
    countryIds.forEach((countryId: string) => {
      const country = this.polygonSeries.getPolygonById(countryId);
      if (country && !isNaN(country.north)) {
        north = Math.max(north, country.north);
        south = Math.min(south, country.south);
        west = Math.min(west, country.west);
        east = Math.max(east, country.east);
      }
    });
    return [north, south, east, west];
  }

  zoomToCountries(
    zoomTo = this.boundingCountries,
    zoomLevelIn = ZoomLevel.MULTIPLE,
    duration = this.animationTime
  ): am4core.Animation {
    const aspectRatioChart = this.chart.pixelWidth / this.chart.pixelHeight;

    let zoomLevel: number;
    let zoomLevelSingle = 0.8;
    let zoomLevelMultiple = 3;

    let [north, south, east, west] = this.getBoundingCoords(zoomTo);

    if (zoomLevelIn === ZoomLevel.SINGLE) {
      zoomLevel = zoomLevelSingle;
      if (aspectRatioChart > 2.4) {
        console.log('correct single');
        zoomLevel = 0.75;
      }
    } else if (zoomLevelIn === ZoomLevel.MULTIPLE) {
      zoomLevel = zoomLevelMultiple;
    } else {
      const selectionHeight = north - south;
      const aspectRatioSelection = (east - west) / selectionHeight;

      const getRatio = (tgt: number, val: number, rec = 0): number => {
        const half = val / 2;
        if (tgt > val) {
          return 0;
        }
        if (tgt > half) {
          return Math.max(rec, 1) + ((val / tgt) % 1);
        }
        return getRatio(tgt, half, rec + 1);
      };

      zoomLevel = getRatio(selectionHeight, this.mapHeight);
      zoomLevel = zoomLevelSingle * zoomLevel;
      // zoomLevel -= aspectRatioSelection / aspectRatioChart;
      zoomLevel -= aspectRatioChart / aspectRatioSelection;
      zoomLevel = Math.max(1, zoomLevel);
    }
    return this.chart.zoomToRectangle(
      north,
      east,
      south,
      west,
      zoomLevel,
      true,
      duration
    );
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';

import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { SubscriptionManager } from '../../subscription-manager';
import { IdValue, IHash, TargetFieldName } from '../../_models';
import {
  colourHeatmapBlue,
  colourHeatmapRed,
  colourHeatmapYellow,
  colourStatsBlue
} from '../../_data';

enum ZoomLevel {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
  INTERMEDIATE = 'INTERMEDIATE'
}

interface MapColourScheme {
  base: am4core.Color;
  highlight: am4core.Color;
  outline: am4core.Color;
}

type ColourSchemeMap = {
  [key in
    | TargetFieldName.THREE_D
    | TargetFieldName.HQ
    | TargetFieldName.TOTAL]: Array<MapColourScheme>;
};

@Component({
  selector: 'app-map-chart',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true
})
export class MapComponent extends SubscriptionManager {
  @Output() mapCountrySet = new EventEmitter<boolean>();

  _mapData: Array<IdValue>;
  chart: am4maps.MapChart;
  chartHidden: am4maps.MapChart;
  chartGlobe: am4maps.MapChart;
  mapPercentMode = false;
  polygonSeries: am4maps.MapPolygonSeries;
  polygonSeriesHidden: am4maps.MapPolygonSeries;
  legend: am4maps.HeatLegend;
  hs: am4core.SpriteState<am4core.IPolygonProperties, am4core.IPolygonAdapters>;
  sprites: Array<am4core.Sprite> = [];

  mapHeight: number;
  mapWidth: number;

  animationTime = 750;
  boundingCountries = ['IS', 'TR', 'ES', 'NO'];
  countryUnknown = 'EU';
  mapCountries = [];

  selectedCountryNext?: string;
  selectedCountryPrev?: string;
  _selectedCountry?: string;
  selectedIndex: number;

  dragEndSubject = new Subject<boolean>();
  countryClickSubject = new Subject<string>();

  _isAnimating = false;

  set isAnimating(isAnimating: boolean) {
    this._isAnimating = isAnimating;
  }

  get isAnimating(): boolean {
    return this._isAnimating;
  }

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

    if (selectedCountry === this.countryUnknown) {
      this.showGlobe();
    } else {
      this.hideGlobe();
    }
    this.mapCountrySet.emit(!!selectedCountry);
  }

  @Input() set mapData(mapData: Array<IdValue>) {
    // set country set based on original data
    if (this.mapCountries.length === 0) {
      this.mapCountries = Object.keys(
        mapData
          .map((item: IdValue) => {
            return item.id;
          })
          .concat(this.boundingCountries)
          .reduce((ob: IHash<boolean>, name) => {
            ob[name] = true;
            return ob;
          }, {})
      );
    }
    this._mapData = mapData;
    this.updatePolygonData();
  }

  get mapData(): Array<IdValue> {
    return this._mapData;
  }

  colourSchemeTargets: ColourSchemeMap;
  colourSchemeDefault: MapColourScheme;
  _colourScheme: MapColourScheme;

  isDragging = false;

  constructor() {
    super();

    const cst = Object.values(TargetFieldName).reduce(
      (ob: ColourSchemeMap, tType: TargetFieldName) => {
        ob[tType] = [];
        return ob;
      },
      {} as ColourSchemeMap
    );

    const colourHighlightYellow = '#ffcb5c';

    cst[TargetFieldName.THREE_D].push({
      base: am4core.color(colourHeatmapBlue),
      highlight: am4core.color(colourHeatmapBlue),
      outline: am4core.color(colourHeatmapYellow)
    });
    cst[TargetFieldName.THREE_D].push({
      base: am4core.color(colourHeatmapBlue),
      highlight: am4core.color(colourHeatmapYellow),
      outline: am4core.color(colourHeatmapYellow)
    });

    cst[TargetFieldName.HQ].push({
      base: am4core.color(colourHeatmapRed),
      highlight: am4core.color(colourHeatmapRed),
      outline: am4core.color(colourHeatmapYellow)
    });
    cst[TargetFieldName.HQ].push({
      base: am4core.color(colourHeatmapRed),
      highlight: am4core.color(colourHeatmapYellow),
      outline: am4core.color(colourHeatmapYellow)
    });

    cst[TargetFieldName.TOTAL].push({
      base: am4core.color(colourHeatmapYellow),
      highlight: am4core.color(colourHeatmapYellow),
      outline: am4core.color(colourHeatmapYellow)
    });
    cst[TargetFieldName.TOTAL].push({
      base: am4core.color(colourHeatmapYellow),
      highlight: am4core.color(colourHeatmapYellow),
      outline: am4core.color(colourHeatmapYellow)
    });

    this.colourSchemeTargets = cst;
    this.colourSchemeDefault = {
      base: am4core.color(colourStatsBlue),
      highlight: am4core.color(colourStatsBlue),
      outline: am4core.color(colourHighlightYellow)
    };

    this.subs.push(
      this.countryClickSubject
        .pipe(debounceTime(250))
        .subscribe((clickedId: string) => {
          this.countryClick(clickedId);
        })
    );

    this.subs.push(
      this.dragEndSubject.pipe(debounceTime(350)).subscribe(() => {
        this.isDragging = false;
        this.isAnimating = false;
      })
    );
  }

  /* setter colourScheme
   *
   * updates
   *  - heat rules
   *  - legend
   *  - hover state
   **/
  set colourScheme(colourScheme: MapColourScheme) {
    this._colourScheme = colourScheme;

    this.updateHeatRules(colourScheme.base);

    this.legend.maxColor = colourScheme.base.brighten(1);
    this.legend.minColor = colourScheme.base.brighten(-0.3);

    this.hs.properties.fill = colourScheme.highlight;
    this.hs.properties.stroke = colourScheme.outline;
  }

  get colourScheme(): MapColourScheme {
    return this._colourScheme;
  }

  /** updatePolygonData
   *
   **/
  updatePolygonData(): void {
    if (!this.polygonSeries || !this.mapData) {
      return;
    }
    const data = this.filterResultsData();
    this.polygonSeries.data = data;
    this.polygonSeriesHidden.data = data;
    this.polygonSeries.events.once(
      'datavalidated',
      this.synchroniseLegend.bind(this)
    );
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
  filterResultsData(countries = this.mapCountries): Array<IdValue> {
    return (
      this.mapData
        .filter((nv: IdValue) => {
          return countries.includes(nv.id);
        })
        // this map looks redundant, but it clears out MapPolygon data
        .map((nv: IdValue) => {
          return {
            id: nv.id,
            value: nv.value
          };
        })
    );
  }

  /** setCountryInclusion
   * @param { Array<string> } countries
   * sets the countries to include in the map: isolates single
   * country or restores all countries, triggers a zoom and
   * optionally resets the selectedCountry.
   **/
  setCountryInclusion(countries: Array<string>): void {
    const singleCountry = countries.length === 1;

    if (!singleCountry) {
      this.selectedCountry = undefined;
      this.chart.seriesContainer.draggable = true;
    } else {
      this.chart.seriesContainer.draggable = false;
    }

    this.polygonSeries.include = countries;
    this.polygonSeries.data = this.filterResultsData();

    const fnDataValidated = (): void => {
      if (singleCountry) {
        this.zoomToCountries(countries, ZoomLevel.SINGLE, 0);
      } else {
        this.zoomToCountries(this.boundingCountries, ZoomLevel.MULTIPLE, 0);
      }
    };
    this.polygonSeries.events.once('datavalidated', fnDataValidated);
  }

  /** countryMorph
   * @param { string } newCountry - the country to select
   * assumes single-country mode
   **/
  countryMorph(newCountry: string): void {
    if (this.isAnimating) {
      return;
    }

    const oldCountry = this.polygonSeries.include[0];

    if (this.polygonSeriesHidden.include.length === 1) {
      return;
    }
    if (this.polygonSeries.include.length > 1) {
      return;
    }
    if (oldCountry === newCountry) {
      return;
    }

    this.isAnimating = true;

    // curtail the hidden map to include only the
    this.polygonSeriesHidden.data = [];
    this.polygonSeriesHidden.include = [newCountry];
    this.selectedCountry = newCountry;

    this.polygonSeriesHidden.events.once('validated', (): void => {
      this.countryMorphValidated(oldCountry, newCountry);
    });
  }

  countryMorphValidated(oldCountry: string, newCountry: string): void {
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
  }

  /** countryClick
   * @param { string } country - the clicked country
   * toggles selected setCountryInclusion with (optional animation)
   **/
  countryClick(country: string): void {
    if (this.isAnimating) {
      return;
    }
    if (this.isDragging) {
      this.dragEndSubject.next(true);
      return;
    }

    const singleMode = this.polygonSeries.include.length === 1;

    if (singleMode) {
      // revert back to full map (will invoke zoomTo with instant effect)
      this.setCountryInclusion(this.mapCountries);
    } else {
      this.isAnimating = true;

      // set selection and zoom
      this.legend.hide();
      this.selectedCountry = country;

      const animation = this.zoomToCountries(
        [country],
        ZoomLevel.INTERMEDIATE,
        this.animationTime
      );

      animation.events.on('animationended', (): void => {
        this.setCountryInclusion([country]);
      });
    }
  }

  /** updateHeatRules
   *
   * adds or removes series' heatRules
   **/
  updateHeatRules(colour: am4core.Color): void {
    if (this.polygonSeries.heatRules.length) {
      this.polygonSeries.heatRules.pop();
    }
    this.polygonSeries.heatRules.push({
      property: 'fill',
      target: this.polygonSeries.mapPolygons.template,
      min: colour.brighten(1),
      max: colour.brighten(-0.3)
    });
  }

  /** mapTooltipAdapter
   * customises map item tooltip
   **/
  mapTooltipAdapter(html: string, ev: am4maps.MapPolygon): string {
    const mapData = this.mapData;
    const ctxtId = ev.dataItem.dataContext['id'];
    const dataItem = mapData.find((item) => {
      return item['id'] === ctxtId;
    });
    if (!dataItem) {
      return '{name}';
    } else {
      const suffix = this.mapPercentMode ? '%' : '';
      return (
        '{name}: ' + Number(dataItem.value).toLocaleString('en-GB') + suffix
      );
    }
  }

  /** setMapPercentMode
   * @param { boolean } usePercent
   * sets the variable and adapter for tooltip behaviour
   **/
  setMapPercentMode(usePercent: boolean): void {
    this.mapPercentMode = usePercent;
    this.polygonSeries.mapPolygons.template.adapter.add(
      'tooltipHTML',
      this.mapTooltipAdapter.bind(this)
    );
  }

  setZoomLevels(): void {
    this.chart.maxZoomLevel = 24;
    this.chartHidden.maxZoomLevel = 24;
    this.chart.minZoomLevel = 0.2;
    this.chartHidden.minZoomLevel = 0.2;
  }

  hideGlobe(): void {
    this.chart.show();
    this.chartGlobe.hide();
  }

  showGlobe(): void {
    this.chart.hide();
    this.chartGlobe.show();
    this.animateLatitude();
  }

  animateLatitude(): void {
    this.chartGlobe.deltaLatitude = -45;
    this.chartGlobe.animate(
      { property: 'deltaLatitude', to: 0 },
      12000,
      am4core.ease.circleOut
    );
  }

  /** synchroniseLegend
   *
   **/
  synchroniseLegend(): void {
    const heatLegend = this.legend;
    const hlMin = heatLegend.series.dataItem.values.value.low;
    const hlMinRange = heatLegend.valueAxis.axisRanges.getIndex(0);
    hlMinRange.value = hlMin;
    hlMinRange.label.text = '' + heatLegend.numberFormatter.format(hlMin);

    const hlMax = heatLegend.series.dataItem.values.value.high;
    const hlMaxRange = heatLegend.valueAxis.axisRanges.getIndex(1);
    hlMaxRange.value = hlMax;
    hlMaxRange.label.text = '' + heatLegend.numberFormatter.format(hlMax);
  }

  obtainChart(id: string): am4maps.MapChart {
    return am4core.create(id, am4maps.MapChart);
  }

  // add legend
  addLegend(): void {
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
    legend.events.on('up', () => {
      this.zoomToCountries();
    });
  }

  /** drawChart
   *
   **/
  drawChart(): void {
    am4core.useTheme(am4themes_animated);
    am4core.options.autoDispose = true;

    // Create map instances
    const chart = this.obtainChart('mapChart');
    const chartHidden = this.obtainChart('mapChartHidden');
    const chartGlobe = this.obtainChart('mapChartGlobe');

    this.chart = chart;
    this.chartHidden = chartHidden;
    this.chartGlobe = chartGlobe;
    this.chart.seriesContainer.resizable = false;

    // Set map definition
    chart.geodata = am4geodata_worldHigh;
    chartHidden.geodata = am4geodata_worldHigh;

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

    polygonSeries.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    // Make map load polygon data (state shapes and names) from GeoJSON
    polygonSeries.useGeodata = true;
    polygonSeriesHidden.useGeodata = true;

    this.addLegend();

    // Set up custom heat map legend labels using axis ranges

    const minRange = this.legend.valueAxis.axisRanges.create();
    minRange.label.horizontalCenter = 'left';

    const maxRange = this.legend.valueAxis.axisRanges.create();
    maxRange.label.horizontalCenter = 'right';

    // Bind labels to percent setting

    const fnPct = (val: string): string => {
      return this.mapPercentMode ? `${val}%` : val;
    };

    minRange.label.adapter.add('text', fnPct);
    maxRange.label.adapter.add('text', fnPct);

    // Blank out internal heat legend value axis labels

    this.legend.valueAxis.renderer.labels.template.adapter.add(
      'text',
      function (_: string) {
        return '';
      }
    );

    this.setZoomLevels();

    // Bind series to country click

    polygonSeries.mapPolygons.template.events.on('hit', (ev) => {
      const clickedId = ev.target.dataItem.dataContext['id'];
      this.countryClickSubject.next(clickedId);
    });

    // Configure series tooltip
    const polygonTemplate = polygonSeries.mapPolygons.template;

    this.setMapPercentMode(false);
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeWidth = 0.5;
    polygonTemplate.focusable = false;

    // Create hover state
    this.hs = polygonTemplate.states.create('hover');
    this.hs.properties.strokeWidth = 2.5;

    this.updatePolygonData();
    this.colourScheme = this.colourSchemeDefault;

    this.sprites = [
      chart,
      chart.seriesContainer,
      chart.chartContainer.background,
      polygonSeries.mapPolygons.template
    ];

    this.sprites.forEach((sprite: am4core.Sprite) => {
      sprite.events.disableType('doublehit');
      sprite.events.disableType('swipe');
    });

    chart.zoomLevel = 1;

    chart.events.on('over', () => {
      if (this.polygonSeries.include.length > 1) {
        this.legend.show();
      }
    });

    chart.events.on('out', () => {
      this.legend.hide();
    });

    chart.events.on('ready', () => {
      const [n, s, e, w] = this.getBoundingCoords(this.mapCountries);
      this.mapHeight = n - s;
      this.mapWidth = e - w;
      this.zoomToCountries();
      chart.series.template.fill = am4core.color('#ffee00');
    });

    chart.seriesContainer.events.on('dragstart', () => {
      this.isDragging = true;
      this.isAnimating = true;
    });

    chart.seriesContainer.events.on('dragstop', () => {
      this.dragEndSubject.next(true);
    });

    chartGlobe.events.on('ready', () => {
      this.hideGlobe();

      chartGlobe.deltaLongitude = -45;
      chartGlobe.projection = new am4maps.projections.Orthographic();
      chartGlobe.series.push(new am4maps.MapPolygonSeries()).useGeodata = true;
      chartGlobe.seriesContainer.resizable = false;
      chartGlobe.seriesContainer.draggable = false;

      chartGlobe.animate({ property: 'deltaLongitude', to: 100050 }, 20000000);

      setTimeout(() => {
        chartGlobe.geodata = am4geodata_worldHigh;
        const label = chartGlobe.chartAndLegendContainer.createChild(
          am4core.Label
        );
        label.text = 'location unknown';
        label.fontSize = 20;
        label.fontWeight = 'bold';
        label.align = 'center';
        label.fill = am4core.color('#4d4d4d');
        label.padding(110, 0, 0, 0);
      }, this.animationTime);
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
    const zoomLevelSingle = 0.8;
    const zoomLevelMultiple = 3;

    const [north, south, east, west] = this.getBoundingCoords(zoomTo);

    if (zoomLevelIn === ZoomLevel.SINGLE) {
      zoomLevel = zoomLevelSingle;
      if (aspectRatioChart > 2.4) {
        zoomLevel = 0.75;
      }
      if (aspectRatioChart > 3.4) {
        zoomLevel = 0.725;
      }
    } else if (zoomLevelIn === ZoomLevel.MULTIPLE) {
      zoomLevel = zoomLevelMultiple;
    } else {
      zoomLevel = 1;
    }

    // pre-zoom to re-validate the position
    this.chart.zoomLevel = this.chart.zoomLevel * 1.01;

    const res = this.chart.zoomToRectangle(
      north,
      east,
      south,
      west,
      zoomLevel,
      true,
      duration
    );

    if (duration === 0) {
      this.isAnimating = false;
    }

    res.events.on('animationstopped', () => {
      this.isAnimating = false;
    });

    res.events.on('animationended', () => {
      this.isAnimating = false;
    });

    return res;
  }
}

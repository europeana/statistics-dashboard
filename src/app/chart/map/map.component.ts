import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';
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
export class MapComponent {
  @Output() mapCountrySet = new EventEmitter<boolean>();

  _mapData: Array<IdValue>;
  chart: am4maps.MapChart;
  chartHidden: am4maps.MapChart;
  polygonSeries: am4maps.MapPolygonSeries;
  polygonSeriesHidden: am4maps.MapPolygonSeries;
  legend: am4maps.HeatLegend;
  hs: am4core.SpriteState<am4core.IPolygonProperties, am4core.IPolygonAdapters>;

  mapHeight: number;
  mapWidth: number;

  animationTime = 750;
  boundingCountries = ['IS', 'TR', 'ES', 'NO'];
  mapCountries = [];

  selectedCountryNext?: string;
  selectedCountryPrev?: string;
  _selectedCountry?: string;
  selectedIndex: number;

  _isAnimating = false;

  set isAnimating(isAnimating: boolean) {
    this.log('set isAnimating(' + isAnimating + ')');

    if (isAnimating === this.isAnimating) {
      this.log('set returns early same val ' + isAnimating);
      return;
    }

    this._isAnimating = isAnimating;
    if (this.isAnimating) {
      this.chart.events.disableType('hit');
      this.chart.seriesContainer.events.disableType('hit');
      this.chart.chartContainer.background.events.disableType('hit');
      this.polygonSeries.mapPolygons.template.events.disableType('hit');

      this.chart.seriesContainer.draggable = false;
      this.log(' - set drag off');
    } else {
      this.chart.events.enableType('hit');
      this.chart.seriesContainer.events.enableType('hit');
      this.chart.chartContainer.background.events.enableType('hit');
      this.polygonSeries.mapPolygons.template.events.enableType('hit');
    }
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

  constructor() {
    am4core.options.autoDispose = true;

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
    this.polygonSeries.include = countries;
    this.polygonSeries.data = this.filterResultsData();
    this.polygonSeries.events.once('datavalidated', () => {
      if (countries.length === 1) {
        this.zoomToCountries(countries, ZoomLevel.SINGLE, 0);

        this.log('SCI disables drag');
        this.chart.seriesContainer.draggable = false;
      } else {
        this.log('SCI enables drag');
        this.chart.seriesContainer.draggable = true;

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
    if (this.isAnimating) {
      return;
    }

    const oldCountry = this.polygonSeries.include[0];
    if (this.polygonSeriesHidden.include.length === 1) {
      this.log('countryMorph exit: animating!');
      return;
    }
    if (this.polygonSeries.include.length > 1) {
      this.log('countryMorph exit: not in single country mode');
      return;
    }
    if (oldCountry === newCountry) {
      this.log('countryMorph exit: old and new are the same: ' + oldCountry);
      return;
    }

    this.log('countryMorph sets animating to true...');
    this.isAnimating = true;

    // curtail the hidden map to include only the
    this.polygonSeriesHidden.data = [];
    this.polygonSeriesHidden.include = [newCountry];
    this.selectedCountry = newCountry;

    this.polygonSeriesHidden.events.once('validated', () => {
      this.log('countryMorph hidden once validated...');

      const polyHidden = this.polygonSeriesHidden.mapPolygons.getIndex(0);
      const poly = this.polygonSeries.getPolygonById(oldCountry);

      const morphAnimationEnded = (): void => {
        // reset the hidden / update the actual
        this.polygonSeriesHidden.data = [];
        this.polygonSeriesHidden.include = this.mapCountries;
        setTimeout(() => {
          this.log('morphAnimationEnded (setTimeout) call sci ' + newCountry);
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
        this.log('WE HAVE NO POLY ' + newCountry + ' / ' + oldCountry);
        morphAnimationEnded();
      }
    });
  }

  log(s: string): void {
    console.log(s);
  }

  /** countryClick
   * @param { string } country - the clicked country
   * toggles selected setCountryInclusion with (optional animation)
   **/
  countryClick(country: string): void {
    if (this.isAnimating) {
      this.log('return countryClick isAnimating');
      return;
    }

    const singleMode = this.polygonSeries.include.length === 1;
    if (singleMode) {
      // revert back to full map (will invoke zoomTo with instant effect)
      this.setCountryInclusion(this.mapCountries);
    } else {
      this.log('countryClick sets animating to true...');

      this.isAnimating = true;

      // set selection and zoom
      this.legend.hide();
      this.selectedCountry = country;
      const animation = this.zoomToCountries(
        [country],
        ZoomLevel.INTERMEDIATE,
        this.animationTime
      );

      const fn = (): void => {
        this.setCountryInclusion([country]);
      };
      animation.events.on('animationended', fn);
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

  /** setPercentMode
   * @param { boolean } percent - sets tooltip behaviour
   **/
  setPercentMode(usePercent: boolean): void {
    const polygonTemplate = this.polygonSeries.mapPolygons.template;
    const suffix = usePercent ? ' %' : '';
    polygonTemplate.tooltipText = '{name}: {value}' + suffix;
  }

  /** drawChart
   *
   **/
  drawChart(): void {
    const countryClick = this.countryClick.bind(this);

    am4core.useTheme(am4themes_animated);
    am4core.options.autoDispose = true;

    // Create map instance
    const chart = am4core.create('mapChart', am4maps.MapChart);
    const chartHidden = am4core.create('mapChartHidden', am4maps.MapChart);
    this.chart = chart;
    this.chartHidden = chartHidden;
    this.chart.seriesContainer.resizable = false;

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

    polygonSeries.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    // Make map load polygon data (state shapes and names) from GeoJSON
    polygonSeries.useGeodata = true;
    polygonSeriesHidden.useGeodata = true;

    this.chart.events.disableType('doublehit');
    this.chart.seriesContainer.events.disableType('doublehit');
    this.chart.chartContainer.background.events.disableType('doublehit');
    this.polygonSeries.mapPolygons.template.events.disableType('doublehit');

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
    legend.events.on('up', () => {
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

    this.setPercentMode(false);
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeWidth = 0.5;

    // Create hover state
    this.hs = polygonTemplate.states.create('hover');
    this.hs.properties.strokeWidth = 2.5;

    this.updatePolygonData();
    this.colourScheme = this.colourSchemeDefault;

    chart.zoomLevel = 1;
    chart.events.on('ready', () => {
      const [n, s, e, w] = this.getBoundingCoords(this.mapCountries);
      this.mapHeight = n - s;
      this.mapWidth = e - w;
      this.zoomToCountries();
      chart.series.template.fill = am4core.color('#ffee00');
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
      //this.log('aspectRatioChart single ' + aspectRatioChart);

      zoomLevel = zoomLevelSingle;
      if (aspectRatioChart > 2.4) {
        this.log('correct single');
        zoomLevel = 0.75;
      }
      if (aspectRatioChart > 3.4) {
        this.log('correct single ++');
        zoomLevel = 0.725;
      }
    } else if (zoomLevelIn === ZoomLevel.MULTIPLE) {
      zoomLevel = zoomLevelMultiple;
    } else {
      const selectionHeight = north - south;
      const aspectRatioSelection = (east - west) / selectionHeight;

      //aspectRatioChart = this.chart.pixelWidth / this.chart.pixelHeight;
      const aspectRatioCombined =
        this.chart.pixelWidth /
        (east - west) /
        (this.chart.pixelHeight / selectionHeight);

      this.log('aspectRatioChart\t\t' + aspectRatioChart.toFixed(2));
      this.log('aspectRatioSelection\t\t' + aspectRatioSelection.toFixed(2));
      this.log('aspectRatioCombined\t\t' + aspectRatioCombined.toFixed(2));

      /*

      // SLOVAKIA
      aspectRatioChart		  3.498181818181818
      aspectRatioSelection	3.0945371279031675
      aspectRatioCombined		1.130437824332118

      // TURKEY
      aspectRatioChart		  3.498181818181818
      aspectRatioSelection	3.0055379493581755
      aspectRatioCombined		1.1639120440747872

      the fact that slovakia is fine and turkey is not means it's more to do with size!
      */

      /*
      //
      const getRatio = (tgt: number, val: number, rec = 0): number => {
        const half = val / 2;
        if (tgt > val) {
          return 0;
        }
        if (tgt > half) {
          return Math.max(rec, 1) + ((val / tgt) % 1);
          //return Math.max(rec, 1) + ((val / tgt) % 1);
        }
        return getRatio(tgt, half, rec + 1);
      };

      zoomLevel = getRatio(selectionHeight, this.mapHeight);
      //zoomLevel = zoomLevelSingle * zoomLevel;
      // zoomLevel -= aspectRatioSelection / aspectRatioChart;
      let finalSutraction = aspectRatioChart / aspectRatioSelection;
      let finalSutractionAlt = Math.min(aspectRatioChart, aspectRatioSelection) / aspectRatioChart;
      //zoomLevel -= finalSutraction;

      this.log('aspectRatioChart: ' + aspectRatioChart + '\nspectRatioSelection = ' + aspectRatioSelection + '...');

      */
      //this.log('... = finalSutraction = ' + finalSutraction.toFixed(2));
      //this.log('... = finalSutractionAlt = ' + finalSutractionAlt.toFixed(2));
      //this.log('... = zoomLevel to subtract from = ' + zoomLevel.toFixed(2));

      //zoomLevel -= finalSutractionAlt;
      zoomLevel = 1;

      //  zoomLevel = zoomLevel / finalSutraction;//Math.min(aspectRatioSelection, aspectRatioChart);

      //zoomLevel -= aspectRatioChart;// / aspectRatioSelection;
      //    zoomLevel -= Math.max(aspectRatioSelection, aspectRatioChart);
      //  zoomLevel = Math.max(1, zoomLevel);
    }

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
      this.log('zoomTo empty duration falsifies');
      this.isAnimating = false;
    }
    //this.isAnimating = false;

    res.events.on('animationstopped', () => {
      if (this.isAnimating) {
        this.log('zoomTo animationstopped');
        this.isAnimating = false;
      }
    });

    res.events.on('animationended', () => {
      this.log('zoomTo animationended');
      this.isAnimating = false;
    });

    return res;
  }
}

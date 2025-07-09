import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';

import { APIService } from '../../_services';
import { MockAPIService, MockMapChart } from '../../_mocked';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MapComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: APIService, useClass: MockAPIService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    expect(component.obtainChart('mapChart')).toBeTruthy();
    spyOn(component, 'obtainChart').and.callFake(() => {
      return MockMapChart;
    });
    component.mapData = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should synchronise the legend', () => {
    component.legend = MockMapChart.createChild(am4maps.HeatLegend);
    spyOn(component.legend.valueAxis.axisRanges, 'getIndex').and.callThrough();
    component.synchroniseLegend();
    expect(component.legend.valueAxis.axisRanges.getIndex).toHaveBeenCalled();
  });

  it('should hide the globe', () => {
    spyOn(component.chart, 'show');
    spyOn(component.chartGlobe, 'hide');
    component.hideGlobe();
    expect(component.chart.show).toHaveBeenCalled();
    expect(component.chartGlobe.hide).toHaveBeenCalled();
  });

  it('should show the globe', () => {
    spyOn(component.chart, 'hide');
    spyOn(component.chartGlobe, 'show');
    spyOn(component.chartGlobe, 'animate');

    component.showGlobe();
    expect(component.chart.hide).toHaveBeenCalled();
    expect(component.chartGlobe.show).toHaveBeenCalled();
    expect(component.chartGlobe.animate).toHaveBeenCalled();
  });

  it('should update the data', () => {
    component.mapCountries = [];
    component.mapData = [{ id: 'IT', value: 1881 }];
    expect(component.mapCountries.length).toBeGreaterThan(0);
  });

  it('should track the selected country', () => {
    spyOn(component, 'hideGlobe');
    spyOn(component, 'showGlobe');
    component.mapData = [{ id: 'IT', value: 1881 }];

    spyOn(component.mapCountrySet, 'emit');

    expect(component.selectedCountry).toBeFalsy();

    component.selectedCountry = 'IT';

    expect(component.mapCountrySet.emit).toHaveBeenCalledWith(true);

    component.selectedCountry = undefined;

    expect(component.mapCountrySet.emit).toHaveBeenCalledWith(false);
    expect(component.hideGlobe).toHaveBeenCalled();
    expect(component.showGlobe).not.toHaveBeenCalled();

    component.selectedCountry = component.countryUnknown;
    expect(component.showGlobe).toHaveBeenCalled();
  });

  it('should generate the polygon series', () => {
    component.polygonSeries = null;
    expect(component.polygonSeries).toBeFalsy();
    component.drawChart();
    expect(component.polygonSeries).not.toBeFalsy();
    expect(component.polygonSeries.data.length).toEqual(0);
  });

  it('should update the heat rules', () => {
    component.polygonSeries = {
      heatRules: [],
      mapPolygons: {
        template: {}
      }
    } as unknown as am4maps.MapPolygonSeries;

    component.updateHeatRules(am4core.color('#F00'));
    expect(component.polygonSeries.heatRules.length).toBeTruthy();
    expect(`${component.polygonSeries.heatRules[0].min}`).toEqual('#ff1919');
    expect(`${component.polygonSeries.heatRules[0].max}`).toEqual('#ba0000');
    component.updateHeatRules(am4core.color('#00F'));
    expect(`${component.polygonSeries.heatRules[0].min}`).toEqual('#1919ff');
    expect(`${component.polygonSeries.heatRules[0].max}`).toEqual('#0000ba');
  });

  it('should update the heat rules when the colour scheme is set', () => {
    spyOn(component, 'updateHeatRules');
    const colour = '#ffffff';
    const scheme = {
      base: am4core.color(colour),
      highlight: am4core.color(colour),
      outline: am4core.color(colour)
    };

    expect(component.colourScheme.base.hex).not.toEqual(colour);
    component.colourScheme = scheme;
    expect(component.colourScheme.base.hex).toEqual(colour);

    expect(component.updateHeatRules).toHaveBeenCalled();
  });

  it('should add tooltips to the countries', () => {
    const clicked = {
      dataItem: { dataContext: { id: 'IT' } }
    } as unknown as am4maps.MapPolygon;
    let res = component.mapTooltipAdapter('default', clicked);
    expect(res).toEqual('{name}');

    component.mapData = [{ id: 'IT', value: 1881 }];
    res = component.mapTooltipAdapter('default', clicked);
    expect(res).toEqual('{name}: 1,881');

    component.mapPercentMode = true;
    res = component.mapTooltipAdapter('default', clicked);
    expect(res).toEqual('{name}: 1,881%');
  });

  it('should debounce clicks on the country', fakeAsync(() => {
    spyOn(component, 'countryClick');
    component.countryClickSubject.next('IT');
    tick(component.animationTime);
    expect(component.countryClick).toHaveBeenCalled();
    tick(component.animationTime);
  }));

  it('should debounce dragging', fakeAsync(() => {
    component.isDragging = true;
    component.dragEndSubject.next(true);
    tick(350);
    expect(component.isDragging).toBeFalsy();
  }));

  it('should handle clicks on the country', () => {
    spyOn(component, 'setCountryInclusion');
    spyOn(component, 'hideGlobe');

    component.drawChart();
    expect(component.selectedCountry).toBeFalsy();

    const country = 'IT';
    component.isAnimating = true;
    component.isDragging = true;

    component.countryClick(country);
    component.isAnimating = false;

    expect(component.selectedCountry).toBeFalsy();

    component.countryClick(country);
    expect(component.selectedCountry).toBeFalsy();

    component.isDragging = false;
    component.countryClick(country);
    expect(component.selectedCountry).toEqual(country);
    expect(component.setCountryInclusion).not.toHaveBeenCalled();

    component.isDragging = false;
    component.isAnimating = false;
    component.polygonSeries = {
      getPolygonById: (_: string) => {
        return null;
      },
      include: {
        length: 1
      }
    } as unknown as am4maps.MapPolygonSeries;

    component.countryClick(country);
    expect(component.setCountryInclusion).toHaveBeenCalled();
    expect(component.hideGlobe).toHaveBeenCalled();
  });

  it('should track which countries are shown', () => {
    spyOn(component, 'hideGlobe');
    component.mapData = [{ id: 'IT', value: 1881 }];
    spyOn(component.polygonSeries.events, 'once');

    component.selectedCountry = 'DE';
    component.setCountryInclusion(['DE', 'IT']);

    expect(component.polygonSeries.events.once).toHaveBeenCalled();
    expect(component.selectedCountry).toBeFalsy();
    expect(component.hideGlobe).toHaveBeenCalled();
  });

  it('should validate the morph', () => {
    component.drawChart();
    fixture.detectChanges();
    spyOn(component.polygonSeries, 'getPolygonById').and.callThrough();
    spyOn(component.polygonSeriesHidden.mapPolygons, 'getIndex');

    component.setCountryInclusion(['IT', 'EU']);
    component.countryMorphValidated('EU', 'FR');

    expect(component.polygonSeries.getPolygonById).toHaveBeenCalled();

    component.countryMorphValidated('FR', 'DE');
    expect(component.polygonSeries.getPolygonById).toHaveBeenCalledTimes(2);
  });

  it('should morph', () => {
    spyOn(component, 'hideGlobe');
    component.mapData = [{ id: 'IT', value: 1881 }];
    component.setCountryInclusion(['IT', 'DE']);

    expect(component.selectedCountry).toEqual(undefined);

    component.isAnimating = true;
    component.countryMorph('DE');

    expect(component.selectedCountry).not.toEqual('DE');

    component.isAnimating = false;
    component.countryMorph('DE');

    expect(component.selectedCountry).not.toEqual('DE');

    component.isAnimating = false;
    component.setCountryInclusion(['IT']);
    component.countryMorph('IT');
    expect(component.selectedCountry).not.toEqual('DE');

    spyOn(component, 'countryMorphValidated');
    spyOn(component.polygonSeriesHidden.events, 'once').and.callFake(((
      a: string,
      callBack: (event: string, b: string) => void
    ) => {
      callBack('', '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any);

    component.setCountryInclusion(['IT']);
    component.countryMorph('DE');

    expect(component.selectedCountry).toEqual('DE');
    expect(component.hideGlobe).toHaveBeenCalledTimes(2);
    expect(component.countryMorphValidated).toHaveBeenCalled();

    component.isAnimating = false;
    component.polygonSeriesHidden = MockMapChart.series.push(
      new am4maps.MapPolygonSeries()
    );
    component.polygonSeriesHidden.include = ['FR'];

    expect(component.hideGlobe).toHaveBeenCalledTimes(2);
    expect(component.selectedCountry).toEqual('DE');
  });
});

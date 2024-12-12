import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import * as am4core from '@amcharts/amcharts4/core';

import { APIService } from '../../_services';
import { MockAPIService } from '../../_mocked';

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
    component.mapData = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the data', () => {
    component.mapCountries = [];
    component.mapData = [{ id: 'IT', value: 1881 }];
    expect(component.mapCountries.length).toBeGreaterThan(0);
  });

  it('should track if animating', () => {
    component.mapData = [{ id: 'IT', value: 1881 }];

    spyOn(component.chart.events, 'enableType');
    spyOn(component.chart.events, 'disableType');

    component.isAnimating = true;

    expect(component.chart.events.disableType).toHaveBeenCalled();
    expect(component.chart.events.enableType).not.toHaveBeenCalled();

    component.isAnimating = true;

    expect(component.chart.events.disableType).toHaveBeenCalledTimes(1);
    expect(component.chart.events.enableType).not.toHaveBeenCalled();

    component.isAnimating = false;

    expect(component.chart.events.disableType).toHaveBeenCalledTimes(1);
    expect(component.chart.events.enableType).toHaveBeenCalled();

    component.isAnimating = false;

    expect(component.chart.events.disableType).toHaveBeenCalledTimes(1);
    expect(component.chart.events.enableType).toHaveBeenCalledTimes(1);
  });

  it('should track the selected country', () => {
    component.mapData = [{ id: 'IT', value: 1881 }];

    spyOn(component.mapCountrySet, 'emit');

    expect(component.selectedCountry).toBeFalsy();

    component.selectedCountry = 'IT';

    expect(component.mapCountrySet.emit).toHaveBeenCalledWith(true);

    component.selectedCountry = undefined;

    expect(component.mapCountrySet.emit).toHaveBeenCalledWith(false);
  });

  it('should generate the polygon series', () => {
    component.polygonSeries = null;
    expect(component.polygonSeries).toBeFalsy();
    component.drawChart();
    fixture.detectChanges();
    expect(component.polygonSeries).not.toBeFalsy();
    expect(component.polygonSeries.data.length).toEqual(0);
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

  it('should track which countries are shown', () => {
    component.mapData = [{ id: 'IT', value: 1881 }];
    spyOn(component.polygonSeries.events, 'once');

    component.selectedCountry = 'DE';
    component.setCountryInclusion(['DE', 'IT']);

    expect(component.polygonSeries.events.once).toHaveBeenCalled();
    expect(component.selectedCountry).toBeFalsy();
  });

  it('should morph', () => {
    component.mapData = [{ id: 'IT', value: 1881 }];
    component.setCountryInclusion(['IT', 'DE']);

    expect(component.selectedCountry).toEqual(undefined);

    component.isAnimating = true;
    component.countryMorph('DE');

    expect(component.selectedCountry).not.toEqual('DE');

    component.isAnimating = false;
    component.countryMorph('DE');

    expect(component.selectedCountry).not.toEqual('DE');

    component.setCountryInclusion(['IT']);
    component.countryMorph('IT');
    expect(component.selectedCountry).not.toEqual('DE');

    component.setCountryInclusion(['IT']);
    component.countryMorph('DE');

    expect(component.selectedCountry).toEqual('DE');
  });
});

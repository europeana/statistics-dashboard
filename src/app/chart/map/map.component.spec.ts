import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

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
    expect(component.polygonSeries.data.length).toEqual(0);
    component.mapData = [{ id: 'Italy', value: 1881 }];
    component.updateData();
    expect(component.polygonSeries.data.length).toEqual(1);
  });

  it('should generate the polygon series', () => {
    component.polygonSeries = null;
    component.updateData();
    expect(component.polygonSeries).toBeFalsy();
    component.drawChart();
    fixture.detectChanges();
    expect(component.polygonSeries.data.length).toEqual(0);
  });
});

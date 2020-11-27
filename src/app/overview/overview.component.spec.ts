import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { Facet, HeaderNameType } from '../_models';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  const testOptions = ['option_1', 'option_2'];

  const getTestFacetData = (): Array<Facet> => {
    return [1, 2, 3].map((i) => {
      const item = {
        name: `${i}`,
        fields: [
          {
            count: i,
            label: 'count' as HeaderNameType,
          },
        ],
      };
      return item;
    });
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [OverviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unfix the name', () => {
    expect(component.unfixName('_____')).toEqual('.');
  });

  it('should find the facet index', () => {
    const testName = '3';
    const testData = getTestFacetData();
    expect(component.findFacetIndex(testName, testData)).toEqual(2);
  });

  it('should find the facet index', () => {
    expect(component.getSelectOptions('2', getTestFacetData())).toBeTruthy();
  });

  it('should get the url for a row', () => {
    const qfVal = 'contentTier';
    expect(component.getUrlRow(qfVal).indexOf(qfVal)).toBeTruthy();
  });

  it('should add menu checkboxes', () => {
    const testName = 'test';
    const form = component.form;

    testOptions.forEach((s: string) => {
      expect(form.get(`${testName}.${s}`)).toBeFalsy();
    });

    form.addControl(testName, new FormBuilder().group({}));
    component.addMenuCheckboxes(testName, testOptions);

    testOptions.forEach((s: string) => {
      expect(form.get(`${testName}.${s}`)).toBeTruthy();
    });

    component.addMenuCheckboxes(testName, testOptions);

    testOptions.forEach((s: string) => {
      expect(form.get(`${testName}.${s}`)).toBeTruthy();
    });
  });

  it('should toggle the filter menu', () => {
    const gName = 'PROVIDER';
    component.addMenuCheckboxes(gName, testOptions);
    expect(component.menuStates[gName].visible).toBeFalsy();
    component.toggleFilterMenu(gName);
    expect(component.menuStates[gName].visible).toBeTruthy();
  });

  it('should toggle the chart options', () => {
    component.downloadOptionsOpen = true;
    component.chartOptionsOpen = true;
    component.toggleChartOptions();
    expect(component.downloadOptionsOpen).toBeFalsy();
    expect(component.chartOptionsOpen).toBeFalsy();
    component.toggleChartOptions();
    expect(component.downloadOptionsOpen).toBeFalsy();
    expect(component.chartOptionsOpen).toBeTruthy();
  });

  it('should toggle the download options', () => {
    component.chartOptionsOpen = true;
    component.downloadOptionsOpen = true;
    component.toggleDownloadOptions();
    expect(component.chartOptionsOpen).toBeFalsy();
    expect(component.downloadOptionsOpen).toBeFalsy();
    component.toggleDownloadOptions();
    expect(component.chartOptionsOpen).toBeFalsy();
    expect(component.downloadOptionsOpen).toBeTruthy();
  });

  it('should close the display options', () => {
    component.chartOptionsOpen = true;
    component.downloadOptionsOpen = true;
    component.closeDisplayOptions();
    expect(component.chartOptionsOpen).toBeFalsy();
    expect(component.downloadOptionsOpen).toBeFalsy();
  });

  it('should switch the chart type', () => {
    expect(component.showPie).toBeTruthy();

    component.form.get('chartType').setValue('Bar');
    component.switchChartType();

    expect(component.showPie).toBeFalsy();
    expect(component.showBar).toBeTruthy();

    component.form.get('chartType').setValue('Gauge');
    component.switchChartType();

    expect(component.showBar).toBeFalsy();
    expect(component.showGauge).toBeTruthy();

    component.form.get('chartType').setValue('Pie');
    component.switchChartType();

    expect(component.showPie).toBeTruthy();
    expect(component.showGauge).toBeFalsy();
  });
});

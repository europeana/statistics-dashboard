import { ElementRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  createMockPipe,
  MockAPIService,
  MockAPIServiceErrors,
  MockExportPDFService
} from '../_mocked';
import { ExportType, Facet, HeaderNameType } from '../_models';
import { APIService, ExportPDFService } from '../_services';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  const testOptions = ['option_1', 'option_2'];
  let exportPDF: ExportPDFService;

  const configureTestBed = (errorMode = false) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [OverviewComponent, createMockPipe('renameApiFacet')],
      providers: [
        { provide: ExportPDFService, useClass: MockExportPDFService },
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        }
      ]
    }).compileComponents();
  };

  const b4Each = () => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    exportPDF = TestBed.inject(ExportPDFService);
    fixture.detectChanges();
  };

  describe('Normal Operations', () => {
    beforeEach(async(() => {
      configureTestBed();
    }));

    beforeEach(b4Each);

    it('should unfix the name', () => {
      expect(component.unfixName('_____')).toEqual('.');
    });

    it('should find the facet index', () => {
      component.facetConf.forEach((facet: string, i: number) => {
        expect(component.findFacetIndex(facet, component.allFacetData)).toEqual(
          i
        );
      });
    });

    it('should get the select options', () => {
      component.facetConf.forEach((facet: string, i: number) => {
        expect(
          component.getSelectOptions(facet, component.allFacetData).length
        ).toBeGreaterThan(0);
      });
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

    it('should export CSV', () => {
      const elDownload = document.createElement('a');
      document.body.append(elDownload);
      component.downloadAnchor = { nativeElement: elDownload } as ElementRef;
      component.export(ExportType.CSV);
    });

    it('should export PDF', () => {
      spyOn(exportPDF, 'getChartAsImageUrl').and.callThrough();
      component.export(ExportType.PDF);
      expect(exportPDF.getChartAsImageUrl).toHaveBeenCalled();
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

  describe('No data', () => {
    beforeEach(async(() => {
      configureTestBed(true);
    }));

    beforeEach(b4Each);

    it('should switch the chart type', () => {
      expect(component.totalResults).toEqual(0);
    });
  });
});

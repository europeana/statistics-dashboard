import { ElementRef } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { ExportComponent } from '.';

import { MockExportCSVService, MockExportPDFService } from '../_mocked';
import { ExportType, FmtTableData } from '../_models';
import { ExportCSVService } from '../_services';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;
  let exportCSV: ExportCSVService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExportComponent],
      providers: [{ provide: ExportCSVService, useClass: MockExportCSVService }]
    }).compileComponents();
    exportCSV = TestBed.inject(ExportCSVService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;

    component.getGridData = (): FmtTableData => {
      return {
        columns: [],
        tableRows: []
      };
    };

    component.getChartData = (): Promise<string> => {
      return new Promise((resolve) => {
        resolve(null);
      });
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy', fakeAsync(() => {
    (component.contentRef.nativeElement as HTMLInputElement).value = 'some-url';
    component.copy();
    fixture.detectChanges();
    expect(
      component.contentRef.nativeElement.classList.contains('copied')
    ).toBeTruthy();
    expect(component.copied).toBeTruthy();
    tick(component.msMsgDisplay);
    expect(component.copied).toBeFalsy();
  }));

  it('should export CSV', () => {
    spyOn(exportCSV, 'download');
    const elDownload = document.createElement('a');
    document.body.append(elDownload);
    component.downloadAnchor = { nativeElement: elDownload } as ElementRef;
    component.export(ExportType.CSV);
    expect(exportCSV.download).toHaveBeenCalled();
  });

  it('should export PDF', () => {
    spyOn(component, 'getChartData').and.callFake(() => {
      return new Promise((resolve) => {
        resolve(MockExportPDFService.imgDataURL);
      }) as Promise<string>;
    });
    component.export(ExportType.PDF);
    expect(component.getChartData).toHaveBeenCalled();
  });

  it('should export PNG', () => {
    spyOn(component, 'getChartData').and.callFake(() => {
      return new Promise((resolve) => {
        resolve(MockExportPDFService.imgDataURL);
      }) as Promise<string>;
    });
    component.export(ExportType.PNG);
    expect(component.getChartData).toHaveBeenCalled();
  });

  it('should export only known types', () => {
    spyOn(component, 'getChartData').and.callThrough();
    component.export('XXX' as unknown as ExportType);
    expect(component.getChartData).not.toHaveBeenCalled();
  });

  it('should toggle the active status', () => {
    expect(component.active).toBeFalsy();
    component.toggleActive();
    expect(component.active).toBeTruthy();
  });
});

import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportComponent } from '.';

import { MockExportCSVService } from '../_mocked';
import { ExportType, FmtTableData } from '../_models';
import { ExportCSVService } from '../_services';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;
  let exportCSV: ExportCSVService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExportComponent],
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
        resolve('image-data');
      });
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy', () => {
    (component.contentRef.nativeElement as HTMLInputElement).value = 'some-url';
    component.copy();
    fixture.detectChanges();
    expect(
      component.contentRef.nativeElement.classList.contains('copied')
    ).toBeTruthy();
  });

  it('should export CSV', () => {
    spyOn(exportCSV, 'download');
    const elDownload = document.createElement('a');
    document.body.append(elDownload);
    component.downloadAnchor = { nativeElement: elDownload } as ElementRef;
    component.export(ExportType.CSV);
    expect(exportCSV.download).toHaveBeenCalled();
  });

  it('should export PDF', () => {
    spyOn(component, 'getChartData').and.callThrough();
    component.export(ExportType.PDF);
    expect(component.getChartData).toHaveBeenCalled();
  });
});

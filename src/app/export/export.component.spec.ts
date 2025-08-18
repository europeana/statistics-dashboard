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
    jest.spyOn(navigator.clipboard, 'writeText');
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
    const spyDownload = jest.spyOn(exportCSV, 'download');
    const elDownload = document.createElement('a');
    document.body.append(elDownload);
    component.downloadAnchor = { nativeElement: elDownload } as ElementRef;
    component.export(ExportType.CSV);
    expect(spyDownload).toHaveBeenCalled();
  });

  it('should export PDF', () => {
    const spyGetChartData = jest
      .spyOn(component, 'getChartData')
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(MockExportPDFService.imgDataURL);
        }) as Promise<string>;
      });
    component.export(ExportType.PDF);
    expect(spyGetChartData).toHaveBeenCalled();
  });

  it('should export PNG', () => {
    const spyGetChartData = jest
      .spyOn(component, 'getChartData')
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(MockExportPDFService.imgDataURL);
        }) as Promise<string>;
      });
    component.export(ExportType.PNG);
    expect(spyGetChartData).toHaveBeenCalled();
  });

  it('should export only known types', () => {
    const spyGetChartData = jest.spyOn(component, 'getChartData');
    component.export('XXX' as unknown as ExportType);
    expect(spyGetChartData).not.toHaveBeenCalled();
  });

  it('should toggle the active status', () => {
    expect(component.active).toBeFalsy();
    expect(component.tabIndex).toEqual(-1);
    expect(component.openedFromToolbar).toBeFalsy();

    component.toggleActive();
    expect(component.active).toBeTruthy();
    expect(component.tabIndex).toEqual(0);
    expect(component.openedFromToolbar).toBeFalsy();

    component.toggleActive();
    expect(component.active).toBeFalsy();
    expect(component.tabIndex).toEqual(-1);
    expect(component.openedFromToolbar).toBeFalsy();

    component.toggleActive(true);
    expect(component.active).toBeTruthy();
    expect(component.tabIndex).toEqual(0);
    expect(component.openedFromToolbar).toBeTruthy();
  });

  it('should supply a custom hide function', () => {
    const spyToggleActive = jest.spyOn(component, 'toggleActive');
    component.fnHide();
    expect(spyToggleActive).toHaveBeenCalled();
  });
});

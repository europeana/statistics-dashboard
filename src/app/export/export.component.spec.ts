import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportComponent } from '.';

import { MockExportCSVService, MockExportPDFService } from '../_mocked';
import { ExportType, FmtTableData } from '../_models';
import { ExportCSVService } from '../_services';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;
  let exportCSV: ExportCSVService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExportComponent],
      providers: [{ provide: ExportCSVService, useClass: MockExportCSVService }]
    }).compileComponents();
    exportCSV = TestBed.inject(ExportCSVService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('getGridData', (): FmtTableData => {
      return { columns: [], tableRows: [] };
    });

    fixture.componentRef.setInput('getChartTitle', (): string => {
      return 'title';
    });

    fixture.componentRef.setInput('getChartData', (): Promise<string> => {
      return Promise.resolve(null);
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy', () => {
    jest.useFakeTimers();
    jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockImplementation(() => Promise.resolve());

    (component.contentRef().nativeElement as HTMLInputElement).value =
      'some-url';

    component.copy();
    fixture.detectChanges();
    TestBed.tick();

    expect(component.copied).toBeTruthy();

    jest.advanceTimersByTime(component.msMsgDisplay);
    fixture.detectChanges();
    TestBed.tick();

    expect(component.copied).toBeFalsy();
    jest.useRealTimers();
  });

  it('should export CSV', () => {
    const spyDownload = jest.spyOn(exportCSV, 'download');
    const elDownload = document.createElement('a');
    document.body.append(elDownload);

    const mockAnchor = {
      nativeElement: elDownload
    } as ElementRef<HTMLAnchorElement>;
    Object.defineProperty(component, 'downloadAnchor', {
      value: () => mockAnchor
    });

    component.export(ExportType.CSV);
    expect(spyDownload).toHaveBeenCalled();
    elDownload.remove();
  });

  it('should export PDF', () => {
    fixture.componentRef.setInput('getChartData', () =>
      Promise.resolve(MockExportPDFService.imgDataURL)
    );
    fixture.detectChanges();

    const spyGetChartData = jest.spyOn(component, 'getChartData');
    component.export(ExportType.PDF);
    expect(spyGetChartData).toHaveBeenCalled();
  });

  it('should export PNG', () => {
    fixture.componentRef.setInput('getChartData', () =>
      Promise.resolve(MockExportPDFService.imgDataURL)
    );
    fixture.detectChanges();

    const spyGetChartData = jest.spyOn(component, 'getChartData');
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

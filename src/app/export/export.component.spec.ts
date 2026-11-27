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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportComponent],
      providers: [{ provide: ExportCSVService, useClass: MockExportCSVService }]
    }).compileComponents();

    exportCSV = TestBed.inject(ExportCSVService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'getGridData',
      (): FmtTableData => ({ columns: [], tableRows: [] })
    );
    fixture.componentRef.setInput('getChartTitle', (): string => 'title');
    fixture.componentRef.setInput(
      'getChartData',
      (): Promise<string> => Promise.resolve('')
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy text and reset state after a timeout', () => {
    jest.useFakeTimers();
    const spyClipboard = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockImplementation(() => Promise.resolve());

    const mockInput = {
      nativeElement: { value: 'some-url' }
    } as ElementRef<HTMLInputElement>;
    Object.defineProperty(component, 'contentRef', { value: () => mockInput });

    component.copy();
    expect(spyClipboard).toHaveBeenCalledWith('some-url');
    expect(component.copied).toBeTruthy();

    jest.advanceTimersByTime(component.msMsgDisplay);
    expect(component.copied).toBeFalsy();

    jest.useRealTimers();
  });

  it('should export CSV', () => {
    const spyDownload = jest.spyOn(exportCSV, 'download');
    const mockAnchor = {
      nativeElement: document.createElement('a')
    } as ElementRef<HTMLAnchorElement>;

    Object.defineProperty(component, 'downloadAnchor', {
      value: () => mockAnchor
    });

    component.export(ExportType.CSV);
    expect(spyDownload).toHaveBeenCalled();
  });

  it('should export PDF', async () => {
    fixture.componentRef.setInput('getChartData', () =>
      Promise.resolve(MockExportPDFService.imgDataURL)
    );
    fixture.detectChanges();

    const spyGetChartData = jest.spyOn(component, 'getChartData');
    component.export(ExportType.PDF);

    expect(spyGetChartData).toHaveBeenCalled();
  });

  it('should export PNG', async () => {
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
    component.export('UNKNOWN_TYPE' as unknown as ExportType);

    expect(spyGetChartData).not.toHaveBeenCalled();
  });

  it('should manage and toggle its active states correctly', () => {
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

  it('should handle fnHide by toggling visibility and emitting closeExport status', () => {
    const spyToggleActive = jest.spyOn(component, 'toggleActive');
    const spyEmit = jest.spyOn(component.closeExport, 'emit');

    component.openedFromToolbar = true;
    component.fnHide();

    expect(spyToggleActive).toHaveBeenCalledWith(true);
    expect(spyEmit).toHaveBeenCalledWith(true);
  });
});

import { ElementRef } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { TableRow } from '../_models';
import { ExportPDFService } from './';

describe('ExportPDFService', () => {
  let service: ExportPDFService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ExportPDFService]
    }).compileComponents();
    service = TestBed.inject(ExportPDFService);
  }));

  it('should get the image url', () => {
    const e1 = document.createElement('div');
    const e2 = document.createElement('div');

    document.body.append(e1);
    document.body.append(e2);

    const el1 = { nativeElement: e1 } as ElementRef;
    const el2 = { nativeElement: e2 } as ElementRef;

    expect(service.getChartAsImageUrl(el1, el2)).toBeTruthy();
  });

  it('should get the fill colour', () => {
    expect(service.getFillColour(0)).toBeTruthy();
    expect(service.getFillColour(1)).toBeFalsy();
  });

  it('should download', () => {
    const model = {
      columns: ['a', 'b', 'c'],
      tableRows: [
        { name: 'name', count: 1, percent: 1 } as TableRow,
        { name: 'name', count: 2, percent: 2 } as TableRow
      ]
    };
    expect(service.download(model, ''));
  });
});

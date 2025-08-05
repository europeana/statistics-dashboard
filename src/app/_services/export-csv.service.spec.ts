import { TestBed, waitForAsync } from '@angular/core/testing';
import { HeaderNameType } from '../_models';
import { ExportCSVService } from './';

window['URL'] = {
  createObjectURL: (_) => {
    return '';
  },
  revokeObjectURL: (_) => {}
} as any;

describe('ExportCSVService', () => {
  let service: ExportCSVService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [ExportCSVService]
    }).compileComponents();
    service = TestBed.inject(ExportCSVService);
  }));

  it('should convert', () => {
    const testHeaders = ['series', 'name', 'count', 'percent'].map(
      (s: string) => {
        return s as HeaderNameType;
      }
    );
    const testData1 = [
      {
        series: 'Series A',
        name: 'Andy' as HeaderNameType,
        count: 22,
        percent: 50,
        portalUrlInfo: {
          href: ''
        }
      }
    ];
    const testData2 = [
      {
        series: 'Series B',
        name: 'MacLean' as HeaderNameType,
        count: 22,
        percent: null,
        portalUrlInfo: {
          href: ''
        }
      }
    ];
    expect(service.csvFromTableRows(testHeaders, testData1)).toEqual(
      'series,name,count,percent\r\n"Series A","Andy",22,50'
    );

    expect(service.csvFromTableRows(testHeaders, testData2)).toEqual(
      'series,name,count,percent\r\n"Series B","MacLean",22,""'
    );
  });

  it('should download', () => {
    const spy = jest.fn();
    const el = {
      nativeElement: {
        click: spy
      }
    };
    service.download('X', el);
    expect(spy).toHaveBeenCalled();
  });
});

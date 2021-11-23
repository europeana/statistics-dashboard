import { async, TestBed } from '@angular/core/testing';
import { HeaderNameType } from '../_models';
import { ExportCSVService } from './';

describe('ExportCSVService', () => {
  let service: ExportCSVService;

  beforeEach(async(() => {
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
        nameOriginal: 'Andy',
        count: 22,
        percent: 50
      }
    ];
    const testData2 = [
      {
        series: 'Series B',
        name: 'MacLean' as HeaderNameType,
        nameOriginal: 'MacLean',
        count: 22,
        percent: null
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
    const spy = jasmine.createSpy();
    const el = {
      nativeElement: {
        click: spy
      }
    };
    service.download('X', el);
    expect(spy).toHaveBeenCalled();
  });
});

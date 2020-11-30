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

  it('should covert', () => {
    const testHeaders = ['name', 'count', 'percent'].map((s: string) => {
      return s as HeaderNameType;
    });
    const testData1 = [
      { name: 'Andy' as HeaderNameType, count: '22', percent: '50' }
    ];
    const testData2 = [
      { name: 'MacLean' as HeaderNameType, count: '22', percent: null }
    ];
    expect(service.csvFromTableRows(testHeaders, testData1)).toEqual(
      'name,count,percent\r\n"Andy","22","50"'
    );
    expect(service.csvFromTableRows(testHeaders, testData2)).toEqual(
      'name,count,percent\r\n"MacLean","22",""'
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

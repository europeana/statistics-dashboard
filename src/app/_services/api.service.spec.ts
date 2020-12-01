import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { RawFacet } from '../_models';
import { APIService } from './';

describe('APIService', () => {
  let service: APIService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [APIService],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    service = TestBed.inject(APIService);
    http = TestBed.inject(HttpTestingController);
  }));

  it('should load the API data', () => {
    const testUrl = 'http://europeana-api-data';
    service.loadAPIData(testUrl).subscribe((res: RawFacet) => {
      expect(res).toBeTruthy();
    });
    http.expectOne(testUrl);
    http.verify();
  });
});

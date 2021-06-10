import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
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
    const baseUrl = `${environment.serverAPI}&wskey=${environment.wskey}`;
    const sub = service.loadAPIData('').subscribe((res: RawFacet) => {
      expect(res).toBeTruthy();
    });
    sub.unsubscribe();
    http.expectOne(baseUrl);
    http.verify();
  });

  it('should load the ISO country codes', () => {
    expect(service.loadISOCountryCodes()).toBeTruthy();
  });
});

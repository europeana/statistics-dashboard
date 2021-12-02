import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { BreakdownResults, GeneralResults } from '../_models';
import { APIService } from './';

describe('APIService', () => {
  let service: APIService;
  let http: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [APIService],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    service = TestBed.inject(APIService);
    http = TestBed.inject(HttpTestingController);
  }));

  it('should load the breakdowns', () => {
    const baseUrl = `${environment.serverAPI}${service.suffixFiltering}`;
    const sub = service
      .getBreakdowns({ filters: {} })
      .subscribe((res: BreakdownResults) => {
        expect(res).toBeTruthy();
      });
    sub.unsubscribe();
    http.expectOne(baseUrl);
    http.verify();
  });

  it('should load the general results', () => {
    const baseUrl = `${environment.serverAPI}${service.suffixGeneral}`;
    const sub = service.getGeneralResults().subscribe((res: GeneralResults) => {
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

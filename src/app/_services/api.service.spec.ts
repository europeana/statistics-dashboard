import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MockHttp } from '@europeana/metis-ui-test-utils';
import { environment } from '../../environments/environment';
import { GeneralResults, TargetFieldName } from '../_models';
import { APIService } from './';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('API Service', () => {
  let service: APIService;
  let mockHttp: MockHttp;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    providers: [APIService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
    service = TestBed.inject(APIService);
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController));
  }));

  it('should load specific country data', () => {
    const country = 'BE';
    const baseUrl = `${environment.serverAPI}/${service.suffixCountryHistoricalUrl}?country=${country}`;
    spyOn(service, 'loadCountryData').and.callThrough();
    const sub = service.loadCountryData(country).subscribe((res) => {
      expect(res).toBeTruthy();
      sub.unsubscribe();
    });
    mockHttp.expect('GET', baseUrl).send([]);
    mockHttp.verify();
  });

  it('should load the country data from the cache', () => {
    const baseUrl = `${environment.serverAPI}/${service.suffixCountryTargetsUrl}`;
    spyOn(service, 'loadCountryData').and.callThrough();
    const sub = service.getCountryData().subscribe((res) => {
      expect(res).toBeTruthy();
    });
    sub.unsubscribe();
    mockHttp.expect('GET', baseUrl).send([{}]);
    mockHttp.verify();

    expect(service.loadCountryData).toHaveBeenCalled();
    const sub2 = service.getCountryData().subscribe((res) => {
      expect(res).toBeTruthy();
    });
    sub2.unsubscribe();
    mockHttp.verify();
    expect(service.loadCountryData).toHaveBeenCalledTimes(1);
  });

  it('should get the target metadata', () => {
    const baseUrl = `${environment.serverAPI}/${service.suffixTargetsUrl}`;
    const sub = service.getTargetMetaData().subscribe((res) => {
      expect(res).toBeTruthy();
    });
    mockHttp.expect('GET', baseUrl).send([{}]);
    sub.unsubscribe();
    mockHttp.verify();
  });

  it('should load the breakdowns', () => {
    const baseUrl = `${environment.serverAPI}/${service.suffixFiltering}`;
    const sub = service.getBreakdowns({ filters: {} }).subscribe((res) => {
      expect(res).toBeTruthy();
    });
    mockHttp.expect('POST', baseUrl).body({ filters: {} }).send({});
    mockHttp.verify();
    sub.unsubscribe();
  });

  it('should load the general results', () => {
    const baseUrl = `${environment.serverAPI}/${service.suffixGeneral}`;
    const sub = service.getGeneralResults().subscribe((res: GeneralResults) => {
      expect(res).toBeTruthy();
    });
    mockHttp.expect('GET', baseUrl).send({});
    mockHttp.verify();
    sub.unsubscribe();
  });

  it('should load the general results with content-tier-zero', () => {
    const ctZeroParam = '?content-tier-zero=true';
    const baseUrl = `${environment.serverAPI}/${service.suffixGeneral}${ctZeroParam}`;
    const sub = service
      .getGeneralResults(true)
      .subscribe((res: GeneralResults) => {
        expect(res).toBeTruthy();
      });
    mockHttp.expect('GET', baseUrl).send({});
    mockHttp.verify();
    sub.unsubscribe();
  });

  it('should load the rightsCategory urls', () => {
    expect(service.getRightsCategoryUrls(['CC0'])).toBeTruthy();
  });

  it('should load the target metadata', () => {
    const sub = service.getTargetMetaData().subscribe((res) => {
      expect(res).toBeTruthy();
    });
    mockHttp.expect('GET', '/' + service.suffixTargetsUrl).send([]);
    mockHttp.verify();
    sub.unsubscribe();
  });

  it('should reduce the target metadata', () => {
    const src = [
      {
        country: 'IT',
        targetType: TargetFieldName.THREE_D,
        targetYear: 2025,
        value: 3
      }
    ];
    const res = service.reduceTargetMetaData(src);
    expect(res['IT']).toBeTruthy();
  });
});

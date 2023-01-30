import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BreakdownRequest,
  BreakdownResults,
  GeneralResults,
  IHash
} from '../_models';
import { ISOCountryCodes } from '../_data';

@Injectable({ providedIn: 'root' })
export class APIService {
  suffixGeneral = 'statistics/europeana/general';
  suffixFiltering = 'statistics/filtering';
  suffixRightsUrls = 'statistics/rights/urls';

  constructor(private readonly http: HttpClient) {}

  loadISOCountryCodes(): IHash<string> {
    return ISOCountryCodes;
  }

  replaceDoubleSlashes(s: string): string {
    return s.replace(/([^:]\/)\/+/g, "$1");
  }

  getBreakdowns(request: BreakdownRequest): Observable<BreakdownResults> {
    return this.http.post<BreakdownResults>(
      this.replaceDoubleSlashes(`${environment.serverAPI}/${this.suffixFiltering}`),
      request
    );
  }

  getGeneralResults(includeCTZero = false): Observable<GeneralResults> {
    return this.http.get<GeneralResults>(
      this.replaceDoubleSlashes(`${environment.serverAPI}/${this.suffixGeneral}`),
      { params: includeCTZero ? { 'content-tier-zero': true } : {} }
    );
  }

  getRightsCategoryUrls(
    rightsCategories: Array<string>
  ): Observable<Array<string>> {
    return this.http.get<Array<string>>(
      this.replaceDoubleSlashes(`${environment.serverAPI}/${this.suffixRightsUrls}`),
      { params: { rightsCategories } }
    );
  }
}

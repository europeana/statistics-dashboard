import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BreakdownRequest,
  BreakdownResults,
  GeneralResults,
  IHashString
} from '../_models';
import { ISOCountryCodes } from '../_data';

@Injectable({ providedIn: 'root' })
export class APIService {
  suffixGeneral = 'statistics/europeana/general';
  suffixFiltering = 'statistics/filtering';

  constructor(private readonly http: HttpClient) {}

  loadISOCountryCodes(): IHashString {
    return ISOCountryCodes;
  }

  getBreakdowns(request: BreakdownRequest): Observable<BreakdownResults> {
    return this.http.post<BreakdownResults>(
      `${environment.serverAPI}${this.suffixFiltering}`,
      request
    );
  }

  getGeneralResults(): Observable<GeneralResults> {
    return this.http.get<GeneralResults>(
      `${environment.serverAPI}${this.suffixGeneral}`
    );
  }
}

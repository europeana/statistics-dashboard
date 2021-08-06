import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BreakdownRequest,
  BreakdownResults,
  GeneralResults,
  IHashString,
  RawFacet
} from '../_models';
import { ISOCountryCodes } from '../_data';

@Injectable({ providedIn: 'root' })
export class APIService {
  constructor(private readonly http: HttpClient) {}

  loadISOCountryCodes(): IHashString {
    return ISOCountryCodes;
  }

  loadAPIData(url: string): Observable<RawFacet> {
    return this.http.get<RawFacet>(
      `${environment.serverAPI}${url}&wskey=${environment.wskey}`
    );
  }

  getBreakdowns(request: BreakdownRequest): Observable<BreakdownResults> {
    return this.http.post<BreakdownResults>(`http://localhost:3001/`, request);
  }

  getGeneralResults(): Observable<GeneralResults> {
    return this.http.get<GeneralResults>(`http://localhost:3001/`);
  }
}

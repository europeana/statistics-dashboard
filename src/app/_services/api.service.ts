import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RawFacet } from '../_models';

@Injectable({ providedIn: 'root' })
export class APIService {
  constructor(private readonly http: HttpClient) {}

  loadAPIData(url: string): Observable<RawFacet> {
    return this.http.get<RawFacet>(url);
  }
}

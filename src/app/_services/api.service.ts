import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  BreakdownRequest,
  BreakdownResults,
  GeneralResults,
  IHash,
  IHashArray,
  TargetCountryData,
  TargetData,
  TargetMetaData,
  TargetMetaDataRaw
} from '../_models';
import { isoCountryCodes } from '../_data';
import { Cache } from '../_helpers';

@Injectable({ providedIn: 'root' })
export class APIService {
  private readonly countries = new Cache(() => this.loadCountryData());
  private readonly targetMetaData = new Cache(() => this.loadTargetMetaData());

  suffixGeneral = 'statistics/europeana/general';
  suffixFiltering = 'statistics/filtering';
  suffixRightsUrls = 'statistics/rights/urls';
  suffixTargetsUrl = 'statistics/europeana/targets';
  suffixCountryTargetsUrl = 'statistics/europeana/target/country/all';
  suffixCountryHistoricalUrl = 'statistics/europeana/target/country/historical';

  constructor(private readonly http: HttpClient) {}

  replaceDoubleSlashes(s: string): string {
    return s.replace(/([^:]\/)\/+/g, '$1');
  }

  getBreakdowns(request: BreakdownRequest): Observable<BreakdownResults> {
    return this.http.post<BreakdownResults>(
      this.replaceDoubleSlashes(
        `${environment.serverAPI}/${this.suffixFiltering}`
      ),
      request
    );
  }

  getGeneralResults(includeCTZero = false): Observable<GeneralResults> {
    return this.http.get<GeneralResults>(
      this.replaceDoubleSlashes(
        `${environment.serverAPI}/${this.suffixGeneral}`
      ),
      { params: includeCTZero ? { 'content-tier-zero': true } : {} }
    );
  }

  getRightsCategoryUrls(
    rightsCategories: Array<string>
  ): Observable<Array<string>> {
    return this.http.get<Array<string>>(
      this.replaceDoubleSlashes(
        `${environment.serverAPI}/${this.suffixRightsUrls}`
      ),
      { params: { rightsCategories } }
    );
  }

  /**
   * loadTargetMetaData
   *
   * Expected back-end format:
   *  {
   *    "country": "Germany",
   *    "label": "2025",
   *    "value": 370,
   *    "targetType": "three_d" | "high_quality" | "total"
   *  }...
   *
   * @return [TargetMetaDataRaw]
   **/
  private loadTargetMetaData(): Observable<Array<TargetMetaDataRaw>> {
    return this.http
      .get<Array<TargetMetaDataRaw>>(
        this.replaceDoubleSlashes(
          `${environment.serverAPI}/${this.suffixTargetsUrl}`
        )
      )
      .pipe(
        map((targetData: Array<TargetMetaDataRaw>) => {
          return targetData.map((tmd: TargetMetaDataRaw) => {
            tmd.isInterim = tmd.targetYear !== 2030;
            return tmd;
          });
        })
      );
  }

  /**
   * reduceTargetMetaData
   *
   * creates hash from raw target data (array) wherein item.county is used as a
   * key to a further hash, which in turn uses item.targetType to access arrays
   * of TargetMetaData objects
   *
   * @param { Array<TargetMetaDataRaw> } rows - the source data to reduce
   **/
  reduceTargetMetaData(
    rows: Array<TargetMetaDataRaw>
  ): IHash<IHashArray<TargetMetaData>> {
    return rows.reduce(
      (res: IHash<IHashArray<TargetMetaData>>, item: TargetMetaDataRaw) => {
        const country = item.country;

        if (!res[country]) {
          res[country] = {};
        }

        let arr: Array<TargetMetaData> = res[country][item.targetType];
        if (!arr) {
          arr = [];
          res[country][item.targetType] = arr;
        }

        arr.push({
          targetYear: item.targetYear,
          value: item.value,
          isInterim: item.isInterim
        });
        return res;
      },
      {}
    );
  }

  /** getTargetMetaData
   * returns the result of loadTargetMetaData piped / mapped to reduceTargetMetaData
   **/
  getTargetMetaData(): Observable<IHash<IHashArray<TargetMetaData>>> {
    return this.targetMetaData.get().pipe(
      map((rows: Array<TargetMetaDataRaw>) => {
        return this.reduceTargetMetaData(rows);
      })
    );
  }

  /**
   * loadCountryData
   *   loads shallow data:
   *   - all countries latest
   *   or deep data
   *   - single country historical
   *
   * @param { string? } country - flags deep load
   **/
  loadCountryData(country?: string): Observable<Array<TargetCountryData>> {
    let url = `${this.suffixCountryTargetsUrl}`;
    if (country) {
      url = `${this.suffixCountryHistoricalUrl}?country=${country}`;
    }

    const res = this.http.get<Array<TargetCountryData>>(
      this.replaceDoubleSlashes(`${environment.serverAPI}/${url}`)
    );

    return res.pipe(
      map((rows: Array<TargetCountryData>) => {
        rows.forEach((row: TargetCountryData) => {
          row.country = isoCountryCodes[row.country] || row.country;
        });
        return rows;
      })
    );
  }

  /** getCountryData
   * returns the result of countries (the cached loadCountryData) mapped to a hash (key: country)
   **/
  getCountryData(): Observable<IHash<Array<TargetData>>> {
    return this.countries.get().pipe(
      map((rows: Array<TargetCountryData>) => {
        const res = rows.reduce(
          (res: IHash<Array<TargetData>>, item: TargetCountryData) => {
            if (!res[item.country]) {
              res[item.country] = [];
            }
            const { country, ...itemNoCountry } = item;
            res[country].push(itemNoCountry);
            return res;
          },
          {}
        );
        return res;
      })
    );
  }
}

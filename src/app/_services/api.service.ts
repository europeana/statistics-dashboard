import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  BreakdownRequest,
  BreakdownResult,
  BreakdownResults,
  CountPercentageValue,
  GeneralResults,
  GeneralResultsFormatted,
  IHash,
  IHashArray,
  TargetCountryData,
  TargetData,
  TargetMetaData,
  TargetMetaDataRaw
} from '../_models';
import { countryTargetData, ISOCountryCodes, targetData } from '../_data';
import { Cache } from '../_helpers';

@Injectable({ providedIn: 'root' })
export class APIService {
  private readonly countries = new Cache(() => this.loadCountryData());
  private readonly generalResults = new Cache(() => this.getGeneralResults());
  public readonly generalResultsCountry = new Cache(() =>
    this.loadGeneralResultsCountry()
  );

  suffixGeneral = 'statistics/europeana/general';
  suffixFiltering = 'statistics/filtering';
  suffixRightsUrls = 'statistics/rights/urls';

  constructor(private readonly http: HttpClient) {}

  loadISOCountryCodes(): IHash<string> {
    return ISOCountryCodes;
  }

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

  loadGeneralResultsCountry(): Observable<GeneralResults> {
    return this.generalResults.get();
  }

  getGeneralResultsCountry(): Observable<GeneralResultsFormatted> {
    return this.generalResultsCountry.get().pipe(
      map((data: GeneralResults) => {
        const res: GeneralResultsFormatted = {};
        data.allBreakdowns.forEach((br: BreakdownResult) => {
          res[br.breakdownBy] = br.results.map((cpv: CountPercentageValue) => {
            return {
              name: cpv.value,
              value: cpv.count,
              percent: cpv.percentage
            };
          });
        });
        return res;
      })
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
   *    "country": "DE",
   *    "label": "2025",
   *    "value": 370,
   *    "interim": true,
   *    "targetType": "three_d" | "hq"
   *  }...
   *
   * @return [TargetMetaDataRaw]
   **/
  loadTargetMetaData(): Observable<Array<TargetMetaDataRaw>> {
    console.log('Fake result for loadTargetMetaData()');
    console.log(JSON.stringify(targetData, null, 4));
    return of(targetData);
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
          label: item.label,
          value: item.value,
          interim: item.interim
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
    return this.loadTargetMetaData().pipe(
      map((rows: Array<TargetMetaDataRaw>) => {
        return this.reduceTargetMetaData(rows);
      })
    );
  }

  loadCountryData(): Observable<Array<TargetCountryData>> {
    console.log('Fake result for loadCountryData()');
    console.log(JSON.stringify(countryTargetData, null, 4));
    return of(countryTargetData);
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

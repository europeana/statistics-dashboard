import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  BreakdownRequest,
  BreakdownResults,
  CountryTargetData,
  GeneralResults,
  IHash,
  IHashArray,
  TargetData
} from '../_models';
import { ISOCountryCodes } from '../_data';

@Injectable({ providedIn: 'root' })
export class APIService {
  suffixGeneral = 'statistics/europeana/general';
  suffixFiltering = 'statistics/filtering';
  suffixRightsUrls = 'statistics/rights/urls';

  dateTicks: Array<string> = [];

  constructor(private readonly http: HttpClient) {
    for (let i = 0; i < 24; i++) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(i);
      this.dateTicks.push(date.toISOString());
    }
  }

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
   * loadTargetData
   *
   * Returns data as is from back end
   *
   * Expected back-end format:
   *  {
   *    "country": "DE",
   *    "label": "2025",
   *    "value": 370,
   *    "interim": true,
   *    "targetType": "total"
   *  }...
   **/
  loadTargetData(): Observable<Array<IHash<string | number | boolean>>> {
    const res = [
      'BE',
      'CY',
      'CZ',
      'DK',
      'FI',
      'FR',
      'DE',
      'GR',
      'HU',
      'IT',
      'MK',
      'MT',
      'NL',
      'PL',
      'SK',
      'SI',
      'SE'
    ].map((country: string, index: number) => {
      const resLabel = ['2025', '2030'].map((label: string) => {
        // make values larger for later targets
        let value = parseInt(label) * (index + 1);
        return ['total', 'three_d', 'meta_tier_a'].map((targetType: string) => {
          // make subtarget values smaller than total
          value -= 123;
          return {
            country,
            targetType,
            label,
            interim: label === '2025',
            value
          };
        });
      });
      return [].concat(...resLabel);
    });
    const rows = [].concat(...res);
    return of(rows);
  }

  /** getTargetData
   *  invokes loadTargetData and reduces rows to a single hash
   **/
  getTargetData(): Observable<IHash<IHashArray<TargetData>>> {
    return this.loadTargetData().pipe(
      map((rows: Array<IHash<string | number | boolean>>) => {
        return rows.reduce(
          (
            res: IHash<IHashArray<TargetData>>,
            item: IHash<string | number | boolean>
          ) => {
            const country = item.country as string;
            if (!res[country]) {
              res[country] = {};
            }

            let arr = res[country][item.targetType as string];
            if (!arr) {
              arr = [];
              res[country][item.targetType as string] = arr;
            }

            const resEntry = {} as TargetData;

            resEntry.label = item.label as string;
            resEntry.value = item.value as number;
            resEntry.interim = item.interim as boolean;

            arr.push(resEntry);
            return res;
          },
          {}
        );
      })
    );
  }

  loadCountryTargetData(country: string): Observable<CountryTargetData> {
    let baseValue = 12;
    const numDateTicks = this.dateTicks.length;

    const res = {
      targetAll: 1000,
      target3D: 200,
      targetMetaTierA: 200,
      dataRows: []
    };
    if (country === 'DE') {
      res.targetAll = 1700;
      res.target3D = 400;
      res.targetMetaTierA = 300;
      baseValue = baseValue * 12;
    }
    res.dataRows = this.dateTicks.map((dateTick: string) => {
      baseValue +=
        (baseValue % (numDateTicks + 1)) - (baseValue % (numDateTicks / 2));
      return {
        date: dateTick,
        total: baseValue,
        three_d: baseValue / 4,
        meta_tier_a: baseValue / 5
      };
    });

    return of(res);
  }
}

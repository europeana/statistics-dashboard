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
  TargetData,
  TemporalDataItem,
  TemporalLocalisedDataItem
} from '../_models';
import { ISOCountryCodes } from '../_data';

@Injectable({ providedIn: 'root' })
export class APIService {
  suffixGeneral = 'statistics/europeana/general';
  suffixFiltering = 'statistics/filtering';
  suffixRightsUrls = 'statistics/rights/urls';

  dateTicks: Array<string> = [];
  targetCountries = [
    'BA',
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
  ];

  targetData = [].concat(
    ...this.targetCountries.map((country: string, index: number) => {
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
            value: label === '2025' ? Math.floor(value * 0.7) : value
          };
        });
      });
      return [].concat(...resLabel);
    })
  );

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

  getGeneralResultsCountry(): Observable<GeneralResultsFormatted> {
    return this.getGeneralResults().pipe(
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
    return of(this.targetData);
  }

  reduceTargetData(
    rows: Array<IHash<string | number | boolean>>
  ): IHash<IHashArray<TargetData>> {
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
  }

  /** getTargetData
   *  invokes loadTargetData and reduces rows to a single hash
   **/
  getTargetData(): Observable<IHash<IHashArray<TargetData>>> {
    return this.loadTargetData().pipe(
      map((rows: Array<IHash<string | number | boolean>>) => {
        return this.reduceTargetData(rows);
      })
    );
  }

  loadCountryData(): Observable<Array<TemporalLocalisedDataItem>> {
    const numDateTicks = this.dateTicks.length;
    const res = [];

    const targetDataRef = this.reduceTargetData(this.targetData);

    this.targetCountries.forEach((country: string) => {
      const baseValueTotal = targetDataRef[country]['total'][1].value;
      const baseValue3D = targetDataRef[country]['three_d'][1].value;
      const baseValueTierA = targetDataRef[country]['meta_tier_a'][1].value;

      let value = baseValueTotal * 1;
      let value3D = baseValue3D * 1.2;
      let valueTierA = baseValueTierA * 0.9;

      this.dateTicks.forEach((dateTick: string, dateTickIndex: number) => {
        const random1 =
          (value % (numDateTicks + 1)) - (value % (numDateTicks / 2));

        value -= random1;
        value3D -= random1;
        valueTierA += random1;

        const random2 =
          (value % (numDateTicks + 1)) + (value % (numDateTicks / 2));

        value -= 0.8 * (random2 % random1);
        value3D -= 100 * (random1 % random2);
        valueTierA -= 1 * (random2 * random1 * 5);
        value -= value3D / numDateTicks;

        res.push({
          country,
          date: this.dateTicks[this.dateTicks.length - (dateTickIndex + 1)],
          total: Math.floor(value),
          three_d: Math.floor(value3D),
          meta_tier_a: Math.floor(valueTierA)
        });
      });
    });
    return of(res.reverse());
  }

  getCountryData(): Observable<IHash<Array<TemporalDataItem>>> {
    return this.loadCountryData().pipe(
      map((rows: Array<TemporalLocalisedDataItem>) => {
        return rows.reduce(
          (
            res: IHash<Array<TemporalDataItem>>,
            item: TemporalLocalisedDataItem
          ) => {
            if (!res[item.country]) {
              res[item.country] = [];
            }
            const { country, ...itemNoCountry } = item;
            res[country].push(itemNoCountry);
            return res;
          },
          {}
        );
      })
    );
  }
}

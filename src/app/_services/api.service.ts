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
  TargetFieldName,
  TargetMetaData,
  TargetMetaDataRaw
} from '../_models';
import { ISOCountryCodes } from '../_data';

@Injectable({ providedIn: 'root' })
export class APIService {
  suffixGeneral = 'statistics/europeana/general';
  suffixFiltering = 'statistics/filtering';
  suffixRightsUrls = 'statistics/rights/urls';

  dateTicks: Array<string> = [];
  targetCountries = [
    'AL',
    'AT',
    'AZ',
    'AZ',
    'BY',
    'BE',
    'BA',
    'BG',
    'HR',
    'CY',
    'CZ',
    'DK',
    'EE',
    'FI',
    'FR',
    'GE',
    'DE',
    'GR',
    'HU',
    'IS',
    'IE',
    'IL',
    'IT',
    'LV',
    'LT',
    'LU',
    'MT',
    'ME',
    'MD',
    'NL',
    'MK',
    'NO',
    'PL',
    'PT',
    'RO',
    'RU',
    'RS',
    'SK',
    'SI',
    'ES',
    'SE',
    'CH',
    'TR',
    'UA',
    'GB',
    'USA'
  ];

  targetData = [].concat(
    ...this.targetCountries.map((country: string, index: number) => {
      const resLabel = ['2025', '2030'].map((label: string) => {
        // make values larger for later targets
        let value = parseInt(label) * (index + 1);

        return Object.keys(TargetFieldName).map(
          (targetType: TargetFieldName) => {
            // make subtarget values smaller than total
            value -= 123;
            const fieldName = TargetFieldName[targetType];
            return {
              country,
              fieldName,
              targetType: fieldName,
              label,
              interim: label === '2025',
              value: label === '2025' ? Math.floor(value * 0.7) : value
            };
          }
        );
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
    return of(this.targetData);
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
    const numDateTicks = this.dateTicks.length;
    const res = [];
    const tgtDataRef = this.reduceTargetMetaData(this.targetData);

    this.targetCountries.forEach((country: string) => {
      const countryName = Object.keys(ISOCountryCodes).find(
        (key) => ISOCountryCodes[key] === country
      );
      const countryRandom = Math.max(1.5, (countryName.length * 12) % 5);

      const baseValue3D =
        tgtDataRef[country][TargetFieldName.THREE_D][1].value / countryRandom;
      const basevalueHQ =
        tgtDataRef[country][TargetFieldName.HQ][1].value / countryRandom;

      let value3D = baseValue3D * 1.2;
      let valueHQ = basevalueHQ * 0.9;

      this.dateTicks.forEach((dateTick: string, dateTickIndex: number) => {
        const random1 =
          (value3D % (numDateTicks + 1)) - (value3D % (numDateTicks / 2));

        value3D -= random1;
        valueHQ += random1;

        const random2 =
          (valueHQ % (numDateTicks + 1)) + (valueHQ % (numDateTicks / 2));

        value3D -= 0.8 * (random2 % random1);
        valueHQ -= 1 * (random2 * random1 * 5);

        res.push({
          country,
          date: this.dateTicks[this.dateTicks.length - (dateTickIndex + 1)],
          three_d: isNaN(value3D) ? 0 : Math.floor(value3D),
          hq: isNaN(valueHQ) ? 0 : Math.floor(valueHQ)
        });
      });
    });
    return of(res.reverse());
  }

  /** getCountryData
   * returns the result of loadCountryData mapped to a hash (key: country)
   **/
  getCountryData(): Observable<IHash<Array<TargetData>>> {
    return this.loadCountryData().pipe(
      map((rows: Array<TargetCountryData>) => {
        return rows.reduce(
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
      })
    );
  }
}

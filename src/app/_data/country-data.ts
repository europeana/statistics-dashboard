import { Observable, of } from 'rxjs';
import {
  IHash,
  IHashArray,
  TargetCountryData,
  TargetFieldName,
  TargetMetaData,
  TargetMetaDataRaw
} from '../_models';
import { ISOCountryCodes } from './static-data';

const dateTicks: Array<string> = [];
const targetCountries = [
  'AL',
  'AT',
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

for (let i = 0; i < 24; i++) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(i);
  dateTicks.push(date.toISOString());
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
const reduceTargetMetaData = (rows: Array<TargetMetaDataRaw>) => {
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
};

export const targetData = [].concat(
  ...targetCountries.map((country: string, index: number) => {
    const resLabel = ['2025', '2030'].map((label: string) => {
      // make values larger for later targets
      let value = parseInt(label) * (index + 1);

      return Object.keys(TargetFieldName).map((targetType: TargetFieldName) => {
        // make subtarget values smaller than total
        value -= 123;
        const fieldName = TargetFieldName[targetType];
        return {
          country,
          targetType: fieldName,
          label,
          interim: label === '2025',
          value:
            fieldName === TargetFieldName.TOTAL
              ? value * (label === '2025' ? 9 : 12)
              : label === '2025'
              ? Math.floor(value * 0.7)
              : value
        };
      });
    });
    return [].concat(...resLabel);
  })
);

//const fnCountryTargetData = ():Observable<Array<TargetCountryData>> => {
const fnCountryTargetData = (): Array<TargetCountryData> => {
  const numDateTicks = dateTicks.length;
  const res = [];
  const tgtDataRef = reduceTargetMetaData(targetData);

  targetCountries.forEach((country: string) => {
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

    dateTicks.forEach((dateTick: string, dateTickIndex: number) => {
      const random1 =
        (value3D % (numDateTicks + 1)) - (value3D % (numDateTicks / 2));

      value3D -= random1;
      valueHQ += random1;

      const random2 =
        (valueHQ % (numDateTicks + 1)) + (valueHQ % (numDateTicks / 2));

      value3D -= 0.8 * (random2 % random1);
      valueHQ -= 1 * (random2 * random1 * 5);

      const resultItem = {
        country,
        date: dateTicks[dateTicks.length - (dateTickIndex + 1)],
        three_d: isNaN(value3D) ? 0 : Math.floor(value3D),
        hq: isNaN(valueHQ) ? 0 : Math.floor(valueHQ),
        total: 0
      };

      resultItem.total = Math.max(resultItem.three_d, resultItem.hq) * 12;
      res.push(resultItem);
    });
  });
  return res.reverse();
};
export const countryTargetData = fnCountryTargetData();

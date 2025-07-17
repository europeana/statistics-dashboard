import {
  IHash,
  IHashArray,
  TargetCountryData,
  TargetFieldName,
  TargetMetaData,
  TargetMetaDataRaw
} from '../src/app/_models';
import { memberStateCountryCodes } from '../src/app/_data';

export const isoCountryCodes = {
  Austria: 'AT',
  Azerbaijan: 'AZ',
  Belgium: 'BE',
  Bulgaria: 'BG',
  'Bosnia and Herzegovina': 'BA',
  Belarus: 'BY',
  Russia: 'RU',
  Serbia: 'RS',
  Romania: 'RO',
  Greece: 'GR',
  Georgia: 'GE',
  'United Kingdom': 'GB',
  Croatia: 'HR',
  Hungary: 'HU',
  Portugal: 'PT',
  Poland: 'PL',
  Estonia: 'EE',
  Italy: 'IT',
  Spain: 'ES',
  Montenegro: 'ME',
  Moldova: 'MD',
  Monaco: 'MC',
  'North Macedonia': 'MK',
  Malta: 'MT',
  France: 'FR',
  Finland: 'FI',
  'Faroe Islands': 'FO',
  Netherlands: 'NL',
  Norway: 'NO',
  Kosovo: 'XK',
  Switzerland: 'CH',
  Czechia: 'CZ',
  Cyprus: 'CY',
  Slovakia: 'SK',
  Slovenia: 'SI',
  Sweden: 'SE',
  Denmark: 'DK',
  Germany: 'DE',
  'United States of America': 'US',
  Turkey: 'TR',
  Liechtenstein: 'LI',
  Latvia: 'LV',
  Lithuania: 'LT',
  Luxembourg: 'LU',
  'Holy See (Vatican City State)': 'VA',
  Andorra: 'AD',
  Iceland: 'IS',
  Israel: 'IL',
  Albania: 'AL',
  Ireland: 'IE',
  Ukraine: 'UA',
  Europe: 'EU'
};

export const isoCountryCodesReversed = Object.entries(isoCountryCodes)
  .filter((item) => !!item)
  .reduce((obj, item) => (obj[item[1]] = item[0]) && obj, {});

const dateTicks: Array<string> = [];

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
const reduceTargetMetaData = (
  rows: Array<TargetMetaDataRaw>
): IHash<IHashArray<TargetMetaData>> => {
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
};

export const targetData = [].concat(
  ...memberStateCountryCodes.map((country: string, index: number) => {
    const resLabel = [2025, 2030].map((year: number) => {
      // make values larger for later targets
      let value = year * (index + 1);

      return Object.keys(TargetFieldName).map((targetType: TargetFieldName) => {
        // make subtarget values smaller than total
        value -= 123;
        const fieldName = TargetFieldName[targetType];
        return {
          country,
          targetType: fieldName,
          targetYear: year,
          isInterim: year === 2025,
          value:
            fieldName === TargetFieldName.TOTAL
              ? value * (year === 2025 ? 9 : 12)
              : year === 2025
              ? Math.floor(value * 0.7)
              : value
        };
      });
    });
    return [].concat(...resLabel);
  })
);

const fnCountryTargetData = (): Array<TargetCountryData> => {
  const numDateTicks = dateTicks.length;
  const res = [];
  const tgtDataRef = reduceTargetMetaData(targetData);

  memberStateCountryCodes.forEach((countryCode: string) => {
    const countryName = isoCountryCodesReversed[countryCode];
    const countryRandom = Math.max(1.5, (countryName.length * 12) % 5);
    const baseValue3D =
      tgtDataRef[countryCode][TargetFieldName.THREE_D][1].value / countryRandom;
    const basevalueHQ =
      tgtDataRef[countryCode][TargetFieldName.HQ][1].value / countryRandom;

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
        country: countryCode,
        date: dateTicks[dateTicks.length - (dateTickIndex + 1)],
        three_d: isNaN(value3D) ? 0 : Math.floor(value3D),
        high_quality: isNaN(valueHQ) ? 0 : Math.floor(valueHQ),
        total: 0
      };

      resultItem.total =
        Math.max(resultItem.three_d, resultItem.high_quality) * 12;
      res.push(resultItem);
    });
  });
  return res.reverse();
};
export const countryTargetData = fnCountryTargetData();

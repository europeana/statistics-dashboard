import {
  IHash,
  IHashArray,
  TargetData,
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

export const slovenianData = [
  {
    date: '2024-05-31T22:00:00.000Z',
    three_d: 4,
    hq: 42256,
    total: 738396
  },
  {
    date: '2024-06-01T22:00:00.000Z',
    three_d: 12,
    hq: 42124,
    total: 232000
  },
  {
    date: '2024-06-02T22:00:00.000Z',
    three_d: 24,
    hq: 41973,
    total: 241000
  },
  {
    date: '2024-06-03T22:00:00.000Z',
    three_d: 24,
    hq: 41909,
    total: 292000
  },
  {
    date: '2024-06-04T22:00:00.000Z',
    three_d: 31,
    hq: 41770,
    total: 282570
  },
  {
    date: '2024-06-05T22:00:00.000Z',
    three_d: 30,
    hq: 41707,
    total: 293570
  },
  {
    date: '2024-06-06T22:00:00.000Z',
    three_d: 70,
    hq: 79100,
    total: 297570
  },
  {
    date: '2024-06-07T22:00:00.000Z',
    three_d: 101,
    hq: 179100,
    total: 307570
  },
  {
    date: '2024-06-08T22:00:00.000Z',
    three_d: 101,
    hq: 196100,
    total: 337570
  },
  {
    date: '2024-06-09T22:00:00.000Z',
    three_d: 102,
    hq: 197100,
    total: 347570
  },
  {
    date: '2024-06-10T22:00:00.000Z',
    three_d: 104,
    hq: 225600,
    total: 377470
  },
  {
    date: '2024-06-11T22:00:00.000Z',
    three_d: 107,
    hq: 261000,
    total: 377570
  },
  {
    date: '2024-06-12T22:00:00.000Z',
    three_d: 109,
    hq: 294000,
    total: 391570
  },
  {
    date: '2024-06-13T22:00:00.000Z',
    three_d: 158,
    hq: 304000,
    total: 392570
  },
  {
    date: '2024-06-14T22:00:00.000Z',
    three_d: 160,
    hq: 314000,
    total: 392760
  },
  {
    date: '2024-06-15T22:00:00.000Z',
    three_d: 190,
    hq: 344000,
    total: 392770
  },
  {
    date: '2024-06-16T22:00:00.000Z',
    three_d: 202,
    hq: 374300,
    total: 395770
  },
  {
    date: '2024-06-17T22:00:00.000Z',
    three_d: 211,
    hq: 375000,
    total: 395779
  },
  {
    date: '2024-06-18T22:00:00.000Z',
    three_d: 200,
    hq: 381000,
    total: 395979
  },
  {
    date: '2024-06-19T22:00:00.000Z',
    three_d: 230,
    hq: 380000,
    total: 415779
  },
  {
    date: '2024-06-20T22:00:00.000Z',
    three_d: 230,
    hq: 380000,
    total: 425779
  },
  {
    date: '2024-06-21T22:00:00.000Z',
    three_d: 254,
    hq: 400000,
    total: 475779
  },
  {
    date: '2024-06-22T22:00:00.000Z',
    three_d: 256,
    hq: 400197,
    total: 475779
  }
] as unknown as Array<TargetData>;

export const slovenianTargetData = {
  three_d: [
    {
      label: '2025',
      value: 10008,
      interim: true
    },
    {
      label: '2030',
      value: 66720,
      interim: false
    }
  ],
  hq: [
    {
      label: '2025',
      value: 448800,
      interim: true
    },
    {
      label: '2030',
      value: 548880,
      interim: false
    }
  ],
  total: [
    {
      label: '2025',
      value: 665030,
      interim: true
    },
    {
      label: '2030',
      value: 765109,
      interim: false
    }
  ]
};

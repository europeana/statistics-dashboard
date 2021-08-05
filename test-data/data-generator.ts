import {
  CHO,
  CountryDescriptor,
  DataProviderDescriptor,
  ProviderDescriptor
} from './_models/test-models';

import {
  STATIC_COUNTRIES,
  STATIC_DATA_PROVIDERS,
  STATIC_PROVIDERS,
  STATIC_RIGHTS
} from './static-data';

export class DataGenerator {
  types = ['TEXT', 'IMAGE', 'SOUND', 'VIDEO', '3D'];
  metadataTiers = ['0', 'A', 'B', 'C'];

  generateCHOs = (totalCHO: number): Array<CHO> => {
    const getCountry = (i: number): CountryDescriptor => {
      const pool = STATIC_COUNTRIES.filter((descriptor: CountryDescriptor) => {
        return descriptor.dataProviders.length > 0;
      });
      return pool[i % pool.length];
    };

    const getProvider = (
      dataProvider: DataProviderDescriptor,
      i: number
    ): ProviderDescriptor => {
      const resId = dataProvider.providers[i % dataProvider.providers.length];
      return STATIC_PROVIDERS.find((dp: ProviderDescriptor) => {
        return dp.id === resId;
      });
    };

    const getDataProvider = (
      country: CountryDescriptor,
      i: number
    ): DataProviderDescriptor => {
      const resId = country.dataProviders[i % country.dataProviders.length];
      return STATIC_DATA_PROVIDERS.find((dp: DataProviderDescriptor) => {
        return dp.id === resId;
      });
    };

    const getRights = (i: number) => {
      const index = i % STATIC_RIGHTS.length;
      return STATIC_RIGHTS[index];
    };

    return Array.from(Array(totalCHO).keys()).map((i: number) => {
      const random = i % 9 == 0 ? (i % 7 == 0 ? (i % 5 == 0 ? 0 : 1) : 2) : i;
      const type = this.types[random % this.types.length];
      const country = getCountry(i % (type.length * type.length));
      const dProvider = getDataProvider(country, i);
      return {
        datasetName: `dataset_${i}`,
        date: 0,
        contentTier: this.types.indexOf(type),
        COUNTRY: country.name,
        metadataTier: this.metadataTiers[random % 4],
        PROVIDER: getProvider(dProvider, i).name,
        DATA_PROVIDER: dProvider.name,
        TYPE: type,
        RIGHTS: getRights(i * dProvider.name.length),
        exclusions: []
      };
    });
  };
}
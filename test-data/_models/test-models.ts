import { DimensionName } from '../../src/app/_models';

export interface CHO {
  datasetName: string;
  date?: number;
  [DimensionName.contentTier]: string;
  [DimensionName.country]: string;
  [DimensionName.metadataTier]: string;
  [DimensionName.provider]: string;
  [DimensionName.dataProvider]: string;
  [DimensionName.type]: string;
  [DimensionName.rights]: string;
  exclusions: Array<string>;
}

export interface CountryDescriptor {
  name: string;
  dataProviders: Array<number>;
}

export interface IHashBoolean {
  [details: string]: boolean;
}

export interface ProviderDescriptor {
  id: number;
  name: string;
}

export interface DataProviderDescriptor {
  id: number;
  name: string;
  providers: Array<number>;
}

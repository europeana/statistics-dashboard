export interface CHO {
  datasetName: string;
  date?: number;
  contentTier: number;
  COUNTRY: string;
  metadataTier: string;
  PROVIDER: string;
  DATA_PROVIDER: string;
  TYPE: string;
  RIGHTS: string;
  exclusions: Array<string>;
}

export interface CountryDescriptor {
  name: string;
  dataProviders: Array<number>;
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

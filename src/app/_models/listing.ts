export interface ProviderDatum {
  name: string;
  dataProviders?: Array<DataProviderDatum>;
  dataProvidersShowing?: boolean;
}

export interface DataProviderDatum {
  name: string;
  isProvider?: boolean;
}

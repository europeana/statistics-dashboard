interface ProviderDatumBase {
  name: string;
  count: number;
}

export interface ProviderDatum extends ProviderDatumBase {
  dataProviders?: Array<DataProviderDatum>;
  dataProvidersShowing?: boolean;
  dataProvidersForce?: boolean;
}

export interface DataProviderDatum extends ProviderDatumBase {
  isProvider?: boolean;
}

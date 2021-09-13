export enum DimensionName {
  contentTier = 'contentTier',
  country = 'COUNTRY',
  dataProvider = 'DATA_PROVIDER',
  metadataTier = 'metadataTier',
  provider = 'PROVIDER',
  rights = 'RIGHTS',
  type = 'TYPE'
}

export interface FacetField {
  count: number;
  label: string;
}

export interface FacetFieldProcessed extends FacetField {
  percent: number;
  labelFormatted?: string;
}

export interface Facet {
  name: DimensionName;
  fields: Array<FacetField>;
}

export interface FacetProcessed extends Facet {
  fields: Array<FacetFieldProcessed>;
}

export interface RawFacet {
  facets: Array<Facet>;
  totalResults: number;
}

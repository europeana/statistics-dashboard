export enum DimensionName {
  contentTier = 'contentTier',
  COUNTRY = 'COUNTRY',
  DATA_PROVIDER = 'DATA_PROVIDER',
  metadataTier = 'metadataTier',
  PROVIDER = 'PROVIDER',
  RIGHTS = 'RIGHTS',
  TYPE = 'TYPE'
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

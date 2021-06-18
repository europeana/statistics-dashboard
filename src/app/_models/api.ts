export interface FacetField {
  count: number;
  label: string;
}

export interface FacetFieldProcessed extends FacetField {
  percent: number;
  labelFormatted?: string;
}

export interface Facet {
  name: string;
  fields: Array<FacetField>;
}

export interface FacetProcessed extends Facet {
  fields: Array<FacetFieldProcessed>;
}

export interface RawFacet {
  facets: Array<Facet>;
  totalResults: number;
}

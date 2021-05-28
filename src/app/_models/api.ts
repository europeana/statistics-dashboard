export interface FacetField {
  count: number;
  label: string;
}

export interface Facet {
  name: string;
  fields: Array<FacetField>;
}

export interface RawFacet {
  facets: Array<Facet>;
  totalResults: number;
}

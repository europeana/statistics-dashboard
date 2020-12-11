export type HeaderNameType = 'name' | 'count' | 'percent';

export interface DataProviderDatum {
  name: string;
  providers?: Array<string>;
  providersShowing?: boolean;
}

export interface MenuState {
  visible: boolean;
  disabled?: boolean;
}

export interface FacetField {
  count: number;
  label: string;
}

export interface TableRow {
  name: HeaderNameType;
  count: string;
  percent: string;
}

export interface FmtTableData {
  columns: Array<string>;
  tableRows: Array<TableRow>;
}

export interface Facet {
  name: string;
  fields: Array<FacetField>;
}

export interface NameValue {
  name: string;
  value: number;
}

export interface RawFacet {
  facets: Array<Facet>;
  totalResults: number;
}

export enum ExportType {
  CSV = 'CSV',
  PDF = 'PDF'
}

export enum ExportType {
  CSV = 'CSV',
  PDF = 'PDF',
  PNG = 'PNG'
}

export interface FilterInfo {
  term: string;
  dimension?: string;
  upToPage?: number;
}

export interface FilterState {
  visible: boolean;
  disabled?: boolean;
}

export interface FilterOptionSet {
  options: Array<NameLabel>;
  hasMore?: boolean;
}

export type HeaderNameType = 'name' | 'count' | 'percent';

export interface IHashString {
  [details: string]: string;
}

export interface IHash<T> {
  [details: string]: T;
}

export interface IHashArray<T> {
  [details: string]: Array<T>;
}

interface PortalUrlInfo {
  href: string;
  hrefRewritten?: boolean;
  rightsFilters?: Array<string>;
}

export interface TableRow {
  name: string;
  count: number;
  displayIndex?: number;
  percent: number;
  colourIndex?: number;
  highlight?: boolean;
  series: string;
  isTotal?: boolean;
  portalUrlInfo: PortalUrlInfo;
}

export interface FmtTableData {
  columns: Array<string>;
  tableRows: Array<TableRow>;
}

export interface NameLabel {
  name: string;
  label: string;
}

export interface NameLabelValid extends NameLabel {
  valid: boolean;
}

export interface NameValue {
  name: string;
  value: number;
}

export interface NamesValuePercent extends NameValue {
  percent: number;
}

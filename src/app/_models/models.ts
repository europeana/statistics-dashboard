export enum ExportType {
  CSV = 'CSV',
  PDF = 'PDF',
  PNG = 'PNG'
}

export interface FilterInfo {
  term: string;
  dimension?: string;
}

export interface FilterState {
  visible: boolean;
  disabled?: boolean;
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

export interface TableRow {
  name: string;
  nameOriginal: string;
  count: number;
  displayIndex?: number;
  percent: number;
  colourIndex?: number;
  highlight?: boolean;
  series: string;
  isTotal?: boolean;
  portalUrl: string;
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
  rawName?: string;
  percent: number;
}

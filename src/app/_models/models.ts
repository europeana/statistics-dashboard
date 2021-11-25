export type HeaderNameType = 'name' | 'count' | 'percent';

export interface IHashString {
  [details: string]: string;
}

export interface IHashNumber {
  [details: string]: number;
}

export interface IHashStringArray {
  [details: string]: Array<string>;
}

export interface FilterState {
  visible: boolean;
  disabled?: boolean;
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
}

export interface FmtTableData {
  columns: Array<string>;
  tableRows: Array<TableRow>;
}

export interface NameLabel {
  name: string;
  label: string;
}

export interface NameValue {
  name: string;
  value: number;
}

export interface NamesValuePercent extends NameValue {
  rawName?: string;
  percent: number;
}

export interface IHashArrayNameLabel {
  [details: string]: Array<NameLabel>;
}

export enum ExportType {
  CSV = 'CSV',
  PDF = 'PDF'
}

export interface FilterInfo {
  term: string;
  dimension?: string;
}

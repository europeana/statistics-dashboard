export type HeaderNameType = 'name' | 'count' | 'percent';

export interface IHash {
  [details: string]: string;
}

export interface IHashArray {
  [details: string]: Array<string>;
}

export interface FilterState {
  visible: boolean;
  disabled?: boolean;
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

export interface NameLabel {
  name: string;
  label: string;
}

export interface NameValue {
  name: string;
  value: number;
}

export interface NameValuePercent extends NameValue {
  percent: number;
}

export interface IdValue {
  id: string;
  value: number;
}

export interface IHashArrayNameLabel {
  [details: string]: Array<NameLabel>;
}

export enum ExportType {
  CSV = 'CSV',
  PDF = 'PDF'
}

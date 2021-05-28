export type HeaderNameType = 'name' | 'count' | 'percent';

export interface IHash {
  [details: string]: string;
}

export interface MenuState {
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

export interface NameValue {
  name: string;
  value: number;
}

export interface IdValue {
  id: string;
  value: number;
}

export enum ExportType {
  CSV = 'CSV',
  PDF = 'PDF'
}

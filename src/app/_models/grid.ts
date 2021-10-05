import { TableRow } from '.';

export enum SortBy {
  name = 'name',
  count = 'count'
}

export interface SortInfo {
  by: SortBy;
  dir: number;
}

export interface PagerInfo {
  currentPage: number;
  pageCount: number;
  pageRows: Array<TableRow>;
}

export interface PagerInfoExtended extends PagerInfo {
  maxPerPage: number;
  filterTerm: string;
  sort?: SortInfo;
}

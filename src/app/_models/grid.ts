import { TableRow } from '.';

export interface PagerInfo {
  currentPage: number;
  pageCount: number;
  pageRows: Array<TableRow>;
}

import { Component, Input } from '@angular/core';
import { colours } from '../_data';
import { FmtTableData, HeaderNameType, TableRow } from '../_models';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {
  @Input() getUrl: (s: string) => string;
  @Input() getUrlRow: (s: string) => string;
  @Input() title: string;

  filterString = '';
  pageRows: Array<TableRow>;
  unfilteredPageRows = [];
  sortStates = {
    count: 0,
    percent: 0
  };

  gridRows: Array<TableRow>;
  showingSeriesInfo = false;

  public colours = colours;

  applyHighlights(rows: Array<TableRow>): void {
    let highlight = true;
    let currName = '';
    rows.forEach((row: TableRow) => {
      if (row.name !== currName) {
        highlight = !highlight;
      }
      currName = row.name;
      row.highlight = highlight;
    });
  }

  autoSort(rows: Array<TableRow>): void {
    ['count', 'percent'].every((field: string) => {
      if (this.sortStates[field] !== 0) {
        this.sortRows(rows, field);
        return false;
      }
      return true;
    });
  }

  getData(): FmtTableData {
    return {
      columns: ['colour', 'series', 'name', 'count', 'percent'].map((x) => {
        return x as HeaderNameType;
      }),
      tableRows: this.gridRows
    };
  }

  /** getFilteredRows
  /* @returns unfilteredPageRows filtered by filterString
  **/
  getFilteredRows(): Array<TableRow> {
    const filter = this.filterString;
    return this.unfilteredPageRows.filter(function (d) {
      return d.name.toLowerCase().indexOf(filter) !== -1 || !filter;
    });
  }

  /** isHeaderActive
  /* template utility
  /* @param { string : state }
  **/
  isHeaderActive(state: string): boolean {
    return this.sortStates[state] !== 0;
  }

  /** setRows
  /* called from parent when data changes
  **/
  setRows(rows: Array<TableRow>): void {
    this.unfilteredPageRows = rows;
    this.updateRows();
  }

  /** setPage
  /* called from pager when page changes - sets pageRows
  /* @param { Array<TableRow> : rows } - the rows
  **/
  setPage(rows: Array<TableRow>): void {
    this.pageRows = rows;
  }

  /** bumpSortState
  /* Moves sort state one iteration through (looped) sequence -1, 0, 1
  /* Clears other sort states
  /* @param { string : header }
  **/
  bumpSortState(header: string): void {
    const ss = this.sortStates;
    let val = ss[header];
    val += 1;
    if (val > 1) {
      val = -1;
    }
    Object.keys(ss).forEach((key: string) => {
      ss[key] = 0;
    });
    ss[header] = val;
  }

  /** sort
  /* Template utility: bumps sort state and calls updateRows
  /* @param { string : field } - the field to sort on
  **/
  sort(field: string): void {
    this.bumpSortState(field);
    this.updateRows(field);
  }

  /** sortRows
  /* Sort an array of TableRow objects
  /* @param { Array<TableRow> : rows } - the rows to sort
  /* @param { string : field } - the field to sort on
  **/
  sortRows(rows: Array<TableRow>, field: string): void {
    rows.sort((rowA: TableRow, rowB: TableRow) => {
      const sortState = this.sortStates[field];
      if (sortState === 1) {
        return rowA[field] > rowB[field]
          ? 1
          : rowA[field] === rowB[field]
          ? 0
          : -1;
      } else if (sortState === -1) {
        return rowA[field] < rowB[field]
          ? 1
          : rowA[field] === rowB[field]
          ? 0
          : -1;
      } else {
        return 0;
      }
    });
  }

  /** updateRows
  /* @param { Array<TableRow> : rows }
  **/
  updateRows(sortField?: string): void {
    const rows = this.getFilteredRows();
    if (sortField) {
      this.sortRows(rows, sortField);
    } else {
      this.autoSort(rows);
    }
    this.applyHighlights(rows);
    this.gridRows = rows;
  }
}

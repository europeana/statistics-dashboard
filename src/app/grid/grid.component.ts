import { Component, Input, ViewChild } from '@angular/core';
import { colours } from '../_data';
import { FmtTableData, HeaderNameType, PagerInfo, TableRow } from '../_models';
import { GridPaginatorComponent } from '../grid-paginator';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {
  @Input() getUrl: (s: string) => string;
  @Input() getUrlRow: (s: string) => string;
  @Input() title: string;
  @ViewChild('paginator') paginator: GridPaginatorComponent;

  filterString = '';
  pageRows: Array<TableRow>;

  maxPageSize = 10;
  maxPageSizes = [5, 10, 15].map((option: number) => {
    return { title: `${option}`, value: option };
  });
  pagesAvailable = 0;

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

  /** goToPage
  /* @param { KeyboardEvent : event }
  **/
  goToPage(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const input = event.target as HTMLInputElement;
      const val = input.value.replace(/\D/g, '');
      if (val.length > 0) {
        const pageNum = parseInt(val);
        this.paginator.setPage(Math.min(this.pagesAvailable, pageNum) - 1);
      }
    }
  }

  /** setRows
  /* called from parent when data changes
  **/
  setRows(rows: Array<TableRow>): void {
    this.unfilteredPageRows = rows;
    this.updateRows();
  }

  /** setPagerInfo
  /* handle page info from pager when page changes
  /* @param { Array<TableRow> : rows } - the rows
  **/
  setPagerInfo(pagerInfo: PagerInfo): void {
    const rows = pagerInfo.rows;
    this.pageRows = rows;

    const fn = (): void => {
      this.pagesAvailable = pagerInfo.pageCount;
    };
    setTimeout(fn, 0);
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

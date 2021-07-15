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

  columnNames = ['colour', 'series', 'name', 'count', 'percent'].map((x) => {
    return x as HeaderNameType;
  });

  rowName: string;
  highlight = false;

  filterString = '';

  pageRows: Array<TableRow>;
  unfilteredPageRows = [];
  sortedAsc = {
    count: true,
    name: false
  };

  tableData: FmtTableData;
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

  bgHighlightSwitch(rowName: string): boolean {
    if (this.rowName !== rowName) {
      this.highlight = !this.highlight;
    }
    this.rowName = rowName;
    return this.highlight;
  }

  /** getTableRows
  /*
  **/
  getTableRows(): Array<TableRow> {
    return this.tableData.tableRows;
  }

  onKeyup(): void {
    const val = this.filterString;

    // filter our data
    const temp = this.unfilteredPageRows.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.updateRows(temp);
  }

  /** setRows
  /* from parent
  **/
  setRows(rows: Array<TableRow>): void {
    this.applyHighlights(rows);
    this.tableData = {
      columns: this.columnNames,
      tableRows: rows
    };
    this.unfilteredPageRows = rows;
  }

  /** setPage
  /* from pager
  **/
  setPage(rows: Array<TableRow>): void {
    this.pageRows = rows;
  }

  /** sort
  /* @param { string : field } - the field to sort on
  **/
  sort(field: string): void {
    const rows = this.tableData.tableRows
      .slice()
      .sort((rowA: TableRow, rowB: TableRow) => {
        if (this.sortedAsc[field]) {
          return rowA[field] > rowB[field]
            ? 1
            : rowA[field] === rowB[field]
            ? 0
            : -1;
        } else {
          return rowA[field] < rowB[field]
            ? 1
            : rowA[field] === rowB[field]
            ? 0
            : -1;
        }
      });

    this.sortedAsc[field] = !this.sortedAsc[field];
    this.updateRows(rows);
  }

  /** updateRows
  /* @param { Array<TableRow> : rows }
  **/
  updateRows(rows: Array<TableRow>): void {
    // colour code data
    this.applyHighlights(rows);

    // update the rows
    this.tableData.tableRows = rows;
  }
}

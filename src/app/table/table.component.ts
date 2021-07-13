import { Component, Input, ViewChild } from '@angular/core';
import {
  ColumnMode,
  DatatableComponent,
  DatatableRowDetailDirective
} from '@swimlane/ngx-datatable';

import { colours } from '../_data';
import { FmtTableData, HeaderNameType, TableRow } from '../_models';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @ViewChild('dataTable') dataTable: DatatableComponent;

  @Input() getUrl: (s: string) => string;
  @Input() getUrlRow: (s: string) => string;

  tableData: FmtTableData;
  showingSeriesInfo = false;

  columnNamesFull = ['colour', 'series', 'name', 'count', 'percent'].map(
    (x) => x as HeaderNameType
  );
  columnNames = this.columnNamesFull.slice();

  public ColumnMode = ColumnMode;
  public colours = colours;

  /** getColumnNames
  /*
  **/
  getColumnNames(): Array<HeaderNameType> {
    return this.columnNames;
  }

  /** getTableRows
  /*
  **/
  getTableRows(): Array<TableRow> {
    return this.tableData.tableRows;
  }

  /** getTableData
  /*
  **/
  getTableData(): FmtTableData {
    return this.tableData;
  }

  /** reset
  /*
  **/
  reset(): void {
    this.tableData = {
      columns: this.columnNames,
      tableRows: []
    };
  }

  /** setRows
  /*
  **/
  setRows(rows: Array<TableRow>): void {
    this.tableData = {
      columns: this.columnNames,
      tableRows: rows
    };
  }

  /** toggleExpandRow
  /*
  **/
  toggleExpandRow(row: DatatableRowDetailDirective): false {
    this.dataTable.rowDetail.toggleExpandRow(row);
    return false;
  }
}

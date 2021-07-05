import { Component, Input, ViewChild } from '@angular/core';
import {
  ColumnMode,
  DatatableComponent,
  DatatableRowDetailDirective
} from '@swimlane/ngx-datatable';

import { tableColumnNames } from '../_data';

import { FmtTableData } from '../_models';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html'
  //styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @ViewChild('dataTable') dataTable: DatatableComponent;

  @Input() tableData: FmtTableData;
  @Input() getUrl: (s: string) => string;
  @Input() getUrlRow: (s: string) => string;

  columnNames = tableColumnNames;

  public ColumnMode = ColumnMode;

  toggleExpandRow(row: DatatableRowDetailDirective): false {
    this.dataTable.rowDetail.toggleExpandRow(row);
    return false;
  }
}

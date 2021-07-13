import { Component } from '@angular/core';
import { DatatableRowDetailDirective } from '@swimlane/ngx-datatable';
import { FmtTableData, TableRow } from '../_models';

@Component({
  selector: 'app-table',
  template: ''
})
export class MockTableComponent {
  getTableData(): FmtTableData {
    return {
      columns: [],
      tableRows: []
    };
  }

  getTableRows(): Array<TableRow> {
    return [];
  }

  getColumnNames(): Array<string> {
    return [];
  }

  reset(): void {
    console.log('reset');
  }

  setRows(_: Array<TableRow>): void {
    console.log('setRows');
  }

  toggleExpandRow(_: DatatableRowDetailDirective): false {
    return false;
  }
}

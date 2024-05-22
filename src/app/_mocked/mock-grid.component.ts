import { Component } from '@angular/core';
import { FmtTableData, SortBy, SortInfo, TableRow } from '../_models';

@Component({
  standalone: true,
  selector: 'app-grid',
  template: ''
})
export class MockGridComponent {
  sortInfo: SortInfo = {
    by: SortBy.name,
    dir: -1
  };

  calculatePages(_: Array<TableRow>): Array<Array<TableRow>> {
    return [];
  }

  canPrev(): boolean {
    return false;
  }

  canNext(): boolean {
    return false;
  }

  getData(): FmtTableData {
    return {
      columns: [],
      tableRows: []
    };
  }

  setPage(_: number): void {
    // mock setPage
  }

  setRows(_: Array<TableRow>): void {
    // mock setRows
  }
}

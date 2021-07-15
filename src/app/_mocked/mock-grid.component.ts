import { Component } from '@angular/core';
import { TableRow } from '../_models';

@Component({
  selector: 'app-grid',
  template: ''
})
export class MockGridComponent {
  calculatePages(_: Array<TableRow>): Array<Array<TableRow>> {
    return [];
  }

  canPrev(): boolean {
    return false;
  }

  canNext(): boolean {
    return false;
  }

  getData() {
    return {
      columns: [],
      tableData: []
    };
  }

  setPage(_: number): void {
    console.log(`setPage()`);
  }

  setRows(_: Array<TableRow>): void {
    console.log(`setRows()`);
  }
}

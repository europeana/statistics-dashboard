import { Component } from '@angular/core';
import { FmtTableData, PagerInfoExtended, SortBy, TableRow } from '../_models';

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

  getData(): FmtTableData {
    return {
      columns: [],
      tableRows: []
    };
  }

  getExtendedPagerInfo(): PagerInfoExtended {
    return {
      maxPerPage: 0,
      currentPage: 0,
      pageCount: 0,
      pageRows: [],
      filterTerm: '',
      sort: {
        by: SortBy.name,
        dir: -1
      }
    };
  }

  setPage(_: number): void {
    console.log('setPage()');
  }

  setRows(_: Array<TableRow>): void {
    console.log('setRows()');
  }
}

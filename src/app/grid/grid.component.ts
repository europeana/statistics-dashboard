import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { colours } from '../_data';
import { filterList } from '../_helpers';

import {
  FmtTableData,
  HeaderNameType,
  PagerInfo,
  PagerInfoExtended,
  SortBy,
  TableRow
} from '../_models';
import { GridPaginatorComponent } from '../grid-paginator';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {
  @Input() getUrl: (s: string) => string;
  @Input() getUrlRow: (s: string) => string;
  @Input() facet: string;
  @Output() refreshData = new EventEmitter<void>();
  @ViewChild('paginator') paginator: GridPaginatorComponent;

  filterString = '';
  maxPageSizes = [10, 20, 50].map((option: number) => {
    return { title: `${option}`, value: option };
  });
  maxPageSize = this.maxPageSizes[0].value;
  pagerInfo: PagerInfo = {
    currentPage: 0,
    pageCount: 0,
    pageRows: []
  };
  unfilteredPageRows: Array<TableRow> = [];
  summaryRows: Array<TableRow> = [];
  sortStates = {
    count: -1,
    name: 0
  };
  gridRows: Array<TableRow>;
  isShowingSeriesInfo = false;

  public colours = colours;
  public SortBy = SortBy;

  applyHighlights(rows: Array<TableRow>): void {
    let highlight = false;
    let currName = '';
    let displayIndex = 1;
    rows.forEach((row: TableRow) => {
      if (row.name !== currName) {
        highlight = !highlight;
        row.displayIndex = displayIndex;
        displayIndex++;
      } else {
        delete row.displayIndex;
      }
      currName = row.name;
      row.highlight = highlight;
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

  getPrefix(): string {
    if (['contentTier', 'metadataTier'].includes(this.facet)) {
      return 'Tier ';
    }
    return '';
  }

  getExtendedPagerInfo(): PagerInfoExtended {
    const ss = this.sortStates;
    // the default
    let sortInfo = {
      by: SortBy.count,
      dir: 0
    };

    Object.keys(ss).forEach((field: SortBy) => {
      const state = this.sortStates[field];
      if (state !== 0) {
        sortInfo = {
          by: field as SortBy,
          dir: state
        };
      }
    });

    return Object.assign(this.pagerInfo, {
      maxPerPage: this.maxPageSize,
      filterTerm: this.filterString,
      sort: sortInfo
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
        const pageNum = Math.min(this.pagerInfo.pageCount, parseInt(val));
        this.paginator.setPage(Math.max(0, pageNum - 1));
      }
      input.value = '';
    }
  }

  /** setRows
  /* called from parent when data changes
  **/
  setRows(rows: Array<TableRow>): void {
    const normalRows = [];
    const summaryRows = [];
    rows.forEach((tr: TableRow) => {
      if (tr.isTotal) {
        summaryRows.push(tr);
      } else {
        normalRows.push(tr);
      }
    });
    this.summaryRows = summaryRows;
    this.unfilteredPageRows = normalRows;
    this.updateRows();
  }

  /** setPagerInfo
  /* handle page info from pager when page changes
  /* @param { Array<TableRow> : rows } - the rows
  **/
  setPagerInfo(pagerInfo: PagerInfo): void {
    const fn = (): void => {
      this.pagerInfo = pagerInfo;
    };
    setTimeout(fn, 0);
  }

  /** sort
  /* Template utility: bumps sort state and emits refresh event
  /* @param { string : field } - the field to sort on
  **/
  sort(field: string): void {
    this.bumpSortState(field);
    this.refreshData.emit();
  }

  /** updateRows
  /* @param { Array<TableRow> : rows }
  **/
  updateRows(): void {
    const rows = filterList(this.filterString, this.unfilteredPageRows, 'name');
    this.applyHighlights(rows);
    this.gridRows = rows;
  }
}

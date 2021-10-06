import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { colours } from '../_data';
import {
  ChartPosition,
  FmtTableData,
  HeaderNameType,
  PagerInfo,
  SortBy,
  SortInfo,
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
  @Output() chartPositionChanged = new EventEmitter<ChartPosition>();
  @ViewChild('paginator') paginator: GridPaginatorComponent;

  filterTerm = '';
  maxPageSizes = [10, 20, 50].map((option: number) => {
    return { title: `${option}`, value: option };
  });
  maxPageSize = this.maxPageSizes[0].value;
  pagerInfo: PagerInfo;
  summaryRows: Array<TableRow> = [];
  gridRows: Array<TableRow>;
  isShowingSeriesInfo = false;
  sortInfo: SortInfo = {
    by: SortBy.count,
    dir: -1
  };

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
  /* Moves sortInfo.dir one iteration through (looped) sequence -1, 0, 1
  /* Clears other sort states
  /* @param { string : header }
  **/
  bumpSortState(header: SortBy): void {
    const isChanged = this.sortInfo.by != header;
    let val = 1;

    if (!isChanged) {
      val = this.sortInfo.dir;
      val += 1;
      if (val > 1) {
        val = -1;
      }
    }

    this.sortInfo = {
      by: header,
      dir: val
    };
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

    this.applyHighlights(normalRows);
    this.gridRows = normalRows;
  }

  /** setPagerInfo
  /* handle page info from pager when page changes
  /* @param { PagerInfo : pagerInfo }
  **/
  setPagerInfo(pagerInfo: PagerInfo): void {
    const fn = (): void => {
      const doEmit = !!this.pagerInfo;
      this.pagerInfo = pagerInfo;
      if (doEmit) {
        this.chartPositionChanged.emit({
          absoluteIndex: 1
        });
      }
    };
    setTimeout(fn, 0);
  }

  /** sort
  /* Template utility: bumps sort state and emits refresh event
  /* @param { SortBy : sortBy } - the field to sort on
  **/
  sort(sortBy: SortBy): void {
    this.bumpSortState(sortBy);
    this.refreshData.emit();
  }

  /** updateRows
  /* @param { KeyboardEvent : e }
  **/
  updateRows(e: KeyboardEvent): void {
    if (e.key.length === 1 || ['Backspace', 'Delete'].includes(e.key)) {
      this.refreshData.emit();
    }
  }
}

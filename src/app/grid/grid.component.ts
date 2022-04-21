import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { colours } from '../_data';
import {
  DimensionName,
  FmtTableData,
  HeaderNameType,
  PagerInfo,
  SortBy,
  SortInfo,
  TableRow
} from '../_models';
import { APIService } from '../_services';
import { GridPaginatorComponent } from '../grid-paginator';
import { SubscriptionManager } from '../subscription-manager';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent extends SubscriptionManager {
  @Input() facet: DimensionName;
  @Input() tierPrefix: string;
  @Input() isVisible: boolean;
  @Output() refreshData = new EventEmitter<void>();
  @Output() chartPositionChanged = new EventEmitter<number>();
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
  public colHeaders = [
    $localize`:@@gridColHeaderPrefix:Records by`,
    $localize`:@@gridColHeaderCount:Count`,
    $localize`:@@gridColHeaderPercent:Percent`,
    $localize`:@@gridColHeaderView:View in Europeana`
  ];

  constructor(private readonly api: APIService) {
    super();
  }

  /** clickLinkOut
  /* overrides link handling for rightsCategory facet by appending url parameters and opening the tab directly
  /*
  /* @param { TableRow } row - the clicked row
  /* @returns { boolean } true unless facet is rightsCategory
  */
  loadFullLink(row: TableRow, clickLinkOut = false): boolean {
    if (
      row.hrefRewritten ||
      row.isTotal ||
      this.facet !== DimensionName.rightsCategory
    ) {
      // the clicked link includes the qf parameters it needs, so default browser handling
      return true;
    }

    this.subs.push(
      this.api
        .getRightsCategoryUrls(row.name)
        .subscribe((urls: Array<string>) => {
          const rightsParams = urls
            .map((url: string) => {
              return `&qf=RIGHTS:\"${url}\"`;
            })
            .join('');

          row.portalUrl = row.portalUrl + rightsParams;
          row.hrefRewritten = true;

          if (clickLinkOut) {
            // timeout and 2-stage location setting needed to avoid popup-blocker
            setTimeout(() => {
              const newWin = window.open('', '_blank');
              newWin.location.href = row.portalUrl;
            }, 0);
          }
        })
    );
    return !clickLinkOut;
  }

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
  /* @param { string } header
  **/
  bumpSortState(header: SortBy): void {
    const isChanged = this.sortInfo.by !== header;
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
      return this.tierPrefix;
    }
    return '';
  }

  /** goToPage
  /* @param { KeyboardEvent } event
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
  /* @param { Array<TableRow> } rows
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
  /* @param { PagerInfo } pagerInfo
  **/
  setPagerInfo(pagerInfo: PagerInfo): void {
    const fn = (): void => {
      const doEmit = !!this.pagerInfo;
      this.pagerInfo = pagerInfo;
      if (doEmit) {
        const position = pagerInfo.currentPage * this.maxPageSize;
        this.chartPositionChanged.emit(position);
      }
    };
    setTimeout(fn, 0);
  }

  /** sort
  /* Template utility: bumps sort state and emits refresh event
  /* @param { SortBy } sortBy - the field to sort on
  **/
  sort(sortBy: SortBy): void {
    this.bumpSortState(sortBy);
    this.refreshData.emit();
  }

  /** updateRows
  /* @param { KeyboardEvent } e
  **/
  updateRows(e: KeyboardEvent): void {
    if (e.key.length === 1 || ['Backspace', 'Delete'].includes(e.key)) {
      this.refreshData.emit();
    }
  }
}

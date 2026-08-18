import {
  Component,
  DestroyRef,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { colours, DimensionName } from '../_data';
import {
  FmtTableData,
  HeaderNameType,
  PagerInfo,
  SortBy,
  SortInfo,
  TableRow
} from '../_models';
import { APIService } from '../_services';
import { GridPaginatorComponent } from '../grid-paginator';
import { RenameApiFacetPipe } from '../_translate/rename-facet.pipe';
import { TruncateComponent } from '../truncate/truncate.component';
import { FormsModule } from '@angular/forms';
import {
  DecimalPipe,
  NgClass,
  NgStyle,
  NgTemplateOutlet
} from '@angular/common';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  imports: [
    NgClass,
    NgStyle,
    FormsModule,
    GridPaginatorComponent,
    NgTemplateOutlet,
    TruncateComponent,
    DecimalPipe,
    RenameApiFacetPipe
  ]
})
export class GridComponent {
  private readonly api = inject(APIService);
  private readonly destroyRef = inject(DestroyRef);

  facet = input.required<DimensionName>();
  tierPrefix = input<string>('');
  isVisible = input<boolean>(false);

  refreshData = output<void>();
  chartPositionChanged = output<number>();

  paginator = viewChild<GridPaginatorComponent>('paginator');

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
    $localize`:@@gridColHeaderPrefix:Items by`,
    $localize`:@@gridColHeaderCount:Count`,
    $localize`:@@gridColHeaderPercent:Percent`,
    $localize`:@@gridColHeaderView:View in Europeana`
  ];

  /** loadLinkInformation
  /* loads url parameters and appends them to row.portalUrlInfo.href (optionally opens that link)
  /*
  /* @param { TableRow } row - the object to modify
  /* @param { Array<string> } rightsGroups - the groups to load the urls from
  */
  loadLinkInformation(
    row: TableRow,
    rightsGroups: Array<string>,
    followLink: boolean
  ): void {
    this.api
      .getRightsCategoryUrls(rightsGroups)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((urls: Array<string>) => {
        const rightsParams = urls
          .map((url: string) => `&qf=RIGHTS:"${url}"`)
          .join('');

        row.portalUrlInfo.href = row.portalUrlInfo.href + rightsParams;
        row.portalUrlInfo.hrefRewritten = true;

        if (followLink) {
          setTimeout(() => {
            const newWin = window.open('', '_blank');
            if (newWin) {
              newWin.location.href = row.portalUrlInfo.href;
            }
          }, 0);
        }
      });
  }

  /* click / right click / hover handler
  /* determines if the url needs augmented, updates if it so
  /*
  /* @param { TableRow } row - the clicked row
  /* @returns { boolean } true unless facet is rightsCategory
  */
  loadFullLink(row: TableRow, clickLinkOut = false): boolean {
    if (row.portalUrlInfo.hrefRewritten) {
      return true;
    }
    // Read the facet input signal via function call execution syntax
    if (this.facet() === DimensionName.rightsCategory) {
      if (row.isTotal) {
        return true;
      } else {
        this.loadLinkInformation(row, [row.name], clickLinkOut);
        return !clickLinkOut;
      }
    } else if (
      row.portalUrlInfo.rightsFilters &&
      row.portalUrlInfo.rightsFilters.length > 0
    ) {
      this.loadLinkInformation(
        row,
        row.portalUrlInfo.rightsFilters,
        clickLinkOut
      );
      return !clickLinkOut;
    }
    return true;
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
      columns: ['colour', 'series', 'name', 'count', 'percent'].map(
        (x) => x as HeaderNameType
      ),
      tableRows: this.gridRows
    };
  }

  getPrefix(): string {
    // Read the input signal value cleanly here
    if (['contentTier', 'metadataTier'].includes(this.facet())) {
      return this.tierPrefix();
    }
    return '';
  }

  goToPage(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const inputEl = event.target as HTMLInputElement;
      const val = inputEl.value.replace(/\D/g, '');
      if (val.length > 0) {
        const pageNum = Math.min(this.pagerInfo.pageCount, parseInt(val));

        // 5. Read the viewChild signal safely and trigger its page index
        this.paginator()?.setPage(Math.max(0, pageNum - 1));
      }
      inputEl.value = '';
    }
  }

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

  sort(sortBy: SortBy): void {
    this.bumpSortState(sortBy);
    this.refreshData.emit();
  }

  updateRows(e: KeyboardEvent): void {
    if (e.key.length === 1 || ['Backspace', 'Delete'].includes(e.key)) {
      this.refreshData.emit();
    }
  }
}

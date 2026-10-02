import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { colours, DimensionName } from '../_data';
import {
  FmtTableData,
  HeaderNameType,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  filterTerm = signal<string>('');
  maxPageSizes = [10, 20, 50].map((option: number) => {
    return { title: `${option}`, value: option };
  });
  maxPageSize = signal<number>(this.maxPageSizes[0].value);
  pagerInfo = computed(() => this.paginator()?.pagerInfo());

  summaryRows = signal<Array<TableRow>>([]);
  gridRows = signal<Array<TableRow>>([]);
  isShowingSeriesInfo = signal<boolean>(false);
  sortInfo = signal<SortInfo>({
    by: SortBy.count,
    dir: -1
  });

  public readonly colours = colours;
  public readonly SortBy = SortBy;
  public readonly colHeaders = [
    $localize`:@@gridColHeaderPrefix:Items by`,
    $localize`:@@gridColHeaderCount:Count`,
    $localize`:@@gridColHeaderPercent:Percent`,
    $localize`:@@gridColHeaderView:View in Europeana`
  ];

  constructor() {
    effect(() => {
      const currentPager = this.pagerInfo();
      if (currentPager && currentPager.currentPage > 0) {
        const position = currentPager.currentPage * this.maxPageSize();
        this.chartPositionChanged.emit(position);
      }
    });
  }

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

        // Force rows signal to refresh the view since a nested property mutated inside an async callback
        this.gridRows.update((current) => [...current]);
        this.summaryRows.update((current) => [...current]);

        if (followLink) {
          const newWin = window.open('', '_blank');
          if (newWin) {
            newWin.location.href = row.portalUrlInfo.href;
          }
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
    const currentSort = this.sortInfo();
    const isChanged = currentSort.by !== header;
    let val = 1;

    if (!isChanged) {
      val = currentSort.dir;
      val += 1;
      if (val > 1) {
        val = -1;
      }
    }

    this.sortInfo.set({
      by: header,
      dir: val
    });
  }

  getData(): FmtTableData {
    return {
      columns: ['colour', 'series', 'name', 'count', 'percent'].map(
        (x) => x as HeaderNameType
      ),
      tableRows: this.gridRows()
    };
  }

  getPrefix(): string {
    if (['contentTier', 'metadataTier'].includes(this.facet())) {
      return this.tierPrefix();
    }
    return '';
  }

  goToPage(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const inputEl = event.target as HTMLInputElement;
      const val = inputEl.value.replace(/\D/g, '');
      const currentPager = this.pagerInfo();

      if (val.length > 0 && currentPager) {
        const pageNum = Math.min(currentPager.pageCount, Number.parseInt(val));
        this.paginator()?.setPage(Math.max(0, pageNum - 1));
      }
      inputEl.value = '';
    }
  }

  setRows(rows: Array<TableRow>): void {
    const normalRows: Array<TableRow> = [];
    const summaryRows: Array<TableRow> = [];

    rows.forEach((tr: TableRow) => {
      if (tr.isTotal) {
        summaryRows.push(tr);
      } else {
        normalRows.push(tr);
      }
    });

    this.applyHighlights(normalRows);

    this.summaryRows.set(summaryRows);
    this.gridRows.set(normalRows);
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

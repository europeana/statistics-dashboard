import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal
} from '@angular/core';
import { PagerInfo, TableRow } from '../_models';

@Component({
  selector: 'app-grid-paginator',
  templateUrl: './grid-paginator.component.html',
  styleUrls: ['./grid-paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class GridPaginatorComponent {
  rows = input<Array<TableRow>>([]);
  maxPageSize = input<number>(10);

  activePageIndex = linkedSignal({
    source: () => ({ rows: this.rows(), size: this.maxPageSize() }),
    computation: () => 0
  });

  paginationData = computed(() => {
    const currentRows = this.rows();
    const currentSize = this.maxPageSize();

    if (!currentRows || currentRows.length === 0) {
      return { pages: [], ranges: [], totalRows: 0, totalPageCount: 0 };
    }

    const calculatedRanges = Array.from(
      { length: Math.ceil(currentRows.length / currentSize) },
      (_, i: number) => [i * currentSize, i * currentSize + currentSize]
    );

    const pages = calculatedRanges.map(([lower, upper]) =>
      currentRows.slice(lower, upper)
    );
    const ranges = calculatedRanges.map(([lower, upper]) => [
      lower + 1,
      Math.min(upper, currentRows.length)
    ]);

    return {
      pages,
      ranges,
      totalRows: currentRows.length,
      totalPageCount: pages.length
    };
  });

  pagerInfo = computed<PagerInfo>(() => {
    const data = this.paginationData();
    const index = this.activePageIndex();
    return {
      currentPage: index,
      pageCount: data.totalPageCount,
      pageRows: data.pages[index] || []
    };
  });

  canNext = computed(
    () => this.activePageIndex() + 1 < this.paginationData().totalPageCount
  );
  canPrev = computed(() => this.activePageIndex() > 0);

  callSetPage(e: Event, index: number): false {
    e.preventDefault();
    this.setPage(index);
    return false;
  }

  setPage(index: number): void {
    if (index >= 0 && index < this.paginationData().totalPageCount) {
      this.activePageIndex.set(index);
    }
  }
}

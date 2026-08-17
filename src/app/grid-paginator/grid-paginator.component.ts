import {
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { PagerInfo, TableRow } from '../_models';

@Component({
  selector: 'app-grid-paginator',
  templateUrl: './grid-paginator.component.html',
  styleUrls: ['./grid-paginator.component.scss'],
  imports: []
})
export class GridPaginatorComponent {
  rows = input<Array<TableRow>>([]);
  maxPageSize = input<number>(10);

  change = output<PagerInfo>();

  activePageIndex = signal<number>(0);

  paginationData = computed(() => {
    const currentRows = this.rows();
    const currentSize = this.maxPageSize();

    if (!currentRows || currentRows.length === 0) {
      return { pages: [], ranges: [], totalRows: 0, totalPageCount: 0 };
    }

    const calculatedRanges = Array.from(
      { length: Math.ceil(currentRows.length / currentSize) },
      (_, i: number) => {
        const lowerIndex = i * currentSize;
        const upperIndex = lowerIndex + currentSize;
        return [lowerIndex, upperIndex];
      }
    );

    const pages = calculatedRanges.map((range: Array<number>) =>
      currentRows.slice(range[0], range[1])
    );

    const ranges = calculatedRanges.map((range: Array<number>) => [
      range[0] + 1,
      Math.min(range[1], currentRows.length)
    ]);

    return {
      pages,
      ranges,
      totalRows: currentRows.length,
      totalPageCount: pages.length
    };
  });

  get pages(): Array<Array<TableRow>> {
    return this.paginationData().pages;
  }
  get ranges(): Array<Array<number>> {
    return this.paginationData().ranges;
  }
  get totalRows(): number {
    return this.paginationData().totalRows;
  }
  get totalPageCount(): number {
    return this.paginationData().totalPageCount;
  }

  canNext = computed(() => this.activePageIndex() + 1 < this.totalPageCount);
  canPrev = computed(() => this.activePageIndex() > 0);

  constructor() {
    effect(() => {
      this.rows();
      this.maxPageSize();
      this.setPage(0);
    });
  }

  callSetPage(e: Event, index: number): false {
    e.preventDefault();
    this.setPage(index);
    return false;
  }

  setPage(index: number): void {
    this.activePageIndex.set(index);
    const data = this.paginationData();

    if (data.pages.length > 0) {
      this.change.emit({
        currentPage: index,
        pageCount: data.totalPageCount,
        pageRows: data.pages[index]
      });
    }
  }
}

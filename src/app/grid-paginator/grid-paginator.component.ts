import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PagerInfo, TableRow } from '../_models';

@Component({
  selector: 'app-grid-paginator',
  templateUrl: './grid-paginator.component.html',
  styleUrls: ['./grid-paginator.component.scss']
})
export class GridPaginatorComponent {
  @Input() set rows(rows: Array<TableRow>) {
    this.pages = this.calculatePages(rows);
    this.setPage(0);
  }

  @Input() set maxPageSize(maxPageSize: number) {
    this._maxPageSize = maxPageSize;
    if (this.pages) {
      const allPages = this.pages[0].concat(...this.pages.splice(1));
      this.pages = this.calculatePages(allPages);
      this.setPage(0);
    }
  }
  @Output() change: EventEmitter<PagerInfo> = new EventEmitter();

  activePageIndex = 0;
  pages: Array<Array<TableRow>>;
  ranges: Array<Array<number>>;
  _maxPageSize = 10;
  totalPageCount: number;
  totalRows: number;

  calculatePages(rows: Array<TableRow>): Array<Array<TableRow>> {
    const ranges = ([] = Array.from(
      {
        length: Math.ceil(rows.length / this._maxPageSize)
      },
      (v, i: number) => {
        const lowerIndex = i * this._maxPageSize;
        const upperIndex = i * this._maxPageSize + this._maxPageSize;
        return [lowerIndex, upperIndex];
      }
    ));

    const pages = ranges.map((range: Array<number>) => {
      return rows.slice(range[0], range[1]);
    });

    this.ranges = ranges.map((range: Array<number>) => {
      return [range[0] + 1, Math.min(range[1], rows.length)];
    });

    this.totalRows = rows.length;
    this.totalPageCount = pages.length;
    return pages;
  }

  canNext(): boolean {
    return this.activePageIndex + 1 < this.totalPageCount;
  }

  canPrev(): boolean {
    return this.activePageIndex > 0;
  }

  callSetPage(e: Event, index: number): false {
    e.preventDefault();
    this.setPage(index);
    return false;
  }

  setPage(index: number): void {
    this.activePageIndex = index;
    this.change.emit({
      currentPage: index,
      pageCount: this.pages.length,
      pageRows: this.pages[index]
    });
  }
}

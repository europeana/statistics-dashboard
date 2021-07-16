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
  _maxPageSize = 10;
  totalPageCount: number;

  calculatePages(rows: Array<TableRow>): Array<Array<TableRow>> {
    const pages = ([] = Array.from(
      {
        length: Math.ceil(rows.length / this._maxPageSize)
      },
      (v, i: number) => {
        return rows.slice(
          i * this._maxPageSize,
          i * this._maxPageSize + this._maxPageSize
        );
      }
    ));

    this.totalPageCount = pages.length;
    return pages;
  }

  canPrev(): boolean {
    return this.activePageIndex > 0;
  }

  canNext(): boolean {
    return this.activePageIndex + 1 < this.totalPageCount;
  }

  setPage(index: number): void {
    this.activePageIndex = index;
    this.change.emit({
      pageCount: this.pages.length,
      rows: this.pages[index]
    });
  }
}

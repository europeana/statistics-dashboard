import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableRow } from '../_models';

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

  @Output() change: EventEmitter<Array<TableRow>> = new EventEmitter();

  activePageIndex = 0;
  pages: Array<Array<TableRow>>;
  maxPageSize = 10;
  totalPageCount: number;

  calculatePages(rows: Array<TableRow>): Array<Array<TableRow>> {
    const pages = ([] = Array.from(
      {
        length: Math.ceil(rows.length / this.maxPageSize)
      },
      (v, i: number) => {
        return rows.slice(
          i * this.maxPageSize,
          i * this.maxPageSize + this.maxPageSize
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
    this.change.emit(this.pages[index]);
  }
}

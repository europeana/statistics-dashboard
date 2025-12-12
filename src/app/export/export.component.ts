import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { ExportType, FmtTableData } from '../_models';
import { ExportCSVService, ExportPDFService } from '../_services';
import { NgClass } from '@angular/common';

import { OpenerFocusDirective } from '../_directives';
import { GridComponent } from '../grid';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  imports: [GridComponent, NgClass, OpenerFocusDirective]
})
export class ExportComponent {
  get currentUrl(): string {
    return window.location.href;
  }

  changeDetector = inject(ChangeDetectorRef);

  @Input() getGridData: () => FmtTableData;
  @Input() getChartData: () => Promise<string>;

  @Output() onClose = new EventEmitter<boolean>();
  @ViewChild('contentRef') contentRef: ElementRef;
  @ViewChild('downloadAnchor') downloadAnchor: ElementRef;
  @ViewChild('closer') closer: ElementRef;
  @ViewChild('printableGrid') printableGrid: GridComponent;

  imgDataUrl: string;
  printable = false;
  openedFromToolbar = false;

  public ExportType = ExportType;
  active = false;
  copied = false;
  msMsgDisplay = 2000;
  _tabIndex = -1;

  set tabIndex(value: number) {
    this._tabIndex = value;
    if (value === 0) {
      this.closer.nativeElement.focus();
    }
  }

  get tabIndex(): number {
    return this._tabIndex;
  }

  constructor(
    private readonly csv: ExportCSVService,
    private readonly pdf: ExportPDFService
  ) {}

  copy(): void {
    navigator.clipboard.writeText(this.contentRef.nativeElement.value);
    this.copied = true;
    const fn = (): void => {
      this.copied = false;
    };
    setTimeout(fn, this.msMsgDisplay);
  }

  export(type: ExportType): void {
    const gridData = this.getGridData();
    this.printable = false;

    if (type === ExportType.CSV) {
      const data = this.csv.csvFromTableRows(
        gridData.columns,
        gridData.tableRows
      );
      this.csv.download(data, this.downloadAnchor);
    } else if (type === ExportType.PDF) {
      this.printable = true;
      this.getChartData().then((imgUrl: string) => {
        this.imgDataUrl = imgUrl;
        this.changeDetector.detectChanges();
        this.pdf.exportPDF(
          document.querySelector('.printable-content'),
          'xxx.pdf'
        );
      });
      this.printableGrid.setRows(gridData.tableRows);
      this.printableGrid.maxPageSize = gridData.tableRows.length;
    } else if (type === ExportType.PNG) {
      this.getChartData().then((imgUrl: string) => {
        const anchor = document.createElement('a');
        anchor.href = imgUrl;
        anchor.target = '_blank';
        anchor.download = 'image.png';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      });
    }
  }

  /**
   * fnHide
   *
   * connect OpenerFocusDirective to the correct opener
   **/
  fnHide(): void {
    this.toggleActive(this.openedFromToolbar);
  }

  /**
   * toggleActive
   *
   * @param { boolean } fromToolbar - flags if component was opened from the toolbar
   **/
  toggleActive(fromToolbar?: boolean): void {
    if (typeof fromToolbar !== 'undefined') {
      this.openedFromToolbar = fromToolbar;
    }

    this.active = !this.active;
    this.tabIndex = this.active ? 0 : -1;

    if (!this.active) {
      this.onClose.emit(this.openedFromToolbar);
    }
  }
}

import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { ExportType, FmtTableData } from '../_models';
import { ExportCSVService, ExportPDFService } from '../_services';
import { OpenerFocusDirective } from '../_directives';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  imports: [OpenerFocusDirective]
})
export class ExportComponent {
  get currentUrl(): string {
    return window.location.href;
  }

  getGridData = input.required<() => FmtTableData>();
  getChartData = input.required<() => Promise<string>>();
  getChartTitle = input.required<() => string>();

  closeExport = output<boolean>();

  contentRef = viewChild.required<ElementRef<HTMLInputElement>>('contentRef');
  downloadAnchor =
    viewChild.required<ElementRef<HTMLAnchorElement>>('downloadAnchor');
  closer = viewChild.required<ElementRef<HTMLAnchorElement>>('closer');

  openedFromToolbar = false;
  public ExportType = ExportType;

  active = false;
  busy = false;
  copied = false;
  msMsgDisplay = 2000;
  _tabIndex = -1;

  set tabIndex(value: number) {
    this._tabIndex = value;
    if (value === 0) {
      // Resolve the signal query reference and focus
      this.closer().nativeElement.focus();
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
    navigator.clipboard.writeText(this.contentRef().nativeElement.value);
    this.copied = true;
    const fn = (): void => {
      this.copied = false;
    };
    setTimeout(fn, this.msMsgDisplay);
  }

  export(type: ExportType): void {
    const gridData = this.getGridData()();

    if (type === ExportType.CSV) {
      const data = this.csv.csvFromTableRows(
        gridData.columns,
        gridData.tableRows
      );
      this.csv.download(data, this.downloadAnchor());
    } else if (type === ExportType.PDF) {
      this.busy = true;
      this.getChartData()().then((imgUrl: string) => {
        this.pdf.download(this.getChartTitle()(), gridData, imgUrl);
        this.busy = false;
      });
    } else if (type === ExportType.PNG) {
      this.getChartData()().then((imgUrl: string) => {
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
    if (fromToolbar !== undefined) {
      this.openedFromToolbar = fromToolbar;
    }

    this.active = !this.active;
    this.tabIndex = this.active ? 0 : -1;

    if (!this.active) {
      this.closeExport.emit(this.openedFromToolbar);
    }
  }
}

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

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
  _tabIndex = -1;
  msMsgDisplay = 2000;

  set tabIndex(value: number) {
    this._tabIndex = value;
    if (value === 0) {
      this.closer().nativeElement.focus();
    }
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();

    setTimeout(() => {
      this.copied = false;
      this.cdr.markForCheck();
    }, this.msMsgDisplay);
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
      this.cdr.markForCheck();
      this.getChartData()().then((imgUrl: string) => {
        this.pdf.download(this.getChartTitle()(), gridData, imgUrl);
        this.busy = false;
        this.cdr.markForCheck();
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

  fnHide(): void {
    this.toggleActive(this.openedFromToolbar);
  }

  toggleActive(fromToolbar?: boolean): void {
    if (fromToolbar !== undefined) {
      this.openedFromToolbar = fromToolbar;
    }

    this.active = !this.active;
    this.tabIndex = this.active ? 0 : -1;

    if (!this.active) {
      this.closeExport.emit(this.openedFromToolbar);
    }
    this.cdr.markForCheck();
  }
}

import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ExportType, FmtTableData } from '../_models';
import { ExportCSVService, ExportPDFService } from '../_services';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent {
  get currentUrl(): string {
    return window.location.href;
  }

  @Input() getGridData: () => FmtTableData;
  @Input() getChartData: () => Promise<string>;
  @ViewChild('contentRef') contentRef: ElementRef;
  @ViewChild('downloadAnchor') downloadAnchor: ElementRef;

  public ExportType = ExportType;
  active = false;
  copied = false;
  msMsgDisplay = 2000;

  constructor(
    private readonly csv: ExportCSVService,
    private readonly pdf: ExportPDFService
  ) {}

  copy(): void {
    const element = this.contentRef.nativeElement;
    element.select();
    document.execCommand('copy');
    element.setSelectionRange(0, 0);
    this.copied = true;

    const fn = (): void => {
      this.copied = false;
    };
    setTimeout(fn, this.msMsgDisplay);
  }

  export(type: ExportType): void {
    const gridData = this.getGridData();
    if (type === ExportType.CSV) {
      const data = this.csv.csvFromTableRows(
        gridData.columns,
        gridData.tableRows
      );
      this.csv.download(data, this.downloadAnchor);
    } else if (type === ExportType.PDF) {
      this.getChartData().then((imgUrl: string) => {
        this.pdf.download(gridData, imgUrl);
      });
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

  toggleActive(): void {
    this.active = !this.active;
  }
}

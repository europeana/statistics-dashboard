import { ElementRef, Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import { FmtTableData, TableRow } from '../_models';

@Injectable({ providedIn: 'root' })
export class ExportPDFService {
  getFillColour(rowIndex: number): string | null {
    return rowIndex % 2 === 0 ? '#CCCCCC' : null;
  }

  getHTML(tableData: FmtTableData, imgUrlData: string): any {
    return {
      content: [
        { text: 'Tables', style: 'header' },
        {
          image: imgUrlData,
          width: 300,
          alignment: 'center'
        },
        {
          table: {
            body: [
              tableData.columns.map((s: string) => {
                return {
                  text: s,
                  style: 'tableHeader',
                  alignment: 'center'
                };
              }),
              ...tableData.tableRows.map((tr: TableRow) => {
                return [tr.name, tr.count, tr.percent];
              })
            ],
            margin: [0, 30]
          },
          layout: {
            fillColor: this.getFillColour
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'black'
        }
      }
    };
  }

  download(tableData: FmtTableData, imgUrlData: string): void {
    pdfMake.createPdf(this.getHTML(tableData, imgUrlData)).download();
  }

  getChartAsImageUrl(canvas: ElementRef, source: ElementRef): Promise<string> {
    return new Promise((resolve) => {
      html2canvas(source.nativeElement).then(
        (canvasHTML: HTMLCanvasElement) => {
          canvas.nativeElement.src = canvasHTML.toDataURL('image/png');
          resolve(canvas.nativeElement.src);
        }
      );
    });
  }
}

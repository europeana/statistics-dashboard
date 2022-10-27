import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import { FmtTableData, TableRow } from '../_models';

@Injectable({ providedIn: 'root' })
export class ExportPDFService {
  getFillColour(rowIndex: number): string | null {
    return rowIndex % 2 === 0 ? '#CCCCCC' : null;
  }

  download(tableData: FmtTableData, imgUrlData: string): void {
    const layout = {
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
              tableData.columns.slice(1).map((s: string) => {
                return {
                  text: `${s}`,
                  style: 'tableHeader',
                  alignment: 'center'
                };
              }),
              ...tableData.tableRows.map((tr: TableRow) => {
                const result = [];
                tableData.columns.slice(1).forEach((s: string) => {
                  result.push(tr[`${s}`]);
                });
                return result;
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
    const pdfDocGenerator = pdfMake.createPdf(layout);
    pdfDocGenerator.download();
  }
}

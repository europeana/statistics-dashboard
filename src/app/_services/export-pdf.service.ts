import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

import { FmtTableData, TableRow } from '../_models';

@Injectable({ providedIn: 'root' })
export class ExportPDFService {
  constructor() {
    pdfMake.addVirtualFileSystem(pdfFonts);
  }

  download(title: string, tableData: FmtTableData, imgUrlData: string): void {
    const layout = {
      content: [
        { text: title, style: 'header' },
        {
          image: imgUrlData,
          width: 500,
          alignment: 'center'
        },
        {
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [
              tableData.columns.slice(1).map((s: string, index: number) => {
                return {
                  text: `${s[0].toUpperCase()}${s.slice(1, s.length)}`,
                  style: 'tableHeader',
                  alignment: index ? 'right' : 'left'
                };
              }),
              ...tableData.tableRows.map((tr: TableRow) => {
                const result = [];
                tableData.columns
                  .slice(1)
                  .forEach((s: string, index: number) => {
                    const suffix = index === 3 ? '%' : '';
                    result.push({
                      text: tr[`${s}`] + suffix,
                      alignment: index ? 'right' : 'left',
                      noWrap: true
                    });
                  });
                return result;
              })
            ],
            margin: [0, 30]
          },
          layout: 'lightHorizontalLines'
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
      },
      footer: (currentPage, pageCount) => {
        return {
          text: `Page ${currentPage.toString()} of ${pageCount}`,
          alignment: 'center'
        };
      }
    };
    const pdfDocGenerator = pdfMake.createPdf(layout);
    pdfDocGenerator.download();
  }
}

import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

@Injectable({ providedIn: 'root' })
export class ExportPDFService {
  pdfDoc: jsPDF;

  constructor() {
    this.pdfDoc = new jsPDF('p', 'pt', 'a4');
  }
  /** exportPDF
   * temporarily sets css class 'pdf' on viewer element
   * temporarily sets isBusy on pageData object
   * genrates and saves pdf
   **/
  exportPDF(elToExport: HTMLElement, fileName: string): void {
    this.pdfDoc.html(elToExport, {
      callback: function (doc) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);

        const pageCount = doc.internal.pages.length;

        for (let i = 1; i < pageCount; i++) {
          doc.setPage(i);
          doc.text(
            `Page ${i} of ${pageCount - 1}`,
            doc.internal.pageSize.width / 2 - 22,
            doc.internal.pageSize.height - 15
          );
        }
        doc.save(fileName);
      },
      margin: [10, 10, 40, 10],
      autoPaging: 'text',
      x: 0,
      y: 0,
      width: elToExport.offsetWidth * 0.78,
      windowWidth: elToExport.offsetWidth
    });
  }
}

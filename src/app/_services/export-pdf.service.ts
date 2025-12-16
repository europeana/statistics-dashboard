import { Injectable } from '@angular/core';
import { JSPDFType } from '../_models';

@Injectable({ providedIn: 'root' })
export class ExportPDFService {
  // defer loading of pdf library
  async getJsPDF(): Promise<JSPDFType> {
    const fontUrl =
      '/assets/fonts/noto/NotoSans-Italic-VariableFont_wdth,wght.ttf';
    const jsPDF = (await import('jspdf')).default;
    const pdfDoc = new jsPDF('p', 'pt', 'a4');
    pdfDoc.addFont(fontUrl, 'Noto Sans', 'normal');
    pdfDoc.addFont(fontUrl, 'Noto Sans', 'bold');
    return pdfDoc as unknown as JSPDFType;
  }

  /** exportPDF
   **/
  async exportPDF(
    elToExport: HTMLElement,
    fileName: string,
    callback: () => void
  ): Promise<void> {
    const pdfDoc = await this.getJsPDF();

    pdfDoc.html(elToExport, {
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
        callback();
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

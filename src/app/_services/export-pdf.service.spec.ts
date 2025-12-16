import { TestBed, waitForAsync } from '@angular/core/testing';
import { HTMLWorker } from 'jspdf';
import { ExportPDFService } from './';
import { JSPDFType } from '../_models';

describe('ExportPDFService', () => {
  let service: ExportPDFService;

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const fnMockPdfFromHtml = (_: HTMLElement, ops: {}): HTMLWorker => {
    // eslint-disable-next-line no-empty-pattern
    (ops as { callback: ({}) => HTMLWorker }).callback({
      setFont: (): void => {
        // not implemented
      },
      setFontSize: (): void => {
        // not implemented
      },
      setPage: (): void => {
        // not implemented
      },
      save: (): void => {
        // not implemented
      },
      text: (): void => {
        // not implemented
      },
      internal: {
        pages: {
          length: 2
        },
        pageSize: {
          width: 1,
          height: 1
        }
      }
    });
    return {} as unknown as HTMLWorker;
  };

  const getMockJsPDF = (): Promise<JSPDFType> => {
    return new Promise((resolve) => {
      resolve({
        html: fnMockPdfFromHtml,
        addFont: () => {
          // not implemented
        }
      } as unknown as JSPDFType);
    });
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [ExportPDFService]
    }).compileComponents();
    service = TestBed.inject(ExportPDFService);
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get the jsPDF instance', async () => {
    const jspdf = await service.getJsPDF();
    expect(jspdf).toBeTruthy();
  });

  it('should export the PDF', async () => {
    jest.spyOn(service, 'getJsPDF').mockImplementation(getMockJsPDF);
    const callback = jest.fn();
    await service.exportPDF({} as HTMLElement, '', callback);
    expect(callback).toHaveBeenCalled();
  });
});

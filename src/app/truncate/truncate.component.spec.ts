import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { TruncateComponent } from './';
import { HighlightMatchPipe } from '../_translate';

describe('TruncateComponent', () => {
  let component: TruncateComponent;
  let fixture: ComponentFixture<TruncateComponent>;

  beforeAll(() => {
    class MockResizeObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    }
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: MockResizeObserver
    });
  });

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      imports: [TruncateComponent],
      providers: [HighlightMatchPipe]
    }).compileComponents();
  };

  beforeEach(async () => {
    await configureTestBed();
    fixture = TestBed.createComponent(TruncateComponent);
    component = fixture.componentInstance;

    const parentSpan = document.createElement('span');
    const childSpan = document.createElement('span');
    parentSpan.appendChild(childSpan);

    const mockElementRef = {
      nativeElement: parentSpan
    } as ElementRef;

    jest.spyOn(component, 'container').mockReturnValue(mockElementRef);
    jest.spyOn(component, 'elRefTextLeft').mockReturnValue(mockElementRef);
    jest.spyOn(component, 'elRefTextRight').mockReturnValue(mockElementRef);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should truncate the text on data input change pass', () => {
    const spyTruncate = jest.spyOn(component, 'truncateTextToFit');
    fixture.componentRef.setInput('text', 'xxxx');
    fixture.detectChanges();

    expect(spyTruncate).toHaveBeenCalled();
  });

  it('should attach a layout ResizeObserver instance on init', () => {
    const containerEl = component.container()?.nativeElement;
    expect(containerEl).toBeTruthy();
  });

  it('should disconnect the ResizeObserver layout binding on destroy', () => {
    const observerInstance = component['resizeObserver'];
    if (observerInstance) {
      const spyDisconnect = jest.spyOn(observerInstance, 'disconnect');
      fixture.destroy();
      expect(spyDisconnect).toHaveBeenCalled();
    } else {
      fail('ResizeObserver instance was not initialized on the component.');
    }
  });

  it('should process text truncation iterations correctly across different layout conditions', () => {
    const outerEl = document.createElement('span');
    const leftEl = document.createElement('span');
    const rightEl = document.createElement('span');
    leftEl.appendChild(document.createElement('span'));

    const scenarios = [
      {
        left: null,
        right: null,
        ellipsisOnFirstPass: false,
        wOuter: 200,
        wL: 0,
        wR: 0,
        expectedOmit: 0
      },
      {
        left: leftEl,
        right: rightEl,
        ellipsisOnFirstPass: false, // Fits perfectly -> breaks out immediately
        wOuter: 200,
        wL: 80,
        wR: 80,
        expectedOmit: 0
      },
      {
        left: leftEl,
        right: rightEl,
        ellipsisOnFirstPass: true, // Needs adjustment -> runs once, trims, then fits
        wOuter: 200,
        wL: 120,
        wR: 100, // 120 + 100 = 220 (> 200 Max)
        expectedOmit: 2
      }
    ];

    scenarios.forEach(
      ({ left, right, ellipsisOnFirstPass, wOuter, wL, wR, expectedOmit }) => {
        jest
          .spyOn(component, 'container')
          .mockReturnValue(
            outerEl
              ? ({ nativeElement: outerEl } as unknown as ElementRef)
              : undefined
          );

        jest
          .spyOn(component, 'elRefTextLeft')
          .mockReturnValue(
            left
              ? ({ nativeElement: left } as unknown as ElementRef)
              : undefined
          );

        jest
          .spyOn(component, 'elRefTextRight')
          .mockReturnValue(
            right
              ? ({ nativeElement: right } as unknown as ElementRef)
              : undefined
          );

        // Simulate a real layout: return ellipsis flag on first check, but false once trimmed
        let isFirstCheck = true;
        jest.spyOn(component, 'isEllipsisActive').mockImplementation(() => {
          if (isFirstCheck) {
            isFirstCheck = false;
            return ellipsisOnFirstPass;
          }
          return false;
        });

        jest
          .spyOn(outerEl, 'getBoundingClientRect')
          .mockReturnValue({ width: wOuter } as DOMRect);

        if (left && right) {
          jest
            .spyOn(left, 'getBoundingClientRect')
            .mockReturnValue({ width: wL } as DOMRect);
          jest
            .spyOn(right, 'getBoundingClientRect')
            .mockReturnValue({ width: wR } as DOMRect);
        }

        // Reset values
        component.omitCount = 0;

        // Update state via input signals safely
        fixture.componentRef.setInput('text', 'abcdefgh');
        fixture.detectChanges();

        component.truncateTextToFit();

        expect(component.omitCount).toEqual(expectedOmit);
      }
    );
  });
});

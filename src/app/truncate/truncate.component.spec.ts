import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { ResizeComponent } from '../resize';
import { TruncateComponent } from './';
import { HighlightMatchPipe } from '../_translate';

describe('TruncateComponent', () => {
  let component: TruncateComponent;
  let fixture: ComponentFixture<TruncateComponent>;

  const configureTestBed = (): void => {
    TestBed.configureTestingModule({
      imports: [TruncateComponent, ResizeComponent],
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

    jest.spyOn(component, 'elRefTextLeft').mockReturnValue(mockElementRef);
    jest.spyOn(component, 'elRefTextRight').mockReturnValue(mockElementRef);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split the text on init', () => {
    const spySplitText = jest.spyOn(component, 'splitText');
    fixture.componentRef.setInput('text', 'xxxx');
    fixture.detectChanges();

    expect(spySplitText).toHaveBeenCalled();
  });

  it('should split the text on resize', async () => {
    fixture.componentRef.setInput('text', 'xxxx');
    fixture.detectChanges();
    const spySplitText = jest.spyOn(component, 'splitText');

    jest.useFakeTimers();

    window.dispatchEvent(new Event('resize'));

    jest.advanceTimersByTime(component.debounceMS);

    expect(spySplitText).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should split the text recursively', () => {
    jest.spyOn(component, 'isEllipsisActive').mockReturnValue(false);

    let rawText = 'xxxx';
    for (let x = 0; x < 10; x++) {
      rawText = rawText + rawText;
    }

    const spySplitText = jest.spyOn(component, 'splitText');

    fixture.componentRef.setInput('text', rawText);
    fixture.detectChanges();

    component.omitCount = 2;
    component.callSplitText();

    expect(component.omitCount).toEqual(0);
    expect(spySplitText).toHaveBeenCalled();
  });

  it('should test all callSplitText branches correctly', () => {
    const leftEl = document.createElement('span');
    const rightEl = document.createElement('span');
    leftEl.appendChild(document.createElement('span'));

    const scenarios = [
      {
        left: null,
        right: null,
        ellipsis: false,
        wL: 0,
        wR: 0,
        rec: 0,
        expectedOmit: 0,
        shouldSplit: false
      },
      {
        left: leftEl,
        right: rightEl,
        ellipsis: true,
        wL: 100,
        wR: 150,
        rec: 0,
        expectedOmit: 2,
        shouldSplit: true
      },
      {
        left: leftEl,
        right: rightEl,
        ellipsis: true,
        wL: 100,
        wR: 150,
        rec: 5,
        expectedOmit: 2,
        shouldSplit: false
      }
    ];

    scenarios.forEach(
      ({ left, right, ellipsis, wL, wR, rec, expectedOmit, shouldSplit }) => {
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

        jest.spyOn(component, 'isEllipsisActive').mockReturnValue(ellipsis);

        if (left && right) {
          jest
            .spyOn(left, 'getBoundingClientRect')
            .mockReturnValue({ width: wL } as DOMRect);
          jest
            .spyOn(right, 'getBoundingClientRect')
            .mockReturnValue({ width: wR } as DOMRect);
        }

        const spySplitText = jest
          .spyOn(component, 'splitText')
          .mockImplementation();

        spySplitText.mockClear();

        component['_text'] = 'abcdefgh';
        component.omitCount = 0;
        component.maxRecursions = 5;

        component.callSplitText(rec);

        expect(component.omitCount).toEqual(expectedOmit);
        if (shouldSplit) expect(spySplitText).toHaveBeenCalled();
        else expect(spySplitText).not.toHaveBeenCalled();
      }
    );
  });
});

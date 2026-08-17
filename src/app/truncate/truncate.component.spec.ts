import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
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

  beforeEach(waitForAsync(() => {
    configureTestBed();
  }));

  beforeEach(() => {
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

  it('should split the text on resize', fakeAsync(() => {
    fixture.componentRef.setInput('text', 'xxxx');
    fixture.detectChanges();
    const spySplitText = jest.spyOn(component, 'splitText');
    window.dispatchEvent(new Event('resize'));
    tick(component.debounceMS);
    expect(spySplitText).toHaveBeenCalled();
  }));

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
});

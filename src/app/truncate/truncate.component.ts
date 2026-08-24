import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  viewChild
} from '@angular/core';
import { HighlightMatchPipe } from '../_translate/highlight-match.pipe';
import { NgClass } from '@angular/common';
import { ResizeComponent } from '../resize/resize.component';

@Component({
  selector: 'app-truncate',
  templateUrl: './truncate.component.html',
  styleUrls: ['./truncate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Secure OnPush bounds
  standalone: true,
  imports: [ResizeComponent, NgClass, HighlightMatchPipe]
})
export class TruncateComponent implements AfterViewInit {
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly elRefTextLeft = viewChild<ElementRef>('elRefTextLeft');
  readonly elRefTextRight = viewChild<ElementRef>('elRefTextRight');

  private _text = '';
  readonly text = input<string, string>('', {
    transform: (value: string) => {
      this._text = value || '';
      this.omitCount = 0;
      this.splitText();
      return this._text;
    }
  });

  readonly highlightText = input<string>('');

  applySpace = false;
  maxRecursions = 100;
  omitCount = 0;
  omitStep = 2;
  textLeft = '';
  textRight = '';

  public debounceMS = 500;

  ngAfterViewInit(): void {
    this.splitText();
  }

  isEllipsisActive(): boolean {
    const leftEl = this.elRefTextLeft()?.nativeElement;
    const childWidth = leftEl?.firstElementChild?.getBoundingClientRect().width;
    const parentWidth = leftEl?.getBoundingClientRect().width;

    return !!(childWidth && parentWidth && childWidth > parentWidth);
  }

  /** splitText
   * Splits the text variable according to current omitCount settings safely inside a microtask frame
   **/
  splitText(recursions = 0): void {
    const rawText = this._text;
    if (!rawText) return;

    const textLength = rawText.length;
    const omit = Math.floor(this.omitCount / 2);
    const cutOff = Math.floor(textLength / 2);

    this.textLeft = rawText.substring(0, cutOff - omit);
    this.textRight = rawText.substring(cutOff + omit);

    this.applySpace =
      this.textLeft.endsWith(' ') || this.textRight.startsWith(' ');

    this.changeDetector.markForCheck();

    const leftEl = this.elRefTextLeft()?.nativeElement;
    const rightEl = this.elRefTextRight()?.nativeElement;

    if (leftEl?.firstElementChild) {
      leftEl.firstElementChild.innerHTML = this.textLeft;
    }

    if (rightEl) {
      rightEl.innerHTML = this.textRight;
      rightEl.classList.toggle('with-leading-space', !!this.applySpace);
    }

    this.callSplitText(recursions);
  }

  /** Companion function for splitText to call it recursively
   **/
  callSplitText(recursions = 0): void {
    const leftEl = this.elRefTextLeft()?.nativeElement;
    const rightEl = this.elRefTextRight()?.nativeElement;
    if (!leftEl || !rightEl) return;

    if (!this.isEllipsisActive()) {
      if (this.omitCount !== 0) {
        this.omitCount = Math.max(this.omitCount - this.omitStep, 0);
        this.splitText(this.maxRecursions);
      }
    } else {
      const wLeft = leftEl.getBoundingClientRect().width;
      const wRight = rightEl.getBoundingClientRect().width;

      if (wRight > wLeft) {
        this.omitCount += this.omitStep;
        if (recursions < this.maxRecursions) {
          this.splitText(recursions + 1);
        }
      }
    }
  }
}

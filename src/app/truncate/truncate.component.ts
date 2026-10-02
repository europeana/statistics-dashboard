import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  viewChild
} from '@angular/core';
import { HighlightMatchPipe } from '../_translate/highlight-match.pipe';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-truncate',
  templateUrl: './truncate.component.html',
  styleUrls: ['./truncate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass, HighlightMatchPipe]
})
export class TruncateComponent implements AfterViewInit, OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly elRefTextLeft = viewChild<ElementRef>('elRefTextLeft');
  readonly elRefTextRight = viewChild<ElementRef>('elRefTextRight');
  readonly container = viewChild<ElementRef>('container');

  private _text = '';
  readonly text = input<string, string>('', {
    transform: (value: string) => {
      this._text = value || '';
      this.omitCount = 0;
      this.truncateTextToFit();
      return this._text;
    }
  });

  readonly highlightText = input<string>('');

  applySpace = false;
  omitCount = 0;
  omitStep = 2;
  textLeft = '';
  textRight = '';

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    const containerEl = this.container()?.nativeElement;
    if (containerEl) {
      this.resizeObserver = new ResizeObserver(() => {
        this.truncateTextToFit();
      });
      this.resizeObserver.observe(containerEl);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  isEllipsisActive(): boolean {
    const leftEl = this.elRefTextLeft()?.nativeElement;
    const childWidth = leftEl?.firstElementChild?.getBoundingClientRect().width;
    const parentWidth = leftEl?.getBoundingClientRect().width;
    return !!(childWidth && parentWidth && childWidth > parentWidth);
  }

  /**
   * Calculates structural slices across a flat iterative pass to prevent loop recursion crashes.
   **/
  truncateTextToFit(): void {
    const rawText = this._text;
    if (!rawText) return;

    this.omitCount = 0;
    let iterations = 0;
    const maxIterations = 50; // Safety ceiling to handle tight boundary layouts completely fast

    while (iterations < maxIterations) {
      const textLength = rawText.length;
      const omit = Math.floor(this.omitCount / 2);
      const cutOff = Math.floor(textLength / 2);

      this.textLeft = rawText.substring(0, cutOff - omit);
      this.textRight = rawText.substring(cutOff + omit);
      this.applySpace =
        this.textLeft.endsWith(' ') || this.textRight.startsWith(' ');

      // Synchronously notify the template bindings to recalculate string widths in the DOM
      this.changeDetector.detectChanges();

      const outerContainer = this.container()?.nativeElement;
      const leftEl = this.elRefTextLeft()?.nativeElement;
      const rightEl = this.elRefTextRight()?.nativeElement;

      if (!outerContainer || !leftEl || !rightEl) break;

      if (!this.isEllipsisActive()) {
        break; // Layout fits perfectly fine
      } else {
        const combinedWidth =
          leftEl.getBoundingClientRect().width +
          rightEl.getBoundingClientRect().width;
        const maxWidth = outerContainer.getBoundingClientRect().width;

        // Strip characters if sub-elements combine to overflow the outer layout limit
        if (combinedWidth > maxWidth && this.omitCount < rawText.length) {
          this.omitCount += this.omitStep;
          iterations++;
        } else {
          break;
        }
      }
    }
  }
}

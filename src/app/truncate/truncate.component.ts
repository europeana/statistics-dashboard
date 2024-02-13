import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { HighlightMatchPipe } from '../_translate/highlight-match.pipe';
import { NgClass } from '@angular/common';
import { ResizeComponent } from '../resize/resize.component';

@Component({
  selector: 'app-truncate',
  templateUrl: './truncate.component.html',
  styleUrls: ['./truncate.component.scss'],
  standalone: true,
  imports: [ResizeComponent, NgClass, HighlightMatchPipe]
})
export class TruncateComponent implements OnInit {
  applySpace = false;
  maxRecursions = 100;
  omitCount = 0;
  omitStep = 2;
  textLeft: string;
  textRight: string;

  public debounceMS = 500;

  @Input() text: string;
  @Input() highlightText = '';
  @ViewChild('elRefTextLeft') elRefTextLeft: ElementRef;
  @ViewChild('elRefTextRight') elRefTextRight: ElementRef;

  ngOnInit(): void {
    if (!this.text) {
      return;
    }
    this.splitText();
  }

  /** isEllipsisActive
  /*
  /* detect if ellipsis are showing in the elRefTextLeft
  **/
  isEllipsisActive(): boolean {
    const el = this.elRefTextLeft.nativeElement;
    return (
      el.firstElementChild.getBoundingClientRect().width >
      el.getBoundingClientRect().width
    );
  }

  /** splitText
  /*
  /* Splites the text variable according to current omitCount settings
  /*
  /* @param { number: recursions } - track recursion depth
  **/
  splitText(recursions = 0): void {
    const textLength = this.text.length;
    const omit = Math.floor(this.omitCount / 2);
    const cutOff = Math.floor(textLength / 2);

    this.textLeft = this.text.substring(0, cutOff - omit);
    this.textRight = this.text.substring(cutOff + omit);

    this.applySpace =
      this.textLeft.endsWith(' ') || this.textRight.startsWith(' ');

    const fn = (): void => {
      this.callSplitText(recursions);
    };
    setTimeout(fn, 0);
  }

  /** callSplitText
  /*
  /* Companion function for splitText to call it recursively
  /*
  /* @param { number: recursions } - track recursion depth
  */
  callSplitText(recursions = 0): void {
    if (!this.isEllipsisActive()) {
      if (this.omitCount !== 0) {
        this.omitCount = Math.max(this.omitCount - this.omitStep, 0);
        this.splitText(this.maxRecursions);
      }
    } else {
      const wLeft =
        this.elRefTextLeft.nativeElement.getBoundingClientRect().width;
      const wRight =
        this.elRefTextRight.nativeElement.getBoundingClientRect().width;

      if (wRight > wLeft) {
        // omit more characters...
        this.omitCount += this.omitStep;
        if (recursions < this.maxRecursions) {
          this.splitText(recursions + 1);
        }
      }
    }
  }
}

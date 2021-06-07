import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { fromEvent } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

import { SubscriptionManager } from '../subscription-manager';

@Component({
  selector: 'app-truncate',
  templateUrl: './truncate.component.html',
  styleUrls: ['./truncate.component.scss']
})
export class TruncateComponent extends SubscriptionManager implements OnInit {
  applySpace = false;
  debounceMS = 500;
  maxRecursions = 100;
  omitCount = 0;
  omitStep = 2;
  textLeft: string;
  textRight: string;

  @Input() text: string;
  @ViewChild('elRefTextLeft') elRefTextLeft: ElementRef;
  @ViewChild('elRefTextRight') elRefTextRight: ElementRef;

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (!this.text) {
      return;
    }
    this.splitText();
    this.subs.push(
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(this.debounceMS),
          tap(() => {
            this.splitText();
          })
        )
        .subscribe()
    );
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

    this.textLeft = this.text.substr(0, cutOff - omit);
    this.textRight = this.text.substr(cutOff + omit);

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
      return;
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

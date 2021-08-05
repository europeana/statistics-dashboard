import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appIsScrollable]',
  exportAs: 'scrollInfo'
})
export class IsScrollableDirective {
  private changes: MutationObserver;

  canScrollBack = false;
  canScrollFwd = false;

  constructor(private elementRef: ElementRef) {
    const element = this.elementRef.nativeElement;

    this.changes = new MutationObserver((_: MutationRecord[]) => {
      this.calc();
    });

    this.changes.observe(element, {
      childList: true
    });
  }

  /** calc
  /* updates the variables
  /* - canScrollBack
  /* - canScrollFwd
  /* according to the element's relative width and scroll position
  */
  calc(): void {
    const el = this.elementRef.nativeElement;
    const sw = el.scrollWidth;
    const w = el.getBoundingClientRect().width;
    const sl = el.parentNode.scrollLeft;

    this.canScrollBack = sl > 0;
    this.canScrollFwd = sw > sl + w + 1;
  }

  /** nav
  /* updates the scroll offset
  */
  nav(direction: number): void {
    const el = this.elementRef.nativeElement;
    const diff = direction * parseInt(el.getBoundingClientRect().width);
    const newX = parseInt(el.parentNode.scrollLeft) + diff;

    el.parentNode.scrollTo(newX, 0);
    this.calc();
  }

  /** fwd
  /* wrapper function for nav
  */
  fwd(): void {
    this.nav(1);
  }

  /** back
  /* wrapper function for nav
  */
  back(): void {
    this.nav(-1);
  }
}
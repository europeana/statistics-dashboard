import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  inject,
  signal
} from '@angular/core';

@Directive({
  selector: '[appIsScrollable]',
  exportAs: 'scrollInfo',
  standalone: true
})
export class IsScrollableDirective implements AfterViewInit {
  private readonly changeDetector: ChangeDetectorRef =
    inject(ChangeDetectorRef);

  canScrollBack = signal(false);
  canScrollFwd = signal(false);

  constructor(private readonly elementRef: ElementRef) {
    const element = this.elementRef.nativeElement;

    new MutationObserver((_: MutationRecord[]) => {
      this.calc();
    }).observe(element, {
      childList: true
    });
  }

  ngAfterViewInit(): void {
    this.calc();
    this.changeDetector.detectChanges();
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

    this.canScrollBack.set(sl > 0);
    this.canScrollFwd.set(sw > sl + w + 1);
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

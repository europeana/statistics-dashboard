import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  signal
} from '@angular/core';

@Directive({
  selector: '[appIsScrollable]',
  exportAs: 'scrollInfo',
  standalone: true,
  host: {
    '(parent.scroll)': 'calc()'
  }
})
export class IsScrollableDirective implements AfterViewInit {
  private readonly elementRef = inject(ElementRef);

  readonly canScrollBack = signal(false);
  readonly canScrollFwd = signal(false);

  constructor() {
    const element = this.elementRef.nativeElement;

    new MutationObserver(() => {
      this.calc();
    }).observe(element, {
      childList: true
    });
  }

  ngAfterViewInit(): void {
    this.calc();
  }

  /** calc
  /* updates the reactive signal states
  */
  calc(): void {
    const el = this.elementRef.nativeElement;
    const parent = el.parentNode as HTMLElement;
    if (!parent) return;

    const sw = el.scrollWidth;
    const w = el.getBoundingClientRect().width;
    const sl = parent.scrollLeft;

    this.canScrollBack.set(sl > 0);
    this.canScrollFwd.set(sw > sl + w + 1);
  }

  /** nav
  /* updates the scroll offset
  */
  nav(direction: number): void {
    const el = this.elementRef.nativeElement;
    const parent = el.parentNode as HTMLElement;
    if (!parent) return;

    const diff = direction * el.getBoundingClientRect().width;
    const newX = parent.scrollLeft + diff;

    parent.scrollTo({ left: newX, behavior: 'auto' });
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

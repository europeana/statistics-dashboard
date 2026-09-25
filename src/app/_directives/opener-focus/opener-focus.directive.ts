import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: '[appOpenerFocus]',
  standalone: true
})
export class OpenerFocusDirective {
  fnHide = input<(event?: KeyboardEvent) => void>();

  constructor(private readonly elRef: ElementRef) {}

  hide(event: KeyboardEvent): void {
    const hideFn = this.fnHide();
    if (hideFn) {
      hideFn(event);
    }
  }

  @HostListener('keydown.tab', ['$event'])
  trap(event: KeyboardEvent): void {
    const focusables = this.elRef.nativeElement.querySelectorAll(
      'button, [href], input, [tabindex="0"]'
    );

    const first = focusables[0] as HTMLElement;
    const last = focusables[focusables.length - 1] as HTMLElement;

    if (last === event.target) {
      if (first === last) {
        this.hide(event);
      } else {
        event.preventDefault();
        first.focus();
      }
    }
  }

  /** escape
   *
   * - invokes supplied hide function
   * - sets focus to the first focusable item
   ***/
  @HostListener('keydown.escape', ['$event'])
  escape(event: KeyboardEvent): void {
    this.hide(event);

    const focusables = this.elRef.nativeElement.querySelectorAll(
      'button, [href], input, [tabindex="0"]'
    );

    if (focusables.length) {
      (focusables[0] as HTMLElement).focus();
    }
  }
}

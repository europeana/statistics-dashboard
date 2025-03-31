import { Input, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appOpenerFocus]'
})
export class OpenerFocusDirective {
  @Input() fnHide: (event?: KeyboardEvent) => void;

  constructor(private elRef: ElementRef) {}

  hide(event: KeyboardEvent): void {
    if (this.fnHide) {
      this.fnHide(event);
    }
  }

  @HostListener('keydown.tab', ['$event'])
  trap(event: KeyboardEvent): void {
    const focusables = this.elRef.nativeElement.querySelectorAll(
      'button, [href], input, [tabindex="0"]'
    );

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

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
      focusables[0].focus();
    }
  }
}

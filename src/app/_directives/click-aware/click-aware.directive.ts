import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClickService } from '../../_services';

@Directive({
  selector: '[appClickAware]',
  exportAs: 'clickInfo',
  standalone: true
})
export class ClickAwareDirective {
  readonly clickOutside = output<void>();
  readonly includeClicksOnClasses = input<string[]>([]);

  private readonly clickService = inject(ClickService);
  private readonly elementRef = inject(ElementRef);

  isClickedInside = false;

  /**
   *  constructor
   *  subscribe to the global document click host listener with automatic unsubscribe
   */
  constructor() {
    this.clickService.documentClickedTarget
      .pipe(takeUntilDestroyed())
      .subscribe((target: HTMLElement) => {
        this.documentClickListener(this.elementRef.nativeElement, target);
      });
  }

  /**
   *  documentClickListener
   *   update isClickedInside
   *   emit event if outside
   */
  documentClickListener(
    nativeElement: HTMLElement,
    clickTarget: HTMLElement
  ): void {
    this.isClickedInside = nativeElement.contains(clickTarget);

    const classesToInclude = this.includeClicksOnClasses();

    if (!this.isClickedInside && classesToInclude.length > 0) {
      let node: ParentNode | null = clickTarget.parentNode;
      while (node) {
        const classList = (node as HTMLElement).classList;
        if (classList) {
          classesToInclude.forEach((includedClass: string) => {
            if (classList.contains(includedClass)) {
              this.isClickedInside = true;
            }
          });
        }
        node = node.parentNode;
      }
    }

    if (!this.isClickedInside) {
      this.clickOutside.emit();
    }
  }
}

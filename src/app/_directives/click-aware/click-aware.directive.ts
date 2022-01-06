import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { SubscriptionManager } from '../../subscription-manager';
import { ClickService } from '../../_services';

@Directive({
  selector: '[appClickAware]',
  exportAs: 'clickInfo'
})
export class ClickAwareDirective extends SubscriptionManager {
  @Output() clickOutside: EventEmitter<void> = new EventEmitter();
  @Input() includeClicksOnClass: string;

  isClickedInside = false;

  /**
   *  constructor
   *  subscribe to the global document click host listener via the clickService
   */
  constructor(
    private readonly clickService: ClickService,
    private readonly elementRef: ElementRef
  ) {
    super();
    this.subs.push(
      this.clickService.documentClickedTarget.subscribe(
        (target: HTMLElement) => {
          this.documentClickListener(this.elementRef.nativeElement, target);
        }
      )
    );
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

    if (!this.isClickedInside && this.includeClicksOnClass) {
      let node = clickTarget.parentNode;
      while (node) {
        const classList = (node as unknown as HTMLElement).classList;
        if (classList) {
          classList.forEach((className: string) => {
            if (className === this.includeClicksOnClass) {
              this.isClickedInside = true;
            }
          });
        }
        node = node.parentNode as unknown as HTMLElement;
      }
    }

    if (!this.isClickedInside) {
      this.clickOutside.emit();
    }
  }
}

import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import { SubscriptionManager } from '../../subscription-manager';
import { ClickService } from '../../_services';

@Directive({
  selector: '[appClickAware]',
  exportAs: 'clickInfo'
})
export class ClickAwareDirective extends SubscriptionManager {
  @Output() clickOutside: EventEmitter<void> = new EventEmitter();

  isClickedInside = false;

  /**
   *  constructor
   *  subscribe to the global document click host listener via the clickService
   */
  constructor(
    private clickService: ClickService,
    private elementRef: ElementRef
  ) {
    super();
    console.log('c aware');
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
    if (!this.isClickedInside) {
      this.clickOutside.emit();
    }
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SubscriptionManager } from '../subscription-manager';

@Component({
  selector: 'app-resize',
  template: ''
})
export class ResizeComponent extends SubscriptionManager implements OnInit {
  @Input() time = 200;
  @Output() sizeChanged = new EventEmitter<boolean>();

  public ngOnInit(): void {
    this.subs.push(
      fromEvent(window, 'resize')
        .pipe(debounceTime(this.time))
        .subscribe(() => {
          this.sizeChanged.emit(true);
        })
    );
  }
}

import { Component, effect, EventEmitter, input, Output } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-resize',
  template: '',
  standalone: true
})
export class ResizeComponent {
  time = input<number>(200);

  @Output() sizeChanged = new EventEmitter<boolean>();

  constructor() {
    effect((onCleanup) => {
      const resizeSubscription = fromEvent(window, 'resize')
        .pipe(debounceTime(this.time()))
        .subscribe(() => {
          this.sizeChanged.emit(true);
        });

      onCleanup(() => {
        resizeSubscription.unsubscribe();
      });
    });
  }
}

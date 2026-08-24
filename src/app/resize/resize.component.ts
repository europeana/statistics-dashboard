import {
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  output
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-resize',
  template: '',
  standalone: true
})
export class ResizeComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  time = input<number>(200);

  sizeChanged = output<boolean>();

  private resizeSubscription?: Subscription;

  ngOnInit(): void {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(this.time()))
      .subscribe(() => {
        this.sizeChanged.emit(true);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }
}

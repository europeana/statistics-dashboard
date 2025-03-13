import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LineService {
  lineChartIsReady = new Subject<true>();
  lineChartReady: Observable<true> = this.lineChartIsReady
    .asObservable()
    .pipe(take(1));

  setLineChartReady(): void {
    this.lineChartIsReady.next(true);
  }
}

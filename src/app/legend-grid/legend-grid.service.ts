import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LegendGridService {
  legendGridIsReady = new Subject<boolean>();
  legendGridReady: Observable<boolean> = this.legendGridIsReady.asObservable();

  setLegendGridReady(value: boolean): void {
    this.legendGridIsReady.next(value);
  }
}

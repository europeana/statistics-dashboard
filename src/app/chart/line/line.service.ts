import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LineService {
  private readonly _lineChartReady = signal<boolean>(false);
  readonly lineChartReady = this._lineChartReady.asReadonly();

  setLineChartReady(value: boolean): void {
    this._lineChartReady.set(value);
  }
}

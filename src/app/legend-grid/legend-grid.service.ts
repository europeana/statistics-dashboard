import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LegendGridService {
  private readonly _legendGridReady = signal<boolean>(false);
  readonly legendGridReady = this._legendGridReady.asReadonly();

  setLegendGridReady(value: boolean): void {
    this._legendGridReady.set(value);
  }
}

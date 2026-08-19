import { Component, forwardRef } from '@angular/core';
import { SnapshotsComponent } from '../snapshots';
import { IdValue, IHash, NamesValuePercent } from '../_models';

export interface SnapshotData {
  name: string;
  label: string;
  data: IHash<number>;
}

@Component({
  selector: 'app-snapshots',
  template: '',
  standalone: true,
  providers: [
    {
      provide: SnapshotsComponent,
      useExisting: forwardRef(() => MockSnapshotsComponent)
    }
  ]
})
export class MockSnapshotsComponent {
  filteredCDKeys(): string[] {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  apply(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unapply(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  snap(_facet: string, _name: string, _data: SnapshotData): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  preSortAndFilter(): void {}

  getSeriesDataForGrid(): NamesValuePercent[] {
    return [];
  }

  getSeriesDataForChart(
    _facet: string,
    _keys: string[],
    _percent: boolean,
    _maxBars: number
  ): IdValue[] {
    return [];
  }
}

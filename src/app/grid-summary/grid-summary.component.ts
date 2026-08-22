import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { BreakdownResult } from '../_models';
import { DimensionName } from '../_data';
import { RenameApiFacetShortPipe, RenameCountryPipe } from '../_translate';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-grid-summary',
  templateUrl: './grid-summary.component.html',
  styleUrls: ['./grid-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RenameApiFacetShortPipe, RenameCountryPipe]
})
export class GridSummaryComponent {
  public readonly DimensionName = DimensionName;

  grandTotal = input<number>(0);
  summaryDataInput = input<BreakdownResult | undefined>(undefined, {
    alias: 'summaryData'
  });

  summaryData = computed(() => {
    const data = this.summaryDataInput();
    if (!data) return undefined;
    return {
      ...data,
      results: [...data.results].sort((a, b) => b.count - a.count)
    };
  });
}

import { Component, computed, input } from '@angular/core';
import { BreakdownResult, CountPercentageValue } from '../_models';
import { DimensionName } from '../_data';
import { RenameApiFacetShortPipe, RenameCountryPipe } from '../_translate';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-grid-summary',
  templateUrl: './grid-summary.component.html',
  styleUrls: ['./grid-summary.component.scss'],
  imports: [DecimalPipe, RenameApiFacetShortPipe, RenameCountryPipe]
})
export class GridSummaryComponent {
  public DimensionName = DimensionName;

  grandTotal = input<number>(0);
  summaryDataInput = input<BreakdownResult | undefined>(undefined, {
    alias: 'summaryData'
  });
  summaryData = computed(() => {
    const data = this.summaryDataInput();
    if (!data) {
      return undefined;
    }

    const cloned = structuredClone(data);
    cloned.results.sort((a: CountPercentageValue, b: CountPercentageValue) => {
      if (a.count > b.count) return -1;
      if (b.count > a.count) return 1;
      return 0;
    });
    return cloned;
  });
}

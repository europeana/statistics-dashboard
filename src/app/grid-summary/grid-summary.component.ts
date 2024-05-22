import { Component, Input } from '@angular/core';
import { BreakdownResult, CountPercentageValue } from '../_models';
import { RenameApiFacetShortPipe } from '../_translate/rename-facet-short.pipe';
import { DecimalPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-grid-summary',
  templateUrl: './grid-summary.component.html',
  styleUrls: ['./grid-summary.component.scss'],
  standalone: true,
  imports: [NgIf, DecimalPipe, RenameApiFacetShortPipe]
})
export class GridSummaryComponent {
  _summaryData: BreakdownResult;
  @Input() grandTotal: number;

  get summaryData(): BreakdownResult {
    return this._summaryData;
  }
  @Input() set summaryData(data: BreakdownResult) {
    this._summaryData = structuredClone(data);
    if (data) {
      this._summaryData.results.sort(
        (a: CountPercentageValue, b: CountPercentageValue) => {
          if (a.count > b.count) {
            return -1;
          } else if (b.count > a.count) {
            return 1;
          }
          return 0;
        }
      );
    }
  }
}

import { Component, Input } from '@angular/core';
import { BreakdownResult, CountPercentageValue } from '../_models';

@Component({
  selector: 'app-grid-summary',
  templateUrl: './grid-summary.component.html',
  styleUrls: ['./grid-summary.component.scss']
})
export class GridSummaryComponent {
  _summaryData: BreakdownResult;
  @Input() grandTotal: number;
  @Input() set summaryData(data: BreakdownResult) {
    this._summaryData = Object.assign({}, data);
    if (data) {
      this._summaryData.results.sort(
        (a: CountPercentageValue, b: CountPercentageValue) => {
          return a.count > b.count ? -1 : b.count > a.count ? 1 : 0;
        }
      );
    }
  }
}

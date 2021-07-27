import { Component, Input } from '@angular/core';
import { FacetProcessed, FacetFieldProcessed } from '../_models';

@Component({
  selector: 'app-grid-summary',
  templateUrl: './grid-summary.component.html',
  styleUrls: ['./grid-summary.component.scss']
})
export class GridSummaryComponent {
  _summaryData: FacetProcessed;
  @Input() grandTotal: number = 2;
  @Input() set summaryData(data: FacetProcessed) {
    this._summaryData = Object.assign({}, data);
    this._summaryData.fields.sort(
      (a: FacetFieldProcessed, b: FacetFieldProcessed) => {
        return a.count > b.count ? -1 : b.count > a.count ? 1 : 0;
      }
    );
  }
}

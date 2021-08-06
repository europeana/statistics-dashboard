import { Component } from '@angular/core';
import { DataPollingComponent } from '../data-polling';
import {
  BreakdownResult,
  CountPercentageValue,
  GeneralResults,
  NameValuePercent
} from '../_models';
import { APIService } from '../_services';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent extends DataPollingComponent {
  barColour = '#0771ce';
  isLoading = true;

  splashData: {
    [facetName: string]: Array<NameValuePercent>;
  } = {};

  constructor(private api: APIService) {
    super();
    this.beginPolling();
  }

  toNameValuePercent(cpv: CountPercentageValue): NameValuePercent {
    return {
      name: cpv.value,
      value: cpv.count,
      percent: cpv.percentage
    };
  }

  beginPolling(): void {
    this.createNewDataPoller(
      60 * 100000,
      () => {
        this.isLoading = true;
        return this.api.getGeneralResults();
      },
      (general: GeneralResults) => {
        this.isLoading = false;
        general.allBreakdowns.forEach((br: BreakdownResult) => {
          this.splashData[br.by] = br.results.map((x) => {
            return this.toNameValuePercent(x);
          });
        });
      }
    );
  }
}

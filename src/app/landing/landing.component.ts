import { Component } from '@angular/core';
import { externalLinks } from '../_data';
import {
  BreakdownResult,
  CountPercentageValue,
  DimensionName,
  GeneralResults,
  NamesValuePercent
} from '../_models';
import { APIService } from '../_services';
import { SubscriptionManager } from '../subscription-manager';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent extends SubscriptionManager {
  public externalLinks = externalLinks;
  public DimensionName = DimensionName;

  barColour = '#0771ce';
  isLoading = true;

  landingData: {
    [facetName: string]: Array<NamesValuePercent>;
  } = {};

  constructor(private readonly api: APIService) {
    super();
    this.loadData();
  }

  toNameValuePercent(cpv: CountPercentageValue): NamesValuePercent {
    return {
      name: cpv.value,
      value: cpv.count,
      percent: cpv.percentage
    };
  }

  /** loadData
  /* - loads the general breakdown data
  */
  loadData(): void {
    this.isLoading = true;
    this.subs.push(
      this.api.getGeneralResults().subscribe((general: GeneralResults) => {
        this.isLoading = false;
        general.allBreakdowns.forEach((br: BreakdownResult) => {
          this.landingData[br.breakdownBy] = br.results.map((x) => {
            return this.toNameValuePercent(x);
          });
        });
      })
    );
  }
}
